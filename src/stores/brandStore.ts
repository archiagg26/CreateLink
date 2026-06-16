import { create } from 'zustand';
import type { Brand, Campaign } from '../types/index';
import * as brandService from '../services/brandService';

interface BrandStore {
  brand: Brand | null;
  loadBrand: (id: string) => Promise<void>;
  submitVerification: (brandId: string) => Promise<void>;
  publishCampaign: (
    brandId: string,
    data: Omit<Campaign, 'id' | 'brandId' | 'status' | 'publishedAt' | 'applicantCount'>
  ) => Promise<Campaign>;
}

export const useBrandStore = create<BrandStore>((set) => ({
  brand: null,

  loadBrand: async (id) => {
    // Try direct brand ID first, then fall back to userId lookup
    let brand = await brandService.getBrand(id);
    if (!brand) {
      brand = await brandService.getBrandByUserId(id);
    }
    set({ brand });
  },

  submitVerification: async (brandId) => {
    const updated = await brandService.submitVerification(brandId);
    set({ brand: updated });
  },

  publishCampaign: async (brandId, data) => {
    const campaign = await brandService.publishCampaign(brandId, data);
    // Reload brand to get updated campaign lists
    const brand = await brandService.getBrand(brandId);
    set({ brand });
    return campaign;
  },
}));
