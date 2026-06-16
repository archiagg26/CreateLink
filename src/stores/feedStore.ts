import { create } from 'zustand';
import type { FeedPost, FeedFilters } from '../types/index';
import * as feedService from '../services/feedService';

interface FeedStore {
  posts: FeedPost[];
  filters: Partial<FeedFilters>;
  loadFeed: () => Promise<void>;
  setFilters: (filters: Partial<FeedFilters>) => void;
  publishPost: (post: Omit<FeedPost, 'id' | 'publishedAt' | 'removed'>) => Promise<void>;
  removePost: (id: string) => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  filters: {},

  loadFeed: async () => {
    const { filters } = get();
    const posts = await feedService.loadFeed(filters);
    set({ posts });
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    get().loadFeed();
  },

  publishPost: async (post) => {
    await feedService.publishPost(post);
    await get().loadFeed();
  },

  removePost: (id) => {
    feedService.removePost(id);
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }));
  },
}));
