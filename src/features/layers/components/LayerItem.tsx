"use client";

import { Settings2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

import type { LayerWithState } from "../types";
import { useLayerStore } from "../store/useLayerStore";

interface LayerItemProps {
  layer: LayerWithState;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-16 shrink-0 text-muted-foreground/60">{label}</span>
      <span className="text-muted-foreground/90">{value}</span>
    </div>
  );
}

export function LayerItem({ layer }: LayerItemProps) {
  const toggleLayer = useLayerStore((s) => s.toggleLayer);
  const setLayerOpacity = useLayerStore((s) => s.setLayerOpacity);
  const [showInfo, setShowInfo] = useState(false);

  const Icon = layer.icon;
  const opacityPercent = Math.round(layer.state.opacity * 100);
  const LegendComp = layer.LegendComponent;

  return (
    <div className="flex flex-col px-3 py-2.5">
      {/* Ligne principale */}
      <div className="flex items-center gap-2.5">
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            layer.state.visible ? "text-foreground" : "text-muted-foreground/50",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "flex-1 truncate text-sm font-medium",
            layer.state.visible ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {layer.name}
        </span>

        <Switch
          checked={layer.state.visible}
          onCheckedChange={() => toggleLayer(layer.id)}
          aria-label={`${layer.state.visible ? "Désactiver" : "Activer"} ${layer.name}`}
          className="shrink-0 scale-90"
        />

        <button
          onClick={() => setShowInfo((v) => !v)}
          className={cn(
            "shrink-0 rounded p-0.5 transition-colors",
            showInfo
              ? "text-foreground"
              : "text-muted-foreground/60 hover:text-muted-foreground",
          )}
          aria-label={`${showInfo ? "Masquer" : "Afficher"} les informations de ${layer.name}`}
          aria-expanded={showInfo}
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Slider d'opacité */}
      <div
        className={cn(
          "mt-2 flex items-center gap-2 pl-[26px] transition-opacity",
          !layer.state.visible && "pointer-events-none opacity-40",
        )}
      >
        <Slider
          value={[opacityPercent]}
          onValueChange={(values) => {
            const v = Array.isArray(values) ? values[0] : values;
            if (v !== undefined) setLayerOpacity(layer.id, v / 100);
          }}
          min={0}
          max={100}
          step={5}
          className="flex-1"
          aria-label={`Opacité de ${layer.name} : ${opacityPercent}%`}
        />
        <span className="w-9 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground/70">
          {opacityPercent}%
        </span>
      </div>

      {/* Légende */}
      {layer.state.visible && LegendComp && (
        <div className="mt-1 pl-[26px]">
          <LegendComp />
        </div>
      )}

      {/* Panneau d'informations */}
      {showInfo && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-md bg-muted/30 px-3 py-2.5 pl-[26px]">
          <InfoRow label="Source" value={layer.metadata.dataProvider ?? "—"} />
          <InfoRow label="Licence" value={layer.metadata.license ?? "—"} />
          {layer.metadata.updateIntervalSeconds !== undefined && (
            <InfoRow
              label="Mise à jour"
              value={
                layer.metadata.updateIntervalSeconds >= 86400
                  ? `Tous les ${Math.round(layer.metadata.updateIntervalSeconds / 86400)} jours`
                  : `Toutes les ${Math.round(layer.metadata.updateIntervalSeconds / 60)} min`
              }
            />
          )}
          <InfoRow label="Opacité" value={`${opacityPercent}%`} />
          <InfoRow label="Description" value={layer.description} />
        </div>
      )}
    </div>
  );
}

