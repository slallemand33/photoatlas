"use client";

import { Clock3, Images, LoaderCircle, Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

import { useRadarTimeline } from "../hooks";
import { useRadarStore } from "../store";
import type { RadarPlaybackSpeed } from "../types";
import { formatRadarTime } from "../utils";

const SPEEDS: { value: RadarPlaybackSpeed; label: string }[] = [
  { value: 2500, label: "0,5×" },
  { value: 1500, label: "0,75×" },
  { value: 1000, label: "1×" },
  { value: 500, label: "2×" },
];

export function RadarControls() {
  const { isLoading, isError } = useRadarTimeline(true);
  const timeline = useRadarStore((state) => state.timeline);
  const currentIndex = useRadarStore((state) => state.currentIndex);
  const isPlaying = useRadarStore((state) => state.isPlaying);
  const speedMs = useRadarStore((state) => state.speedMs);
  const setCurrentIndex = useRadarStore((state) => state.setCurrentIndex);
  const previousFrame = useRadarStore((state) => state.previousFrame);
  const nextFrame = useRadarStore((state) => state.nextFrame);
  const setPlaying = useRadarStore((state) => state.setPlaying);
  const togglePlayback = useRadarStore((state) => state.togglePlayback);
  const setSpeed = useRadarStore((state) => state.setSpeed);
  const frames = timeline?.frames ?? [];
  const currentFrame = frames[currentIndex];
  const disabled = frames.length < 2;

  if (isLoading && frames.length === 0) {
    return (
      <div className="text-muted-foreground/65 flex items-center gap-2 py-3 text-xs">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Chargement du radar…
      </div>
    );
  }

  if (isError && frames.length === 0) {
    return <p className="text-destructive/80 py-3 text-xs">Radar RainViewer indisponible.</p>;
  }

  return (
    <div className="border-border/35 bg-background/35 mt-2 space-y-3 rounded-lg border p-2.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setPlaying(false);
            previousFrame();
          }}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-md p-1.5 transition disabled:opacity-30"
          aria-label="Image radar précédente"
        >
          <SkipBack className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={togglePlayback}
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition disabled:opacity-30",
            isPlaying
              ? "bg-info text-primary-foreground shadow-sm"
              : "bg-foreground text-background",
          )}
          aria-label={isPlaying ? "Mettre le radar en pause" : "Lire l’animation radar"}
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setPlaying(false);
            nextFrame();
          }}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-md p-1.5 transition disabled:opacity-30"
          aria-label="Image radar suivante"
        >
          <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="text-foreground/85 ml-1 flex-1 text-right font-mono text-xs font-semibold tabular-nums">
          {currentFrame ? formatRadarTime(currentFrame.time) : "—"}
        </span>
      </div>

      <Slider
        value={[currentIndex]}
        min={0}
        max={Math.max(frames.length - 1, 0)}
        step={1}
        disabled={disabled}
        onValueChange={(values) => {
          const value = Array.isArray(values) ? values[0] : values;
          setPlaying(false);
          setCurrentIndex(value ?? 0);
        }}
        aria-label={`Image radar ${currentIndex + 1} sur ${frames.length}`}
      />

      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
        <span className="text-muted-foreground/60 flex items-center gap-1">
          <Clock3 className="h-3 w-3" aria-hidden="true" /> Dernière mise à jour
        </span>
        <span className="text-foreground/75 text-right font-mono tabular-nums">
          {timeline ? formatRadarTime(timeline.generatedAt) : "—"}
        </span>
        <span className="text-muted-foreground/60 flex items-center gap-1">
          <Images className="h-3 w-3" aria-hidden="true" /> Images disponibles
        </span>
        <span className="text-foreground/75 text-right font-mono tabular-nums">
          {frames.length}
        </span>
      </div>

      <div className="border-border/25 flex items-center justify-between border-t pt-2">
        <span className="text-muted-foreground/60 text-[10px]">Vitesse de lecture</span>
        <select
          value={speedMs}
          onChange={(event) => setSpeed(Number(event.target.value) as RadarPlaybackSpeed)}
          className="border-border/40 bg-background/70 text-foreground/80 rounded-md border px-1.5 py-1 text-[10px] outline-none"
          aria-label="Vitesse de lecture du radar"
        >
          {SPEEDS.map((speed) => (
            <option key={speed.value} value={speed.value}>
              {speed.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
