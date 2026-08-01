import type { LucideIcon } from "lucide-react";
import { Camera, Cloud, Eye, Lightbulb, Moon, Star, Sun, Wind, Zap } from "lucide-react";

function SectionTitle({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function DataRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/20 px-3 py-2.5 last:border-0">
      <div className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
        <span className="text-sm text-foreground/80">{label}</span>
      </div>
      <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        Bientôt
      </span>
    </div>
  );
}

export function PlacePhotoConditions() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Score global — élément héro */}
      <div>
        <SectionTitle icon={Camera} label="Score Photo" />
        <div className="rounded-xl border border-border/25 bg-muted/10 px-5 py-6 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-black leading-none tabular-nums text-foreground/25">—</span>
            <span className="text-xl font-semibold text-muted-foreground">/100</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">En attente des données photo</p>
          <div className="mt-3 flex justify-center gap-1.5">
            {["Météo", "Astronomie", "Pollution"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/30 px-2 py-0.5 text-[10px] text-muted-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lumière */}
      <div>
        <SectionTitle icon={Sun} label="Lumière" />
        <div className="overflow-hidden rounded-lg border border-border/20 bg-card">
          <DataRow icon={Sun} label="Lever du soleil" />
          <DataRow icon={Sun} label="Coucher du soleil" />
          <DataRow icon={Sun} label="Heure dorée · bleue" />
          <DataRow icon={Moon} label="Phase de lune" />
        </div>
      </div>

      {/* Météo */}
      <div>
        <SectionTitle icon={Cloud} label="Météo" />
        <div className="overflow-hidden rounded-lg border border-border/20 bg-card">
          <DataRow icon={Wind} label="Vent" />
          <DataRow icon={Cloud} label="Couverture nuageuse" />
          <DataRow icon={Eye} label="Visibilité" />
          <DataRow icon={Zap} label="Orages" />
        </div>
      </div>

      {/* Pollution lumineuse */}
      <div>
        <SectionTitle icon={Lightbulb} label="Pollution lumineuse" />
        <div className="overflow-hidden rounded-lg border border-border/20 bg-card">
          <DataRow icon={Lightbulb} label="Niveau Bortle" />
          <DataRow icon={Eye} label="Luminance du ciel" />
        </div>
      </div>

      {/* Astronomie */}
      <div>
        <SectionTitle icon={Star} label="Astronomie" />
        <div className="overflow-hidden rounded-lg border border-border/20 bg-card">
          <DataRow icon={Star} label="Seeing" />
          <DataRow icon={Eye} label="Transparence atmosphérique" />
          <DataRow icon={Star} label="Voie Lactée" />
        </div>
      </div>
    </div>
  );
}

