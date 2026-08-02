"use client";

import { useLayers } from "../hooks/useLayers";

import { LayerItem } from "./LayerItem";

export function LayerPanel() {
  const layers = useLayers();
  const activeCount = layers.filter((l) => l.state.visible).length;

  return (
    <div className="flex flex-col">
      {/* En-tête de section */}
      <div className="border-border flex items-center justify-between border-b px-4 py-4">
        <span className="text-muted-foreground text-sm font-bold tracking-[0.12em] uppercase">
          Couches
        </span>
        {activeCount > 0 && (
          <span className="bg-primary/15 text-primary min-w-7 rounded-full px-2 py-1 text-center text-sm font-bold tabular-nums">
            {activeCount}
          </span>
        )}
      </div>

      {/* Liste des couches */}
      <div className="divide-border flex flex-col divide-y">
        {layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}
