import type { Application, ApplicationStatus } from '../types/index';
import { getStore } from './store';
import { generateId, nowISO, simulateLatency } from './mockUtils';
import { computeCollaborationMatchScore } from '../lib/scoreEngine';
import { generateAIPitch } from '../lib/aiMock';
import { createNotification } from './notificationService';

export class ApplicationError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function createApplication(
  creatorId: string,
  campaignId: string,
  portfolioItemIds?: string[]
): Promise<Application> {
  const store = getStore();

  // Duplicate guard
  const existing = Array.from(store.applications.values()).find(
    (a) => a.creatorId === creatorId && a.campaignId === campaignId &&
      (a.status === 'pending' || a.status === 'approved')
  );
  if (existing) throw new ApplicationError('duplicate', `Application already exists with status: ${existing.status}`);

  const creator = store.creators.get(creatorId);
  const campaign = store.campaigns.get(campaignId);
  if (!creator || !campaign) throw new ApplicationError('not_found', 'Creator or Campaign not found.');

  // Parse preferences
  const reqStr = campaign.requirements || '';
  const minTrustMatch = reqStr.match(/Min Trust Score:\s*(\d+)/i);
  const campaignMinTrustScore = minTrustMatch ? parseInt(minTrustMatch[1]) : 0;

  const minQualityMatch = reqStr.match(/Min Content Quality Score:\s*(\d+)/i);
  const campaignMinContentQuality = minQualityMatch ? parseInt(minQualityMatch[1]) : 0;

  // Compute match score
  const matchScore = computeCollaborationMatchScore({
    creatorCategories: creator.contentCategories,
    campaignCategories: campaign.contentCategories,
    creatorTrustScore: creator.trustScore,
    campaignMinTrustScore,
    campaignMinContentQuality,
    audienceAgeGroups: creator.insights.audienceDemographics.ageGroups,
    campaignTargetAgeGroups: [],
  });

  // AI pitch (with latency)
  const aiPitch = await generateAIPitch(creator, campaign);

  // Pre-select up to 3 most relevant portfolio items
  const selectedItems = portfolioItemIds?.slice(0, 3) ??
    creator.portfolio
      .filter((item) => campaign.contentCategories.includes(item.category))
      .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
      .slice(0, 3)
      .map((item) => item.id);

  const application: Application = {
    id: generateId(),
    campaignId,
    creatorId,
    aiPitch,
    editedPitch: aiPitch,
    selectedPortfolioItems: selectedItems,
    status: 'pending',
    collaborationMatchScore: matchScore,
    submittedAt: nowISO(),
    reviewedAt: null,
  };
  store.applications.set(application.id, application);

  // Update creator collaboration history
  const updatedCreator = store.creators.get(creatorId)!;
  const alreadyInHistory = updatedCreator.collaborationHistory.some((r) => r.campaignId === campaignId);
  if (!alreadyInHistory) {
    store.creators.set(creatorId, {
      ...updatedCreator,
      collaborationHistory: [
        ...updatedCreator.collaborationHistory,
        { campaignId, brandId: campaign.brandId, status: 'pending', startDate: null, endDate: null },
      ],
    });
  }

  // Update applicantCount on campaign
  store.campaigns.set(campaignId, { ...campaign, applicantCount: campaign.applicantCount + 1 });

  // Confirmation notification to creator
  const creatorUser = store.users.get(creator.userId);
  if (creatorUser) {
    createNotification(creatorUser.id, 'application_received', 'Application Submitted', `Your application for "${campaign.title}" has been received.`);
  }

  return application;
}

export async function updateApplication(
  appId: string,
  editedPitch: string,
  portfolioItemIds: string[]
): Promise<Application> {
  await simulateLatency(100, 300);
  const store = getStore();
  const app = store.applications.get(appId);
  if (!app) throw new ApplicationError('not_found', 'Application not found.');
  const updated: Application = { ...app, editedPitch, selectedPortfolioItems: portfolioItemIds.slice(0, 3) };
  store.applications.set(appId, updated);
  return updated;
}

export async function processSwipe(
  appId: string,
  direction: 'approve' | 'decline' | 'waitlist'
): Promise<Application> {
  await simulateLatency(150, 400);
  const store = getStore();
  const app = store.applications.get(appId);
  if (!app) throw new ApplicationError('not_found', 'Application not found.');

  const statusMap: Record<typeof direction, ApplicationStatus> = {
    approve: 'approved',
    decline: 'declined',
    waitlist: 'waitlisted',
  };
  const updated: Application = { ...app, status: statusMap[direction], reviewedAt: nowISO() };
  store.applications.set(appId, updated);

  // Notify creator on approve/decline only
  if (direction !== 'waitlist') {
    const creator = store.creators.get(app.creatorId);
    if (creator) {
      const user = store.users.get(creator.userId);
      const campaign = store.campaigns.get(app.campaignId);
      if (user && campaign) {
        const type = direction === 'approve' ? 'application_approved' : 'application_declined';
        const title = direction === 'approve' ? 'Application Approved!' : 'Application Update';
        const body = direction === 'approve'
          ? `Congratulations! Your application for "${campaign.title}" has been approved.`
          : `Your application for "${campaign.title}" was not selected at this time.`;
        createNotification(user.id, type, title, body);
      }
    }
  }

  return updated;
}

export async function undoSwipe(appId: string, previousStatus: ApplicationStatus): Promise<Application> {
  await simulateLatency(100, 300);
  const store = getStore();
  const app = store.applications.get(appId);
  if (!app) throw new ApplicationError('not_found', 'Application not found.');
  const restored: Application = { ...app, status: previousStatus, reviewedAt: null };
  store.applications.set(appId, restored);
  return restored;
}

export async function getApplicationsForCampaign(campaignId: string): Promise<Application[]> {
  await simulateLatency(100, 400);
  const store = getStore();
  return Array.from(store.applications.values()).filter((a) => a.campaignId === campaignId);
}

export async function getApplicationByCreatorAndCampaign(
  creatorId: string,
  campaignId: string
): Promise<Application | null> {
  const store = getStore();
  return Array.from(store.applications.values()).find(
    (a) => a.creatorId === creatorId && a.campaignId === campaignId
  ) ?? null;
}
