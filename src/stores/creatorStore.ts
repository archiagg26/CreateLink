import { create } from 'zustand';
import type { Creator, PortfolioItem } from '../types/index';
import * as creatorService from '../services/creatorService';

interface CreatorStore {
  creator: Creator | null;
  loadCreator: (id: string) => Promise<void>;
  updatePortfolio: (items: PortfolioItem[]) => Promise<void>;
  refreshTrustScore: () => Promise<void>;
}

export const useCreatorStore = create<CreatorStore>((set, get) => ({
  creator: null,

  loadCreator: async (id) => {
    // Try direct creator ID first, then fall back to userId lookup
    let creator = await creatorService.getCreator(id);
    if (!creator) {
      creator = await creatorService.getCreatorByUserId(id);
    }
    // If still not found, create a stub profile on-the-fly for new registered users
    if (!creator) {
      const { getStore } = await import('../services/store');
      const store = getStore();
      const user = store.users.get(id);
      if (user && user.role === 'creator') {
        const stub: Creator = {
          id: `creator-${user.id}`,
          userId: user.id,
          displayName: user.email.split('@')[0],
          bio: 'Content creator on CreatorLink.',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
          contentCategories: ['lifestyle'],
          socialAccounts: [],
          trustScore: 0,
          trustScorePartialData: true,
          portfolio: [],
          collaborationHistory: [],
          insights: {
            audienceDemographics: {
              ageGroups: { '18-24': 0.4, '25-34': 0.4, '35-44': 0.15, '45+': 0.05 },
              topCountries: ['India'],
              genderSplit: { male: 0.5, female: 0.45, other: 0.05 },
            },
            primaryCategories: ['lifestyle'],
            averageEngagementRate: 0,
            collaborationCount: 0,
            successRate: 0,
          },
          verificationStatus: 'unverified',
        };
        store.creators.set(stub.id, stub);
        creator = stub;
      }
    }
    set({ creator });
  },

  updatePortfolio: async (items) => {
    const { creator } = get();
    if (!creator) throw new Error('No creator loaded');
    const updated = await creatorService.updatePortfolio(creator.id, items);
    set({ creator: updated });
  },

  refreshTrustScore: async () => {
    const { creator } = get();
    if (!creator) throw new Error('No creator loaded');
    const updated = await creatorService.refreshTrustScore(creator.id);
    set({ creator: updated });
  },
}));
