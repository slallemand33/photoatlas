const CLOUD_LEVELS = [
  { color: "rgba(148, 163, 184, 0.12)", label: "Très faible" },
  { color: "rgba(125, 211, 252, 0.32)", label: "Faible" },
  { color: "rgba(186, 230, 253, 0.55)", label: "Moyenne" },
  { color: "rgba(226, 232, 240, 0.78)", label: "Forte" },
  { color: "rgba(255, 255, 255, 0.96)", label: "Très forte" },
] as const;

export function CloudLegend() {
  return (
    <div className="border-border/25 bg-background/35 mt-2 rounded-lg border p-2.5">
      <div
        className="h-2 rounded-full bg-[linear-gradient(90deg,rgba(148,163,184,0.12),rgba(125,211,252,0.32),rgba(186,230,253,0.55),rgba(226,232,240,0.78),rgba(255,255,255,0.96))]"
        aria-hidden="true"
      />
      <div className="mt-2 grid gap-1.5" role="list" aria-label="Légende couverture nuageuse">
        {CLOUD_LEVELS.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2" role="listitem">
            <span
              className="border-border/30 h-2.5 w-2.5 rounded-full border"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground/70 text-[11px]">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground/45 mt-2 text-[9px] leading-relaxed">
        Observation satellite MODIS · mise à jour quotidienne
      </p>
    </div>
  );
}
