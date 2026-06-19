import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreatorProfilePage from '../../pages/CreatorProfilePage';
import type { ContentCategory, Creator } from '../../types/index';

// Mock the simulateLatency utility
vi.mock('../../services/mockUtils', () => ({
  simulateLatency: () => Promise.resolve(),
  generateId: () => Math.random().toString(),
  nowISO: () => new Date().toISOString()
}));

// Mock the stores stably to prevent infinite render loops in useEffect dependencies
const mockLoadCreator = vi.fn().mockResolvedValue(undefined);
let activeCreator: Creator | null = null;

const stableCreatorStore = {
  creator: null as Creator | null,
  loadCreator: mockLoadCreator
};

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    currentUser: { id: 'creator-1', role: 'creator' }
  })
}));

vi.mock('../../stores/creatorStore', () => ({
  useCreatorStore: () => {
    stableCreatorStore.creator = activeCreator;
    return stableCreatorStore;
  }
}));

describe('CreatorProfilePage Property Tests', () => {
  // Feature: creator-link, Property 5: Creator Profile Completeness
  it('correctly renders all creator details when profile is loaded', async () => {
    const categories: ContentCategory[] = ['beauty', 'fitness', 'tech', 'lifestyle'];
    const safeString = (prefix: string) =>
      fc.string({ minLength: 5 }).map((s) => prefix + '_' + s.replace(/[^a-zA-Z0-9]/g, 'x'));

    const creatorArbitrary = fc.record({
      id: fc.constant('creator-1'),
      userId: fc.constant('creator-1'),
      displayName: safeString('displayName'),
      bio: safeString('bio'),
      avatarUrl: fc.constant('https://api.dicebear.com/7.x/bottts/svg?seed=test'),
      contentCategories: fc.array(fc.constantFrom(...categories), { minLength: 1, maxLength: 3 }),
      socialAccounts: fc.array(fc.record({
        platform: fc.constant('instagram'),
        handle: safeString('handle'),
        followerCount: fc.integer({ min: 100, max: 10000 }),
        connected: fc.constant(true)
      })),
      trustScore: fc.integer({ min: 0, max: 100 }),
      trustScorePartialData: fc.boolean(),
      portfolio: fc.array(fc.record({
        id: fc.string(),
        creatorId: fc.constant('creator-1'),
        title: safeString('title'),
        description: safeString('description'),
        category: fc.constant('lifestyle'),
        mediaUrl: fc.constant('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'),
        fileSizeBytes: fc.integer({ min: 100, max: 5000 }),
        campaignId: fc.constant(null),
        metrics: fc.record({
          views: fc.integer({ min: 100, max: 1000 }),
          likes: fc.integer({ min: 0, max: 100 }),
          comments: fc.integer({ min: 0, max: 100 }),
          shares: fc.integer({ min: 0, max: 100 }),
          engagementRate: fc.double({ min: 0, max: 1 })
        }),
        createdAt: fc.string()
      }), { minLength: 1, maxLength: 2 }),
      collaborationHistory: fc.array(fc.record({
        campaignId: fc.string(),
        brandId: fc.string(),
        status: fc.constant('completed'),
        startDate: fc.string(),
        endDate: fc.string()
      })),
      insights: fc.record({
        audienceDemographics: fc.record({
          ageGroups: fc.record({
            '18-24': fc.double({ min: 0.1, max: 0.9 })
          }),
          topCountries: fc.array(safeString('country')),
          genderSplit: fc.record({
            male: fc.integer(),
            female: fc.integer(),
            other: fc.integer()
          })
        }),
        primaryCategories: fc.array(fc.constant('lifestyle')),
        averageEngagementRate: fc.double({ min: 0.01, max: 0.1 }),
        collaborationCount: fc.integer({ min: 0, max: 10 }),
        successRate: fc.double({ min: 0.5, max: 1 })
      }),
      verificationStatus: fc.constant('verified')
    });

    await fc.assert(
      fc.asyncProperty(
        creatorArbitrary,
        async (creatorData) => {
          activeCreator = creatorData;
          localStorage.clear();
          sessionStorage.clear();

          let unmount: (() => void) | undefined = undefined;
          try {
            await act(async () => {
              const res = render(
                <MemoryRouter initialEntries={['/creator/me']}>
                  <Routes>
                    <Route path="/creator/:id" element={<CreatorProfilePage />} />
                  </Routes>
                </MemoryRouter>
              );
              unmount = res.unmount;
            });

            // Use synchronous getByText queries
            expect(screen.getByText(creatorData.displayName)).toBeTruthy();
            expect(screen.getByText(creatorData.bio)).toBeTruthy();

            // Trust Score badge
            expect(screen.getByLabelText(`Trust Score: ${creatorData.trustScore} out of 100`)).toBeTruthy();

            // Verification badge
            expect(screen.getByText('Verified')).toBeTruthy();

            // Portfolio Item titles
            creatorData.portfolio.forEach((item) => {
              expect(screen.getAllByText(item.title).length).toBeGreaterThan(0);
            });

            // Primary categories
            creatorData.contentCategories.forEach((cat) => {
              expect(screen.getAllByText(cat).length).toBeGreaterThan(0);
            });

            // Engagement insights
            const engagementContainers = screen.getAllByText('Avg. Engagement');
            const engagementContainer = engagementContainers
              .map((el) => el.parentElement?.parentElement)
              .find((parent) => parent?.textContent?.includes('%'));
            expect(engagementContainer).toBeTruthy();
          } finally {
            const localUnmount = unmount as unknown as () => void;
            if (localUnmount) {
              act(() => {
                localUnmount();
              });
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30s timeout
});
