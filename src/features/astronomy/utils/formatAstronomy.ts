import type { TimeInterval } from "../types";

const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
});

export function formatAstronomyTime(value: string | null): string {
  return value ? TIME_FORMATTER.format(new Date(value)) : "—";
}

export function formatAstronomyInterval(interval: TimeInterval): string {
  if (!interval.start || !interval.end) return "Indisponible";
  return `${formatAstronomyTime(interval.start)} – ${formatAstronomyTime(interval.end)}`;
}

export function formatAstronomyDay(value: string | null): string {
  return value ? DAY_FORMATTER.format(new Date(value)) : "—";
}
