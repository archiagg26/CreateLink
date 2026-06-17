import { create } from 'zustand';

type AppMode = 'creator' | 'brand';

interface UIStore {
  mode: AppMode;
  switchToBrand: () => void;
  switchToCreator: () => void;
  toggleMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mode: 'creator',
  switchToBrand: () => set({ mode: 'brand' }),
  switchToCreator: () => set({ mode: 'creator' }),
  toggleMode: () => set((s) => ({ mode: s.mode === 'creator' ? 'brand' : 'creator' })),
}));
