import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { getStore, resetStore } from '../services/store';
import { removePost } from '../services/feedService';
import type { FeedPost, ContentCategory } from '../types/index';

// Mock the simulateLatency utility
vi.mock('../services/mockUtils', () => ({
  simulateLatency: () => Promise.resolve(),
  generateId: () => Math.random().toString(),
  nowISO: () => new Date().toISOString()
}));

describe('Moderation Property Tests', () => {
  beforeEach(() => {
    resetStore();
  });

  // Feature: creator-link, Property 17: Post Removal Notifies Creator
  it('marks post as removed and creates exactly one notification for author', () => {
    const categories: ContentCategory[] = ['beauty', 'fitness', 'tech', 'lifestyle'];

    const postArbitrary = fc.record({
      id: fc.string({ minLength: 3 }),
      type: fc.constant('portfolio_update'),
      authorId: fc.string({ minLength: 3 }),
      authorRole: fc.constant('creator'),
      campaignId: fc.constant(null),
      title: fc.string({ minLength: 1 }),
      body: fc.string({ minLength: 1 }),
      category: fc.constantFrom(...categories),
      collaborationMatchScore: fc.integer({ min: 0, max: 100 }),
      aiRecommendationTag: fc.constant(null),
      publishedAt: fc.string(),
      removed: fc.constant(false)
    });

    fc.assert(
      fc.property(
        postArbitrary,
        fc.option(fc.string({ minLength: 1 })),
        (postData, rawReason) => {
          const store = getStore();

          // Reset maps specifically for clean iterations
          store.feedPosts.clear();
          store.notifications.clear();

          // Clean up the reason input to avoid whitespace-only string mismatches
          const reason = rawReason ? rawReason.trim() : null;

          // Add post to store
          store.feedPosts.set(postData.id, postData as FeedPost);

          // Remove the post
          removePost(postData.id, reason || undefined);

          // Assertions
          const updatedPost = store.feedPosts.get(postData.id);
          expect(updatedPost).toBeDefined();
          expect(updatedPost?.removed).toBe(true);

          // Verify notifications map
          const notifications = Array.from(store.notifications.values()).filter(
            (n) => n.userId === postData.authorId && n.type === 'post_removed'
          );
          expect(notifications.length).toBe(1);
          expect(notifications[0].title).toBe('Post Removed');

          const expectedReason = reason || 'Your post was removed for violating community guidelines.';
          expect(notifications[0].body).toBe(expectedReason);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
