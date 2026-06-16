import { create } from 'zustand';
import type { Application } from '../types/index';
import * as applicationService from '../services/applicationService';
import { rankApplications } from '../lib/aiMock';

interface SwipeStore {
  queue: Application[];
  lastSwiped: Application | null;
  undoAvailable: boolean;
  loadApplications: (campaignId: string) => Promise<void>;
  rankByMatchScore: () => void;
  swipe: (appId: string, direction: 'approve' | 'decline' | 'waitlist') => Promise<void>;
  undo: () => Promise<void>;
}

let undoTimeout: ReturnType<typeof setTimeout> | null = null;

export const useSwipeStore = create<SwipeStore>((set, get) => ({
  queue: [],
  lastSwiped: null,
  undoAvailable: false,

  loadApplications: async (campaignId) => {
    const apps = await applicationService.getApplicationsForCampaign(campaignId);
    const pending = apps.filter((a) => a.status === 'pending');
    set({ queue: pending });
  },

  rankByMatchScore: () => {
    const { queue } = get();
    set({ queue: rankApplications(queue) });
  },

  swipe: async (appId, direction) => {
    const { queue } = get();
    const app = queue.find((a) => a.id === appId);
    if (!app) return;

    await applicationService.processSwipe(appId, direction);

    set({
      queue: queue.filter((a) => a.id !== appId),
      lastSwiped: { ...app },
      undoAvailable: true,
    });

    if (undoTimeout) clearTimeout(undoTimeout);
    undoTimeout = setTimeout(() => {
      set({ undoAvailable: false, lastSwiped: null });
    }, 5000);
  },

  undo: async () => {
    const { lastSwiped, queue } = get();
    if (!lastSwiped) return;

    await applicationService.undoSwipe(lastSwiped.id, 'pending');

    set({
      queue: [lastSwiped, ...queue],
      undoAvailable: false,
      lastSwiped: null,
    });

    if (undoTimeout) {
      clearTimeout(undoTimeout);
      undoTimeout = null;
    }
  },
}));
