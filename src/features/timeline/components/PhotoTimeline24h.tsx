"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, Moon, Sparkles, Star, Sun, Sunrise, Sunset } from "lucide-react";
import { useMemo } from "react";

import { Slider } from "@/components/ui/slider";
import { usePlaceStore } from "@/features/place-details/store";
import { cn } from "@/lib/utils";

import { useTimeline } from "../hooks";
import { useTimelineStore } from "../store";
import type { TimelineBandKind, TimelineEvent, TimelineEventKind } from "../types";

const IMPORTANT_EVENT_KINDS = new Set<TimelineEventKind>([
  "sunrise",
  "solar-noon",
  "sunset",
  "moonrise",
  "moonset",
  "milky-way-start",
  "milky-way-transit",
]);

const BAND_STYLES: Record<TimelineBandKind, string> = {
  night: "bg-astro/25",
  astronomical: "bg-astro/15",
  nautical: "bg-info/15",
  civil: "bg-sunset/15",
  blue: "bg-info/28",
  golden: "bg-sunrise/32",
  day: "bg-sunrise/12",
  "milky-way": "bg-astro/34",
};

const BAND_LEGEND: Array<{ kind: TimelineBandKind; label: string }> = [
  { kind: "night", label: "Nuit astro" },
  { kind: "blue", label: "Blue Hour" },
  { kind: "golden", label: "Golden Hour" },
  { kind: "day", label: "Journée" },
  { kind: "milky-way", label: "Voie Lactée" },
];

const BAND_DOT_STYLES: Record<TimelineBandKind, string> = {
  night: "bg-astro/70",
  astronomical: "bg-astro/55",
  nautical: "bg-info/55",
  civil: "bg-sunset/55",
  blue: "bg-info/70",
  golden: "bg-sunrise/75",
  day: "bg-sunrise/45",
  "milky-way": "bg-astro/80",
};

interface EventMeta {
  title: string;
  Icon: LucideIcon;
  tone: string;
}

const EVENT_META: Record<TimelineEventKind, EventMeta> = {
  night: {
    title: "Nuit astronomique",
    Icon: Sparkles,
    tone: "text-astro border-astro/30 bg-astro/10",
  },
  astronomical: {
    title: "Crépuscule astronomique",
    Icon: Sparkles,
    tone: "text-astro border-astro/30 bg-astro/10",
  },
  nautical: {
    title: "Crépuscule nautique",
    Icon: Sparkles,
    tone: "text-info border-info/30 bg-info/10",
  },
  civil: {
    title: "Crépuscule civil",
    Icon: Sunset,
    tone: "text-sunset border-sunset/30 bg-sunset/10",
  },
  blue: {
    title: "Blue Hour",
    Icon: Sparkles,
    tone: "text-info border-info/30 bg-info/10",
  },
  golden: {
    title: "Golden Hour",
    Icon: Sunrise,
    tone: "text-sunrise border-sunrise/35 bg-sunrise/10",
  },
  sunrise: {
    title: "Lever du soleil",
    Icon: Sunrise,
    tone: "text-sunrise border-sunrise/35 bg-sunrise/10",
  },
  "solar-noon": {
    title: "Midi solaire",
    Icon: Sun,
    tone: "text-warning border-warning/30 bg-warning/10",
  },
  sunset: {
    title: "Coucher du soleil",
    Icon: Sunset,
    tone: "text-sunset border-sunset/35 bg-sunset/10",
  },
  moonrise: {
    title: "Lever de lune",
    Icon: Moon,
    tone: "text-info border-info/30 bg-info/10",
  },
  moonset: {
    title: "Coucher de lune",
    Icon: Moon,
    tone: "text-info border-info/30 bg-info/10",
  },
  "milky-way-start": {
    title: "Voie Lactée visible",
    Icon: Sparkles,
    tone: "text-astro border-astro/35 bg-astro/10",
  },
  "milky-way-end": {
    title: "Fin de visibilité de la Voie Lactée",
    Icon: Sparkles,
    tone: "text-astro border-astro/30 bg-astro/10",
  },
  "milky-way-transit": {
    title: "Noyau galactique au plus haut",
    Icon: Star,
    tone: "text-astro border-astro/40 bg-astro/10",
  },
};

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function getImportantEvents(events: TimelineEvent[]) {
  return events.filter((event) => IMPORTANT_EVENT_KINDS.has(event.kind));
}

function getTimelineMarkers(events: TimelineEvent[]) {
  return events.reduce<TimelineEvent[]>((visible, event) => {
    const previous = visible.at(-1);
    if (!previous || event.minute - previous.minute >= 42) return [...visible, event];

    if (event.kind === "milky-way-transit" && previous.kind !== "milky-way-transit") {
      return [...visible.slice(0, -1), event];
    }

    return visible;
  }, []);
}

function getActiveEvent(events: TimelineEvent[], minute: number) {
  let best: TimelineEvent | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const event of events) {
    const distance = Math.abs(event.minute - minute);
    if (distance < bestDistance) {
      best = event;
      bestDistance = distance;
    }
  }

  return bestDistance <= 18 ? best : null;
}

