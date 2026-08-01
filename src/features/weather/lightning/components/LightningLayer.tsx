"use client";

import type { GeoJSONSource, Map as MaplibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { useMap } from "@/components/map/MapProvider";
import { useLayerStore } from "@/features/layers/store/useLayerStore";

import { useLightningSnapshot } from "../hooks";
import { useLightningStore } from "../store";
import type { LightningBounds } from "../types";
import { toLightningGeoJson } from "../utils";

const SOURCE_ID = "lightning-source";
const PULSE_LAYER_ID = "lightning-pulse";
const SYMBOL_LAYER_ID = "lightning-symbols";
const ICON_ID = "lightning-bolt";

function getVisibleBounds(map: MaplibreMap): LightningBounds {
  const bounds = map.getBounds();
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
}

function createBoltImage(): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Impossible de créer le symbole de foudre");

  context.fillStyle = "#fbbf24";
  context.strokeStyle = "#78350f";
  context.lineWidth = 2;
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(28, 3);
  context.lineTo(11, 27);
  context.lineTo(22, 27);
  context.lineTo(17, 45);
  context.lineTo(38, 20);
  context.lineTo(27, 20);
  context.closePath();
  context.fill();
  context.stroke();
  return context.getImageData(0, 0, 48, 48);
}

function removeLightning(map: MaplibreMap): void {
  if (map.getLayer(SYMBOL_LAYER_ID)) map.removeLayer(SYMBOL_LAYER_ID);
  if (map.getLayer(PULSE_LAYER_ID)) map.removeLayer(PULSE_LAYER_ID);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
  if (map.hasImage(ICON_ID)) map.removeImage(ICON_ID);
}

export function LightningLayer() {
  const map = useMap();
  const isVisible = useLayerStore((state) => state.layers.lightning?.visible ?? false);
  const opacity = useLayerStore((state) => state.layers.lightning?.opacity ?? 0.85);
  const opacityRef = useRef(opacity);
  const [bounds, setBounds] = useState<LightningBounds | null>(null);
  const snapshot = useLightningStore((state) => state.snapshot);

  useLightningSnapshot(bounds, isVisible);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    if (!map) return;
    const updateBounds = () => setBounds(getVisibleBounds(map));
    updateBounds();
    map.on("moveend", updateBounds);
    return () => {
      map.off("moveend", updateBounds);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    if (!isVisible) {
      removeLightning(map);
      return;
    }

    const geoJson = toLightningGeoJson(snapshot?.strikes ?? []);
    const ensureLightning = () => {
      if (!map.isStyleLoaded()) return;
      if (!map.hasImage(ICON_ID)) map.addImage(ICON_ID, createBoltImage(), { pixelRatio: 2 });

      const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
      if (source) {
        source.setData(geoJson);
      } else {
        map.addSource(SOURCE_ID, { type: "geojson", data: geoJson });
      }

      if (!map.getLayer(PULSE_LAYER_ID)) {
        map.addLayer({
          id: PULSE_LAYER_ID,
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-color": "#fbbf24",
            "circle-radius": ["*", ["get", "intensity"], 9],
            "circle-opacity": opacityRef.current * 0.12,
            "circle-stroke-color": "#f59e0b",
            "circle-stroke-width": 1,
            "circle-stroke-opacity": opacityRef.current * 0.18,
          },
        });
      }

      if (!map.getLayer(SYMBOL_LAYER_ID)) {
        map.addLayer({
          id: SYMBOL_LAYER_ID,
          type: "symbol",
          source: SOURCE_ID,
          layout: {
            "icon-image": ICON_ID,
            "icon-size": ["get", "intensity"],
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          paint: { "icon-opacity": opacityRef.current },
        });
      }
    };

    ensureLightning();
    map.on("styledata", ensureLightning);
    const animation = window.setInterval(() => {
      if (!map.getLayer(PULSE_LAYER_ID)) return;
      const wave = (Math.sin(Date.now() / 550) + 1) / 2;
      map.setPaintProperty(PULSE_LAYER_ID, "circle-radius", [
        "*",
        ["get", "intensity"],
        8 + wave * 3,
      ]);
      map.setPaintProperty(
        PULSE_LAYER_ID,
        "circle-opacity",
        opacityRef.current * (0.05 + wave * 0.1),
      );
    }, 100);

    return () => {
      window.clearInterval(animation);
      map.off("styledata", ensureLightning);
    };
  }, [isVisible, map, snapshot]);

  useEffect(() => {
    if (!map) return;
    if (map.getLayer(SYMBOL_LAYER_ID)) {
      map.setPaintProperty(SYMBOL_LAYER_ID, "icon-opacity", opacity);
    }
    if (map.getLayer(PULSE_LAYER_ID)) {
      map.setPaintProperty(PULSE_LAYER_ID, "circle-stroke-opacity", opacity * 0.18);
    }
  }, [map, opacity]);

  useEffect(
    () => () => {
      if (map) removeLightning(map);
    },
    [map],
  );

  return null;
}
