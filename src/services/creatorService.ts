import type { Creator, PortfolioItem } from '../types/index';
import { getStore } from './store';
import { simulateLatency } from './mockUtils';
import { computeCreatorTrustScore } from '../lib/scoreEngine';
import { recordScoreAudit } from '../lib/auditLog';
import { createNotification } from './notificationService';

export async function getCreator(id: string): Promise<Creator | null> {
  await simulateLatency(100, 400);
  const store = getStore();
  return store.creators.get(id) ?? null;
}

export async function getCreatorByUserId(userId: string): Promise<Creator | null> {
  await simulateLatency(100, 300);
  const store = getStore();
  return Array.from(store.creators.values()).find((c) => c.userId === userId) ?? null;
}

export async function updatePortfolio(creatorId: string, items: PortfolioItem[]): Promise<Creator> {
  await simulateLatency(200, 600);
  const store = getStore();
  const creator = store.creators.get(creatorId);
  if (!creator) throw new Error(`Creator ${creatorId} not found`);

  const oldScore = creator.trustScore;
  const updated: Creator = { ...creator, portfolio: items };

  // Recompute trust score
  const inputs = buildTrustScoreInputs(updated);
  const { score, partialData } = computeCreatorTrustScore(inputs);
  recordScoreAudit(creatorId, 'creator', inputs as Record<string, number>, {}, score);

  const finalCreator: Creator = { ...updated, trustScore: score, trustScorePartialData: partialData };
  store.creators.set(creatorId, finalCreator);

  // Notify if score delta > 2
  if (Math.abs(score - oldScore) > 2) {
    const user = store.users.get(creator.userId);
    if (user) {
      createNotification(
        user.id,
        'trust_score_change',
        'Your Trust Score Changed',
        `Your Creator Trust Score has changed from ${oldScore} to ${score}.`
      );
    }
  }

  return finalCreator;
}

export async function refreshTrustScore(creatorId: string): Promise<Creator> {
  const store = getStore();
  const creator = store.creators.get(creatorId);
  if (!creator) throw new Error(`Creator ${creatorId} not found`);
  const oldScore = creator.trustScore;
  const inputs = buildTrustScoreInputs(creator);
  const { score, partialData } = computeCreatorTrustScore(inputs);
  recordScoreAudit(creatorId, 'creator', inputs as Record<string, number>, {}, score);
  const updated: Creator = { ...creator, trustScore: score, trustScorePartialData: partialData };
  store.creators.set(creatorId, updated);
  if (Math.abs(score - oldScore) > 2) {
    const user = store.users.get(creator.userId);
    if (user) {
      createNotification(user.id, 'trust_score_change', 'Your Trust Score Changed', `Your Creator Trust Score is now ${score}.`);
    }
  }
  return updated;
}

export async function submitVerification(creatorId: string): Promise<Creator> {
  await simulateLatency(300, 700);
  const store = getStore();
  const creator = store.creators.get(creatorId);
  if (!creator) throw new Error(`Creator ${creatorId} not found`);
  const updated: Creator = { ...creator, verificationStatus: 'pending' };
  store.creators.set(creatorId, updated);
  const user = store.users.get(creator.userId);
  if (user) {
    store.users.set(user.id, { ...user, verificationStatus: 'pending' });
    createNotification(user.id, 'verification_update', 'Verification Submitted', 'Your verification is under review. You will hear back within 5 business days.');
  }
  return updated;
}

export async function disconnectSocialAccount(creatorId: string, platform: string): Promise<Creator> {
  await simulateLatency(200, 500);
  const store = getStore();
  const creator = store.creators.get(creatorId);
  if (!creator) throw new Error(`Creator ${creatorId} not found`);
  const updatedAccounts = creator.socialAccounts.map((a) =>
    a.platform === platform ? { ...a, connected: false } : a
  );
  const allDisconnected = updatedAccounts.every((a) => !a.connected);
  let verificationStatus = creator.verificationStatus;
  if (allDisconnected && verificationStatus === 'verified') {
    verificationStatus = 'unverified';
    const user = store.users.get(creator.userId);
    if (user) {
      store.users.set(user.id, { ...user, verificationStatus: 'unverified' });
      createNotification(user.id, 'verification_update', 'Verification Revoked', 'Your verification status has been revoked because all connected social accounts were disconnected.');
    }
  }
  const updated: Creator = { ...creator, socialAccounts: updatedAccounts, verificationStatus };
  store.creators.set(creatorId, updated);
  return updated;
}

function buildTrustScoreInputs(creator: Creator): Partial<Record<string, number>> {
  // Mock: derive inputs from available creator data
  const hasCollaborations = creator.collaborationHistory.length > 0;
  return {
    audienceAuthenticity: creator.socialAccounts.some((s) => s.connected) ? 0.8 : undefined,
    commentQualityScore: creator.portfolio.length > 0 ? 0.75 : undefined,
    followerGrowthPattern: creator.socialAccounts.some((s) => s.connected) ? 0.7 : undefined,
    engagementConsistency: creator.insights.averageEngagementRate > 0 ? Math.min(1, creator.insights.averageEngagementRate * 5) : undefined,
    brandCollaborationSuccessRate: hasCollaborations ? creator.insights.successRate : undefined,
  };
}
