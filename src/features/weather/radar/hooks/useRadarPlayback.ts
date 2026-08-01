"use client";

import { useEffect } from "react";

import { useRadarStore } from "../store";

export function useRadarPlayback(enabled: boolean) {
  const isPlaying = useRadarStore((state) => state.isPlaying);
  const speedMs = useRadarStore((state) => state.speedMs);
  const frameCount = useRadarStore((state) => state.timeline?.frames.length ?? 0);
  const nextFrame = useRadarStore((state) => state.nextFrame);

  useEffect(() => {
    if (!enabled || !isPlaying || frameCount < 2) return;
    const interval = window.setInterval(nextFrame, speedMs);
    return () => window.clearInterval(interval);
  }, [enabled, frameCount, isPlaying, nextFrame, speedMs]);
}
