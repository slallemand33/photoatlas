"use client";

import { Clock3, MapPin, Sparkles } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { useLayerStore } from "@/features/layers/store/useLayerStore";
import { usePlaceStore } from "@/features/place-details/store/usePlaceStore";

import { useAstronomyStore } from "../../store";
import { formatAstronomyTime } from "../../utils";
import { useMilkyWayStore } from "../store";

export function AstroTimeSlider() {
  const isActive = useLayerStore((state) => state.layers["milky-way"]?.visible ?? false);
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const windowStart = useMilkyWayStore((state) => state.windowStart);
  const windowEnd = useMilkyWayStore((state) => state.windowEnd);
  const selectedTime = useMilkyWayStore((state) => state.selectedTime);
  const setSelectedTime = useMilkyWayStore((state) => state.setSelectedTime);
  const setAstronomyDate = useAstronomyStore((state) => state.setSelectedDate);

  if (!isActive) return null;

  if (!selectedPlace || !windowStart || !windowEnd || !selectedTime) {
    return (
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-violet-300/20 bg-slate-950/90 px-4 py-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <MapPin className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
          Sélectionnez un lieu pour préparer votre composition.
        </span>
      </div>
    );
  }

  const startMs = new Date(windowStart).getTime();
  const endMs = new Date(windowEnd).getTime();
  const durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60_000));
  const selectedMinutes = Math.max(
    0,
    Math.min(durationMinutes, Math.round((new Date(selectedTime).getTime() - startMs) / 60_000)),
  );

  return (
    <div className="absolute bottom-5 left-1/2 z-20 w-[min(620px,calc(100%-7rem))] -translate-x-1/2 rounded-2xl border border-violet-300/20 bg-slate-950/88 px-4 py-3 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-[10px] font-semibold tracking-wider text-violet-200 uppercase">
          <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Mode Astro · {selectedPlace.name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-sm font-bold text-white tabular-nums">
          <Clock3 className="h-3.5 w-3.5 text-violet-300" aria-hidden="true" />
          {formatAstronomyTime(selectedTime)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-10 shrink-0 font-mono text-[10px] text-slate-400 tabular-nums">
          {formatAstronomyTime(windowStart)}
        </span>
        <Slider
          value={[selectedMinutes]}
          min={0}
          max={durationMinutes}
          step={5}
          onValueChange={(values) => {
            const minutes = Array.isArray(values) ? values[0] : values;
            if (minutes === undefined) return;
            const date = new Date(startMs + minutes * 60_000);
            setSelectedTime(date);
            setAstronomyDate(date);
          }}
          aria-label={`Heure astronomique sélectionnée : ${formatAstronomyTime(selectedTime)}`}
        />
        <span className="w-10 shrink-0 text-right font-mono text-[10px] text-slate-400 tabular-nums">
          {formatAstronomyTime(windowEnd)}
        </span>
      </div>
    </div>
  );
}
