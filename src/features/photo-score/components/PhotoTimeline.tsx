import { CalendarClock, Moon, Sparkles, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";

import type { PhotoTimelineEvent, PhotoTimelineEventKind } from "../types";

import { ScoreBar } from "./ScoreIndicator";

const ICONS: Record<PhotoTimelineEventKind, LucideIcon> = {
  "blue-hour": Sparkles,
  "golden-hour": Sun,
  sunrise: Sunrise,
  sunset: Sunset,
  "astronomical-night": Moon,
  "milky-way": Sparkles,
  moonrise: Moon,
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

export function PhotoTimeline({ events }: { events: PhotoTimelineEvent[] }) {
  return (
    <PlaceDashboardSection
      title="Timeline photo"
      icon={CalendarClock}
      status={`${events.length} événements`}
      className="border-info/30 from-info/10 via-card to-card bg-gradient-to-br"
    >
      <div className="relative space-y-2">
        <div
          className="photo-timeline-line absolute top-6 bottom-6 left-[4.95rem] w-1 rounded-full opacity-50"
          aria-hidden="true"
        />
        {events.map((event) => {
          const Icon = ICONS[event.kind];
          return (
            <div key={event.id} className="relative flex min-h-16 items-center gap-4 py-2">
              <time className="text-foreground w-16 shrink-0 text-right font-mono text-lg font-black tabular-nums">
                {formatTime(event.time)}
              </time>
              <span className="border-info bg-card z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 shadow-md">
                <Icon className="text-info h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-base font-bold">{event.label}</p>
                {event.stars ? (
                  <div className="mt-2 max-w-36">
                    <ScoreBar score={event.score ?? 0} />
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Événement lunaire</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PlaceDashboardSection>
  );
}
