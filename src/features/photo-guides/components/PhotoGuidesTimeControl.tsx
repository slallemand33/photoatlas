"use client";

import { Clock3 } from "lucide-react";

import { Slider } from "@/components/ui/slider";

import { usePhotoGuidesStore } from "../store";

const format = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function PhotoGuidesTimeControl() {
  const enabled = usePhotoGuidesStore((state) => state.enabled);
  const start = usePhotoGuidesStore((state) => state.windowStart);
  const end = usePhotoGuidesStore((state) => state.windowEnd);
  const selected = usePhotoGuidesStore((state) => state.selectedTime);
  const setTime = usePhotoGuidesStore((state) => state.setTime);
  if (!Object.values(enabled).some(Boolean) || !start || !end || !selected) return null;
  const startMs = new Date(start).getTime();
  const duration = Math.round((new Date(end).getTime() - startMs) / 60_000);
  const current = Math.max(
    0,
    Math.min(duration, Math.round((new Date(selected).getTime() - startMs) / 60_000)),
  );
  return (
    <div className="border-border bg-overlay text-foreground absolute bottom-6 left-1/2 z-20 w-[min(680px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-sm font-bold">
        <span className="flex items-center gap-2">
          <Clock3 className="text-info h-5 w-5" /> Guides photo
        </span>
        <strong className="font-mono text-xl">{format(selected)}</strong>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm">{format(start)}</span>
        <Slider
          min={0}
          max={duration}
          step={5}
          value={[current]}
          onValueChange={(v) => {
            const minutes = Array.isArray(v) ? v[0] : v;
            if (minutes !== undefined) setTime(new Date(startMs + minutes * 60_000));
          }}
          aria-label="Heure des guides photographiques"
        />
        <span className="font-mono text-sm">{format(end)}</span>
      </div>
    </div>
  );
}
