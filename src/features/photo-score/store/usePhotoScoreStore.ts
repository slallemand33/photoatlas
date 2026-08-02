import { create } from "zustand";

import type { PhotoScoreResult } from "../types";

interface PhotoScoreState {
  latestResult: PhotoScoreResult | null;
  setLatestResult: (result: PhotoScoreResult | null) => void;
}

export const usePhotoScoreStore = create<PhotoScoreState>((set) => ({
  latestResult: null,
  setLatestResult: (latestResult) => set({ latestResult }),
}));
