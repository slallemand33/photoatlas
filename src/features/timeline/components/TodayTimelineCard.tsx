"use client";

import { CalendarDays, Clock3 } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types";

import { timelineEngine } from "../services";
import { useTimelineStore } from "../store";

export function TodayTimelineCard({ place: _place }: { place: SearchResult }) {
  const result = useTimelineStore((state) => state.result);
  const selectedTime = useTimelineStore((state) => state.selectedTime);
  const upcoming =
    result && selectedTime ? timelineEngine.getUpcoming(result, new Date(selectedTime), 3) : [];
  return (
    <PlaceDashboardSection title="Aujourd’hui" icon={CalendarDays} status="24 heures">
      <div className="space-y-3">
        {upcoming.length ? (
          upcoming.map((event, index) => (
            <div
              key={event.id}
              className={`flex items-center gap-4 rounded-xl border p-4 ${index === 0 ? "border-info/35 bg-info/10" : "border-border bg-muted/30"}`}
            >
              <span className="text-2xl" aria-hidden="true">
                {event.icon}
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