function getProgress(minute: number) {
  return Math.max(0, Math.min(100, minute / 14.4));
}

function EventMarker({ event, active }: { event: TimelineEvent; active: boolean }) {
  const meta = EVENT_META[event.kind];
  const Icon = meta.Icon;

  return (
    <span
      className={cn(
        "grid h-7 w-7 place-items-center rounded-full border shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-md",
        meta.tone,
        active && "ring-ring scale-110 shadow-lg ring-2",
      )}
      aria-hidden="true"
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

export function PhotoTimeline24h() {
  const place = usePlaceStore((state) => state.selectedPlace);
  const { result, selectedTime } = useTimeline(place);
  const setSelectedTime = useTimelineStore((state) => state.setSelectedTime);

  const importantEvents = useMemo(
    () => (result ? getImportantEvents(result.events) : []),
    [result],
  );
  const timelineMarkers = useMemo(() => getTimelineMarkers(importantEvents), [importantEvents]);

  if (!place || !result || !selectedTime) return null;

  const startMs = new Date(result.dayStart).getTime();
  const minute = Math.max(
    0,
    Math.min(1440, Math.round((new Date(selectedTime).getTime() - startMs) / 60_000)),
  );
  const selectedProgress = getProgress(minute);
  const activeEvent = getActiveEvent(importantEvents, minute);

  const selectMinute = (nextMinute: number) => {
    setSelectedTime(new Date(startMs + nextMinute * 60_000));
  };

  const selectEvent = (event: TimelineEvent) => {
    setSelectedTime(new Date(event.time));
  };

  return (
    <section
      className="border-border bg-overlay text-foreground absolute right-3 bottom-4 left-3 z-20 rounded-2xl border p-3 shadow-2xl backdrop-blur-xl sm:right-4 sm:left-4 sm:p-4 lg:right-auto lg:left-1/2 lg:w-[min(650px,calc(100%-3rem))] lg:-translate-x-1/2"
      aria-label="Contrôle temporel de la journée photo"
    >
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <CalendarDays className="text-info h-4 w-4 shrink-0" aria-hidden="true" />
          <h2 className="truncate text-sm font-bold">Aujourd&apos;hui</h2>
        </div>
        <strong className="font-mono text-base tabular-nums sm:text-lg">{formatTime(selectedTime)}</strong>
      </div>

      <div className="relative pt-4">
        <div
          className="absolute top-0 z-20 -translate-x-1/2 text-center"
          style={{ left: `${selectedProgress}%` }}
        >
          <span className="bg-card text-foreground border-border inline-flex rounded-md border px-2 py-0.5 font-mono text-sm font-bold tabular-nums shadow-lg">
            {formatTime(selectedTime)}
          </span>
          <span className="bg-primary mx-auto mt-1 block h-2.5 w-2.5 rounded-full shadow-lg" />
        </div>

        <div className="border-border bg-muted/30 relative h-12 overflow-hidden rounded-lg border sm:h-14">
          <div className="absolute inset-x-0 top-0 h-6 sm:h-7">
            {result.bands.map((band) => (
              <div
                key={band.id}
                className={cn("absolute top-0 h-full", BAND_STYLES[band.kind])}
                style={{
                  left: `${getProgress(band.startMinute)}%`,
                  width: `${Math.max(0.5, getProgress(band.endMinute - band.startMinute))}%`,
                }}
                title={band.label}
              />
            ))}
          </div>

          <div className="border-border/45 absolute inset-x-0 top-4 h-px border-t sm:top-5" />
          <div
            className="bg-primary absolute top-0 bottom-0 z-10 w-px shadow-[0_0_0_1px_var(--primary)]"
            style={{ left: `${selectedProgress}%` }}
            aria-hidden="true"
          />

          {timelineMarkers.map((event) => {
            const active = activeEvent?.id === event.id;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => selectEvent(event)}
                className="group absolute top-5 z-20 -translate-x-1/2 rounded-full transition-transform focus-visible:z-30 sm:top-6"
                style={{ left: `${getProgress(event.minute)}%` }}
                aria-label={`${EVENT_META[event.kind].title} à ${formatTime(event.time)}`}
                aria-current={active ? "time" : undefined}
                title={`${EVENT_META[event.kind].title} · ${formatTime(event.time)}`}
              >
                <EventMarker event={event} active={active} />
              </button>
            );
          })}
        </div>

        <div className="mt-2 px-1">
          <Slider
            min={0}
            max={1440}
            step={5}
            value={[minute]}
            onValueChange={(values) => {
              const value = Array.isArray(values) ? values[0] : values;
              if (value !== undefined) selectMinute(value);
            }}
            aria-label={`Heure sélectionnée : ${formatTime(selectedTime)}`}
          />
          <div className="text-muted-foreground mt-1.5 flex justify-between font-mono text-sm tabular-nums">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-1 sm:flex">
        {BAND_LEGEND.map(({ kind, label }) => (
          <span key={kind} className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <span className={cn("h-2 w-2 rounded-full", BAND_DOT_STYLES[kind])} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
