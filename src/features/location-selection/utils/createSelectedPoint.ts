import type { SearchResult } from "@/features/search/types";

export const SELECTED_POINT_NAME = "📍 Point sélectionné";

export function createSelectedPoint(latitude: number, longitude: number): SearchResult {
  const formattedLatitude = latitude.toFixed(5);
  const formattedLongitude = longitude.toFixed(5);

  return {
    id: `selected-point/${formattedLatitude}/${formattedLongitude}`,
    name: SELECTED_POINT_NAME,
    displayName: `${SELECTED_POINT_NAME} · Latitude ${formattedLatitude}, Longitude ${formattedLongitude}`,
    type: "selected_point",
    class: "manual",
    latitude,
    longitude,
    country: "",
    region: "",
    department: "",
    locality: "",
    importance: 0,
  };
}
