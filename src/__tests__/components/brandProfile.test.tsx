import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BrandProfilePage from '../../pages/BrandProfilePage';
import type { Campaign, Brand } from '../../types/index';

// Mock the simulateLatency utility
vi.mock('../../services/mockUtils', () => ({
  simulateLatency: () => Promise.resolve(),
  generateId: () => Math.random().toString(),
  nowISO: () => new Date().toISOString()
}));

// Mock the Brand Store and Auth Store
const mockLoadBrand = vi.fn().mockResolvedValue(undefined);
let activeBrand: Brand | null = null;
let activeCampaigns: Campaign[] = [];

const stableBrandStore = {
  brand: null as Brand | null,
  loadBrand: mockLoadBrand
};

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    currentUser: { id: 'brand-1', role: 'brand' }
  })
}));

vi.mock('../../stores/brandStore', () => ({
  useBrandStore: () => {
    stableBrandStore.brand = activeBrand;
    return stableBrandStore;
  }
}));

vi.mock('../../services/store', () => ({
  getStore: () => ({
    campaigns: new Map(activeCampaigns.map((c) => [c.id, c]))
  })
}));

describe('BrandProfilePage Property Tests', () => {
  // Feature: creator-link, Property 6: Brand Profile Completeness
  it('correctly renders brand score/indicator, overview, campaigns, and stats', async () => {
    const safeString = (prefix: string) =>
      fc.string({ minLength: 5 }).map((s) => prefix + '_' + s.replace(/[^a-zA-Z0-9]/g, 'x'));

    const brandArbitrary = fc.record({
      id: fc.constant('brand-1'),
      userId: fc.constant('brand-1'),
      companyName: safeString('company'),
      logoUrl: fc.constant('https://api.dicebear.com/7.x/initials/svg?seed=test'),
      industry: safeString('industry'),
      description: safeString('description'),
      brandScore: fc.integer({ min: 0, max: 100 }),
      brandScorePartialData: fc.boolean(),
      isNewToPlatform: fc.boolean(),
      completedCollaborations: fc.integer({ min: 0, max: 10 }),
      averageCreatorRating: fc.double({ min: 1, max: 5 }),
      averageResponseTimeHours: fc.double({ min: 1, max: 24 }),
      campaigns: fc.array(fc.string()),
      verificationStatus: fc.constant('verified')
    });

    await fc.assert(
      fc.asyncProperty(
        brandArbitrary,
        async (brandData) => {
          activeBrand = brandData;
          localStorage.clear();
          sessionStorage.clear();
          // Set isNewToPlatform according to completedCollaborations count constraint
          activeBrand.isNewToPlatform = brandData.completedCollaborations < 3;

          // Generate some mock campaigns
          activeCampaigns = [
            {
              id: 'c-1',
              brandId: 'brand-1',
              title: 'Summer Skincare Campaign',
              description: 'Promo Campaign for Skincare',
              requirements: 'Require beauty creators',
              contentCategories: ['beauty'],
              compensationType: 'paid',
              compensationAmount: 200,
              deadline: new Date().toISOString(),
              status: 'active',
              publishedAt: new Date().toISOString(),
              applicantCount: 2
            }
          ];

          let unmount: (() => void) | undefined = undefined;
          try {
            await act(async () => {
              const res = render(
                <MemoryRouter initialEntries={['/brand/me']}>
                  <Routes>
                    <Route path="/brand/:id" element={<BrandProfilePage />} />
                  </Routes>
                </MemoryRouter>
              );
              unmount = res.unmount;
            });

            // Use synchronous getByText queries
            expect(screen.getByText(brandData.companyName)).toBeTruthy();
            expect(screen.getByText(brandData.description)).toBeTruthy();
            expect(screen.getByText(brandData.industry)).toBeTruthy();

            // Verify Brand Score or New to Platform indicator
            if (activeBrand.isNewToPlatform) {
              expect(screen.getByText('New to Platform')).toBeTruthy();
            } else {
              expect(screen.getByLabelText(`Brand Trust Score: ${brandData.brandScore} out of 100`)).toBeTruthy();
            }

            // Verification badge
            expect(screen.getByText('Verified')).toBeTruthy();

            // Campaign history title
            expect(screen.getByText('Summer Skincare Campaign')).toBeTruthy();

            // Numeric stats (from the metrics row cards or stat cards)
            const collabsCard = screen.getAllByText('Collabs Done')
              .map((el) => el.parentElement)
              .find((parent) => parent?.textContent?.includes(String(brandData.completedCollaborations)));
            expect(collabsCard).toBeTruthy();

            const ratingCard = screen.getAllByText('Creator Rating')
              .map((el) => el.parentElement)
              .find((parent) => {
                const expectedText = brandData.averageCreatorRating > 0 ? `${brandData.averageCreatorRating.toFixed(1)}` : '—';
                return parent?.textContent?.includes(expectedText);
              });
            expect(ratingCard).toBeTruthy();

            const responseCard = screen.getAllByText('Response Time')
              .map((el) => el.parentElement)
              .find((parent) => {
                const expectedText = brandData.averageResponseTimeHours > 0 ? `${brandData.averageResponseTimeHours}` : '—';
                return parent?.textContent?.includes(expectedText);
              });
            expect(responseCard).toBeTruthy();
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
