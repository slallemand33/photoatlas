/** Entrées de la légende — échelle de Bortle simplifiée */
const LEGEND_ITEMS = [
  { color: "#000000", label: "Ciel noir naturel" },
  { color: "#1a237e", label: "Très faible pollution" },
  { color: "#1b5e20", label: "Faible (zones rurales)" },
  { color: "#f9a825", label: "Pollution modérée" },
  { color: "#b71c1c", label: "Forte (zones urbaines)" },
  { color: "#f5f5f5", label: "Très forte (centre-ville)" },
] as const;

export function LightPollutionLegend() {
  return (
    <div className="flex flex-col gap-1.5 py-1" role="list" aria-label="Légende pollution lumineuse">
      {LEGEND_ITEMS.map(({ color, label }) => (
        <div key={color} className="flex items-center gap-2" role="listitem">
          <div
            className="h-3 w-5 shrink-0 rounded-sm border border-border/30"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="text-xs text-muted-foreground/60">{label}</span>
        </div>
      ))}
    </div>
  );
}
