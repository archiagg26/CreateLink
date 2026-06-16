import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fc from 'fast-check';
import FeedCard from '../../components/feed/FeedCard';
import type { FeedPost, ContentCategory } from '../../types/index';

// Mock the Auth Store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    currentUser: { id: 'creator-1', role: 'creator' }
  })
}));

describe('FeedCard Property Tests', () => {
  // Feature: creator-link, Property 16: Feed Card Display Completeness
  it('correctly displays all fields based on FeedPost type (campaign vs creator)', () => {
    const categories: ContentCategory[] = [
      'beauty', 'fitness', 'tech', 'food', 'travel',
      'gaming', 'lifestyle', 'finance', 'education', 'fashion'
    ];

    const safeString = (prefix: string) =>
      fc.string({ minLength: 5 }).map((s) => prefix + '_' + s.replace(/[^a-zA-Z0-9]/g, 'x'));

    const campaignPostArbitrary = fc.record({
      id: safeString('id'),
      type: fc.constant('campaign'),
      authorId: safeString('auth'),
      authorRole: fc.constant('brand'),
      campaignId: safeString('camp'),
      title: safeString('title'),
      body: safeString('body'),
      category: fc.constantFrom(...categories),
      collaborationMatchScore: fc.integer({ min: 0, max: 100 }),
      aiRecommendationTag: fc.option(safeString('tag')),
      publishedAt: fc.string(),
      removed: fc.constant(false)
    });

    const creatorPostArbitrary = fc.record({
      id: safeString('id'),
      type: fc.constant('portfolio_update'),
      authorId: safeString('auth'),
      authorRole: fc.constant('creator'),
      campaignId: fc.constant(null),
      title: safeString('title'),
      body: safeString('body'),
      category: fc.constantFrom(...categories),
      collaborationMatchScore: fc.integer({ min: 0, max: 100 }),
      aiRecommendationTag: fc.constant(null),
      publishedAt: fc.string(),
      removed: fc.constant(false)
    });

    // Run property assertions
    fc.assert(
      fc.property(
        fc.oneof(campaignPostArbitrary, creatorPostArbitrary),
        (post) => {
          const { unmount } = render(
            <MemoryRouter>
              <FeedCard
                post={post as FeedPost}
                onApply={() => {}}
                onContact={() => {}}
              />
            </MemoryRouter>
          );

          // Check common elements
          expect(screen.getByText(post.title)).toBeTruthy();
          expect(screen.getByText(post.body)).toBeTruthy();
          expect(screen.getByText(post.category)).toBeTruthy();

          if (post.type === 'campaign') {
            // Check campaign specific buttons & badges
            expect(screen.getByRole('button', { name: /Apply Now/i })).toBeTruthy();
            expect(screen.getByRole('button', { name: /Save/i })).toBeTruthy();
            if (post.collaborationMatchScore !== null) {
              expect(screen.getByText('Match')).toBeTruthy();
            }
          } else {
            // Check creator specific buttons & badges
            expect(screen.getByRole('button', { name: /Contact Creator/i })).toBeTruthy();
            if (post.collaborationMatchScore !== null) {
              expect(screen.getByText('Trust Score')).toBeTruthy();
            }
          }

          unmount();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
