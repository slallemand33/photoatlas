"use client";

import { AlertCircle } from "lucide-react";
import type { Map as MaplibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { BasemapSwitcher } from "@/features/basemaps/components";
import { BASEMAP_DEFINITIONS, DEFAULT_BASEMAP_ID } from "@/features/basemaps/definitions";
import { hasMaptilerKey } from "@/features/basemaps/services/maptiler";
import { useBasemapStore } from "@/features/basemaps/store/useBasemapStore";
import { applyBasemap } from "@/features/basemaps/utils/applyBasemap";
import { useLayerStore } from "@/features/layers/store/useLayerStore";
import { PhotoGuidesLayer } from "@/features/photo-guides";
import { PhotoTimeline24h } from "@/features/timeline";
import { LightningLayer } from "@/features/weather/lightning/components/LightningLayer";
import { RadarLayer } from "@/features/weather/radar/components/RadarLayer";

import { useMap, useSetMap } from "./MapProvider";
import { syncLayersToMap } from "./utils/syncLayers";

const INITIAL_CENTER: [number, number] = [2.3514, 46.8566];
const INITIAL_ZOOM = 5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 22;

function NoKeyOverlay() {
  return (
    <div className="bg-background/95 absolute inset-0 z-20 flex items-center justify-center">
      <div className="border-border/30 bg-card max-w-sm rounded-xl border p-6 text-center shadow-xl">
        <AlertCircle className="text-warning mx-auto mb-3 h-8 w-8" aria-hidden="true" />
        <h3 className="text-foreground text-sm font-semibold">Clé MapTiler manquante</h3>
        <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
          Ajoutez la variable{" "}
          <code className="bg-muted text-foreground/80 rounded px-1.5 py-0.5 font-mono">
            NEXT_PUBLIC_MAPTILER_KEY
          </code>{" "}
          dans votre fichier <code className="text-foreground/80 font-mono">.env.local</code> puis
          redémarrez le serveur.
        </p>
      </div>
    </div>
  );
}

export function MapView() {
  const hasKey = hasMaptilerKey();

  return (
    <div className="relative h-full w-full">
      {hasKey ? (
        <>
          <MapCanvas />
          <BasemapSwitcher />
          <PhotoTimeline24h />
        </>
      ) : (
        <NoKeyOverlay />
      )}
    </div>
  );
}

function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const setMap = useSetMap();
  const map = useMap();
  const layerStates = useLayerStore((s) => s.layers);
  const currentBasemapId = useBasemapStore((s) => s.currentId);
  const setCurrentBasemapId = useBasemapStore((s) => s.setCurrentId);
  const prevBasemapId = useRef(currentBasemapId);

  const [initialBasemap] = useState(() => {
    const id = useBasemapStore.getState().currentId;
    return BASEMAP_DEFINITIONS.find((d) => d.id === id) ?? BASEMAP_DEFINITIONS[0]!;
  });

  // ── Initialisation MapLibre (s'exécute une seule fois) ──────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let cleanedUp = false;
    let pendingMap: MaplibreMap | null = null;

    void import("maplibre-gl")
      .then((maplibregl) => {
        if (cleanedUp || !containerRef.current) return;

        // Next.js ne résout pas correctement l'URL automatique du worker
        // MapLibre v6. Les modules sont copiés dans public/ à l'installation.
        maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

        const instance = new maplibregl.Map({
          container: containerRef.current,
          style: initialBasemap.styleSource,
          center: INITIAL_CENTER,
          zoom: INITIAL_ZOOM,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          dragRotate: false,
          pitchWithRotate: false,
        });

        pendingMap = instance as MaplibreMap;

        instance.touchZoomRotate.disableRotation();

        instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        instance.addControl(
          new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
          "bottom-left",
        );
        instance.addControl(new maplibregl.FullscreenControl(), "top-right");
        instance.addControl(
          new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: false,
            fitBoundsOptions: { maxZoom: 14 },
          }),
          "top-right",
        );

        instance.once("load", () => {
          if (cleanedUp) {
            instance.remove();
            pendingMap = null;
            return;
          }
          mapRef.current = instance as MaplibreMap;
          pendingMap = null;
          setMap(instance as MaplibreMap);
        });
      })
      .catch((err: unknown) => {
        console.error("[MapView] Échec du chargement de MapLibre GL :", err);
      });

    return () => {
      cleanedUp = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMap(null);
      } else if (pendingMap) {
        pendingMap.remove();
        pendingMap = null;
      }
    };
  }, [setMap, initialBasemap]);

  // ── Synchronisation des couches ─────────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    syncLayersToMap(map, layerStates);
  }, [map, layerStates]);

  // ── Changement de fond avec fallback automatique ─────────────────────────
  useEffect(() => {
    if (!map || currentBasemapId === prevBasemapId.current) return;
    prevBasemapId.current = currentBasemapId;

    const def =
      BASEMAP_DEFINITIONS.find((d) => d.id === currentBasemapId) ?? BASEMAP_DEFINITIONS[0]!;

    const onLoaded = () => syncLayersToMap(map, layerStates);

    // Revenir sur Standard si le style demandé échoue
    const onError = () => {
      console.warn(`[MapView] Échec du style "${currentBasemapId}", retour sur Standard.`);
      if (currentBasemapId !== DEFAULT_BASEMAP_ID) {
        setCurrentBasemapId(DEFAULT_BASEMAP_ID);
      }
    };

    applyBasemap(map, def, onLoaded, onError);
  }, [currentBasemapId, map, layerStates, setCurrentBasemapId]);

  return (
    <>
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Carte interactive PhotoAtlas"
      />
      <RadarLayer />
      <LightningLayer />
      <PhotoGuidesLayer />
    </>
  );
}
