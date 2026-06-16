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
