const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatLightningTime(timestamp: number | null | undefined): string {
  return timestamp ? TIME_FORMATTER.format(new Date(timestamp)) : "—";
}

export function formatActivityAge(timestamp: number | null, now = Date.now()): string {
  if (!timestamp) return "Aucune activité récente";
  const minutes = Math.max(0, Math.round((now - timestamp) / 60_000));
  if (minutes === 0) return "À l’instant";
  if (minutes === 1) return "Il y a 1 minute";
  return `Il y a ${minutes} minutes`;
}
