"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock3, Moon, Sparkles, Star, Sun, Sunrise, Sunset } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types";
import { cn } from "@/lib/utils";

import { timelineEngine } from "../services";
import { useTimelineStore } from "../store";
import type { TimelineEventKind } from "../types";

const IMPORTANT_EVENT_KINDS = new Set<TimelineEventKind>([
  "sunrise",
  "solar-noon",
  "sunset",
  "moonrise",
  "moonset",
  "milky-way-start",
  "milky-way-transit",
]);

const EVENT_ICONS: Record<TimelineEventKind, { Icon: LucideIcon; tone: string }> = {
  night: { Icon: Sparkles, tone: "text-astro bg-astro/10" },
  astronomical: { Icon: Sparkles, tone: "text-astro bg-astro/10" },
  nautical: { Icon: Sparkles, tone: "text-info bg-info/10" },
  civil: { Icon: Sunset, tone: "text-sunset bg-sunset/10" },
  blue: { Icon: Sparkles, tone: "text-info bg-info/10" },
  golden: { Icon: Sunrise, tone: "text-sunrise bg-sunrise/15" },
  sunrise: { Icon: Sunrise, tone: "text-sunrise bg-sunrise/15" },
  "solar-noon": { Icon: Sun, tone: "text-warning bg-warning/10" },
  sunset: { Icon: Sunset, tone: "text-sunset bg-sunset/15" },
  moonrise: { Icon: Moon, tone: "text-info bg-info/10" },
  moonset: { Icon: Moon, tone: "text-info bg-info/10" },
  "milky-way-start": { Icon: Sparkles, tone: "text-astro bg-astro/15" },
  "milky-way-end": { Icon: Sparkles, tone: "text-astro bg-astro/10" },
  "milky-way-transit": { Icon: Star, tone: "text-astro bg-astro/15" },
};

export function TodayTimelineCard({ place: _place }: { place: SearchResult }) {
  const result = useTimelineStore((state) => state.result);
  const selectedTime = useTimelineStore((state) => state.selectedTime);
  const upcoming =
    result && selectedTime
      ? timelineEngine
          .getUpcoming(result, new Date(selectedTime), result.events.length)
          .filter((event) => IMPORTANT_EVENT_KINDS.has(event.kind))
          .slice(0, 3)
      : [];
  return (
    <PlaceDashboardSection title="Aujourd’hui" icon={CalendarDays} status="24 heures">
      <div className="space-y-3">
        {upcoming.length ? (
          upcoming.map((event, index) => (
            <div
              key={event.id}
              className={`flex items-center gap-4 rounded-xl border p-4 ${index === 0 ? "border-info/35 bg-info/10" : "border-border bg-muted/30"}`}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  EVENT_ICONS[event.kind].tone,
                )}
                aria-hidden="true"
              >
                {(() => {
                  const Icon = EVENT_ICONS[event.kind].Icon;
                  return <Icon className="h-5 w-5" />;
                })()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold">{event.label}</p>
                <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4" />
                  {event.remainingLabel}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Aucun autre événement pour cette journée.</p>
        )}
      </div>
    </PlaceDashboardSection>
  );
}
