const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatRadarTime(timestamp: number | undefined): string {
  if (!timestamp) return "—";
  return TIME_FORMATTER.format(new Date(timestamp * 1000));
}
