import { create } from "zustand";

import type { RadarPlaybackSpeed, RadarTimeline } from "../types";

interface RadarState {
  timeline: RadarTimeline | null;
  currentIndex: number;
  isPlaying: boolean;
  speedMs: RadarPlaybackSpeed;
  setTimeline: (timeline: RadarTimeline) => void;
  setCurrentIndex: (index: number) => void;
  previousFrame: () => void;
  nextFrame: () => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlayback: () => void;
  setSpeed: (speedMs: RadarPlaybackSpeed) => void;
}

export const useRadarStore = create<RadarState>((set, get) => ({
  timeline: null,
  currentIndex: 0,
  isPlaying: false,
  speedMs: 1000,

  setTimeline: (timeline) =>
    set((state) => {
      const currentFrame = state.timeline?.frames[state.currentIndex];
      const preservedIndex = currentFrame
        ? timeline.frames.findIndex((frame) => frame.time === currentFrame.time)
        : -1;

      return {
        timeline,
        currentIndex: preservedIndex >= 0 ? preservedIndex : timeline.frames.length - 1,
      };
    }),

  setCurrentIndex: (index) =>
    set((state) => ({
      currentIndex: Math.max(0, Math.min(index, (state.timeline?.frames.length ?? 1) - 1)),
    })),

  previousFrame: () =>
    set((state) => {
      const count = state.timeline?.frames.length ?? 0;
      return { currentIndex: count > 0 ? (state.currentIndex - 1 + count) % count : 0 };
    }),

  nextFrame: () =>
    set((state) => {
      const count = state.timeline?.frames.length ?? 0;
      return { currentIndex: count > 0 ? (state.currentIndex + 1) % count : 0 };
    }),

  setPlaying: (isPlaying) => set({ isPlaying }),
  togglePlayback: () => set({ isPlaying: !get().isPlaying }),
  setSpeed: (speedMs) => set({ speedMs }),
}));
