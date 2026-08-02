"use client";

import type { Map as MaplibreMap } from "maplibre-gl";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface MapContextValue {
  map: MaplibreMap | null;
  setMap: (map: MaplibreMap | null) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMapState] = useState<MaplibreMap | null>(null);

  const setMap = useCallback((newMap: MaplibreMap | null) => {
    setMapState(newMap);
  }, []);

  const value = useMemo(() => ({ map, setMap }), [map, setMap]);

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

/** Accès à l'instance MapLibre — disponible pour tous les futurs composants de couches */
export function useMap(): MaplibreMap | null {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap doit être utilisé dans un MapProvider");
  return context.map;
}

/** Usage interne uniquement — réservé à MapView pour enregistrer l'instance */
export function useSetMap(): (map: MaplibreMap | null) => void {
  const context = useContext(MapContext);
  if (!context) throw new Error("useSetMap doit être utilisé dans un MapProvider");
  return context.setMap;
}
