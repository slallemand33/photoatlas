"use client";

import { useLayers } from "../hooks/useLayers";

import { LayerItem } from "./LayerItem";

export function LayerPanel() {
  const layers = useLayers();

  return (
    <div className="flex flex-col">
      <div className="divide-border flex flex-col divide-y">
        {layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} />
        ))}
      </div>
    </div>
  );
}
