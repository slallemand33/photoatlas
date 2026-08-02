"use client";

import { Clock3, Radio, Zap } from "lucide-react";

import { lightningService } from "../services";
import { useLightningStore } from "../store";
import { formatLightningTime } from "../utils";

export function LightningControls() {
  const snapshot = useLightningStore((state) => state.snapshot);

  return (
    <div className="border-border/35 bg-background/35 mt-2 space-y-2 rounded-lg border p-2.5 text-[10px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground/60 flex items-center gap-1.5">
          <Zap className="h-3 w-3" aria-hidden="true" /> Impacts visibles
        </span>
        <span className="text-foreground/85 font-mono text-xs font-bold tabular-nums">
          {snapshot?.strikes.length ?? "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground/60 flex items-center gap-1.5">
          <Clock3 className="h-3 w-3" aria-hidden="true" /> Dernière mise à jour
        </span>
        <span className="text-foreground/75 font-mono tabular-nums">
          {formatLightningTime(snapshot?.updatedAt)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground/60 flex items-center gap-1.5">
          <Radio className="h-3 w-3" aria-hidden="true" /> Fournisseur
        </span>
        <span className="text-foreground/75 text-right">
          {snapshot?.provider ?? lightningService.getProviderName()}
        </span>
      </div>
      {snapshot?.simulated ? (
        <p className="border-warning/30 bg-warning/10 text-warning rounded-md border px-2 py-1.5 leading-relaxed">
          Prototype · impacts simulés, pas des observations réelles.
        </p>
      ) : (
        <p className="border-success/30 bg-success/10 text-success rounded-md border px-2 py-1.5 leading-relaxed">
          Impacts observés durant les deux dernières heures, dans un rayon maximal de 50 km.
        </p>
      )}
    </div>
  );
}
