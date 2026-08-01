import { create } from "zustand";

import type { LightningSnapshot } from "../types";

interface LightningState {
  snapshot: LightningSnapshot | null;
  setSnapshot: (snapshot: LightningSnapshot) => void;
  clearSnapshot: () => void;
}

export const useLightningStore = create<LightningState>((set) => ({
  snapshot: null,
  setSnapshot: (snapshot) => set({ snapshot }),
  clearSnapshot: () => set({ snapshot: null }),
}));
