"use client";

import { CalendarDays } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import { usePlaceStore } from "@/features/place-details/store";

import { useTimeline } from "../hooks";
import { useTimelineStore } from "../store";
import type { TimelineBandKind } from "../types";

const BAND_STYLES: Record<TimelineBandKind, string> = {
  night: "bg-astro/25",
  astronomical: "bg-astro/20",
  nautical: "bg-info/20",
  civil: "bg-sunset/20",
  blue: "bg-info/35",
  golden: "bg-sunrise/45",
  day: "bg-sunrise/20",
  "milky-way": "bg-astro/55",
};
const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

export function PhotoTimeline24h() {
  const place = usePlaceStore((state) => state.selectedPlace);
  const { result, selectedTime } = useTimeline(place);
  const setSelectedTime = useTimelineStore((state) => state.setSelectedTime);
  if (!place || !result || !selectedTime) return null;
  const startMs = new Date(result.dayStart).getTime();
  const minute = Math.max(
    0,
    Math.min(1440, Math.round((new Date(selectedTime).getTime() - startMs) / 60_000)),
  );
  return (
    <div className="border-border bg-overlay text-foreground absolute right-4 bottom-5 left-4 z-20 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:right-auto sm:left-1/2 sm:w-[min(900px,calc(100%-3rem))] sm:-translate-x-1/2">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-black tracking-wide uppercase">
          <CalendarDays className="text-info h-5 w-5" /> Timeline photographique
        </span>
        <strong className="font-mono text-xl tabular-nums">{formatTime(selectedTime)}</strong>
      </div>
      <div className="border-border bg-muted/50 relative mb-3 h-14 overflow-hidden rounded-xl border">
        {result.bands.map((band) => (
          <div
            key={band.id}
            title={band.label}
            className={`absolute top-0 h-7 ${BAND_STYLES[band.kind]}`}
            style={{
              left: `${band.startMinute / 14.4}%`,
              width: `${Math.max(0.5, (band.endMinute - band.startMinute) / 14.4)}%`,
            }}
          />
        ))}
        {result.events.map((event, index) => (
          <div
            key={event.id}
            className="absolute top-7 flex h-7 -translate-x-1/2 items-center"
            style={{ left: `${event.minute / 14.4}%` }}
            title={`${event.label} · ${formatTime(event.time)}`}
          >
            <span
              className={index % 2 ? "translate-y-1" : "-translate-y-1"}
              aria-label={`${event.label} à ${formatTime(event.time)}`}
            >
              {event.icon}
            </span>
          </div>
        ))}
      </div>
      <Slider
        min={0}
        max={1440}
        step={5}
        value={[minute]}
        onValueChange={(values) => {
          const value = Array.isArray(values) ? values[0] : values;
          if (value !== undefined) setSelectedTime(new Date(startMs + value * 60_000));
        }}
        aria-label={`Heure sélectionnée : ${formatTime(selectedTime)}`}
      />
      <div className="text-muted-foreground mt-2 flex justify-between font-mono text-sm">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
