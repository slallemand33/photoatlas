"use client";

import { Settings2 } from "lucide-react";
import { useState } from "react";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { useLayerStore } from "../store/useLayerStore";
import type { LayerWithState } from "../types";

interface LayerItemProps {
  layer: LayerWithState;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-relaxed">
      <span className="text-muted-foreground w-24 shrink-0 font-medium">{label}</span>
      <span className="text-foreground">{value}</span>
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
  const ControlsComp = layer.ControlsComponent;

  return (
    <div className="flex flex-col px-4 py-4">
      {/* Ligne principale */}
      <div className="flex min-h-11 items-center gap-3">
        <Icon
          className={cn(
            "h-5 w-5 shrink-0",
            layer.state.visible ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "flex-1 truncate text-base font-semibold",
            layer.state.visible ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {layer.name}
        </span>

        <Switch
          checked={layer.state.visible}
          onCheckedChange={() => toggleLayer(layer.id)}
          aria-label={`${layer.state.visible ? "Désactiver" : "Activer"} ${layer.name}`}
          className="shrink-0"
        />

        <button
          onClick={() => setShowInfo((v) => !v)}
          className={cn(
            "hover:bg-accent grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors",
            showInfo ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`${showInfo ? "Masquer" : "Afficher"} les informations de ${layer.name}`}
          aria-expanded={showInfo}
        >
          <Settings2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Slider d'opacité */}
      <div
        className={cn(
          "mt-3 flex min-h-11 items-center gap-3 pl-8 transition-opacity",
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
        <span className="text-muted-foreground w-12 shrink-0 text-right font-mono text-sm font-semibold tabular-nums">
          {opacityPercent}%
        </span>
      </div>

      {/* Légende */}
      {layer.state.visible && LegendComp && (
        <div className="mt-1 pl-[26px]">
          <LegendComp />
        </div>
      )}

      {/* Contrôles propres aux couches dynamiques */}
      {layer.state.visible && ControlsComp && (
        <div className="pl-[26px]">
          <ControlsComp />
        </div>
      )}

      {/* Panneau d'informations */}
      {showInfo && (
        <div className="border-border bg-muted/40 mt-3 flex flex-col gap-2 rounded-xl border p-4">
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
