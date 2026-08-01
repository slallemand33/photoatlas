const LEGEND_ITEMS = [
  { color: "#030712", label: "Ciel exceptionnel" },
  { color: "#172554", label: "Très faible pollution" },
  { color: "#166534", label: "Bonne qualité" },
  { color: "#eab308", label: "Qualité moyenne" },
  { color: "#dc2626", label: "Très forte pollution" },
] as const;

export function LightPollutionLegend() {
  return (
    <div
      className="border-border/25 bg-background/35 mt-2 rounded-lg border p-2.5"
      aria-label="Légende pollution lumineuse"
    >
      <div
        className="h-2 overflow-hidden rounded-full bg-[linear-gradient(90deg,#030712_0%,#172554_25%,#166534_48%,#eab308_72%,#dc2626_100%)] shadow-inner"
        aria-hidden="true"
      />
      <div className="text-muted-foreground/45 mt-1 flex justify-between text-[9px] font-semibold tracking-wide uppercase">
        <span>Ciel sombre</span>
        <span>Zone éclairée</span>
      </div>
      <div className="mt-2 grid gap-1.5" role="list">
        {LEGEND_ITEMS.map(({ color, label }) => (
          <div key={color} className="flex items-center gap-2" role="listitem">
            <span
              className="border-border/25 h-2.5 w-2.5 shrink-0 rounded-full border shadow-sm"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground/70 text-[11px] leading-tight">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground/45 mt-2 text-[9px] leading-relaxed">
        Repères visuels indicatifs · luminosité nocturne VIIRS
      </p>
    </div>
  );
}
