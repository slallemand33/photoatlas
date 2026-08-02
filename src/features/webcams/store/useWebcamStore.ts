import { create } from "zustand";

interface WebcamState {
  selectedWebcamId: string | null;
  openWebcam: (id: string) => void;
  closeWebcam: () => void;
}

export const useWebcamStore = create<WebcamState>((set) => ({
  selectedWebcamId: null,
  openWebcam: (selectedWebcamId) => set({ selectedWebcamId }),
  closeWebcam: () => set({ selectedWebcamId: null }),
}));
