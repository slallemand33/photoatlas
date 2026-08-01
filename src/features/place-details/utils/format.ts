const TYPE_LABELS: Record<string, string> = {
  city: "Ville",
  town: "Commune",
  village: "Village",
  hamlet: "Hameau",
  suburb: "Quartier",
  neighbourhood: "Quartier",
  municipality: "Commune",
  road: "Route / Voie",
  pedestrian: "Zone piétonne",
  path: "Sentier",
  track: "Piste",
  building: "Bâtiment",
  administrative: "Zone administrative",
  country: "Pays",
  state: "Région",
  county: "Département",
  water: "Plan d'eau",
  lake: "Lac",
  river: "Rivière",
  peak: "Sommet",
  valley: "Vallée",
  forest: "Forêt",
  park: "Parc",
  nature_reserve: "Réserve naturelle",
  coastline: "Littoral",
  beach: "Plage",
  cliff: "Falaise",
};

const TYPE_ZOOM: Record<string, number> = {
  country: 5,
  state: 7,
  county: 9,
  city: 11,
  municipality: 12,
  town: 12,
  village: 13,
  hamlet: 14,
  suburb: 13,
  neighbourhood: 14,
  road: 15,
  pedestrian: 15,
  path: 16,
  track: 15,
  peak: 13,
  building: 17,
};

export function formatPlaceType(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function formatGPSCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(5)}° ${latDir}   ${Math.abs(lon).toFixed(5)}° ${lonDir}`;
}

export function getZoomForPlace(type: string): number {
  return TYPE_ZOOM[type] ?? 12;
}
