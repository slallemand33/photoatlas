import { type NextRequest, NextResponse } from "next/server";

import type { SearchResult } from "@/features/search/types";

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  hamlet?: string;
  suburb?: string;
  neighbourhood?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  road?: string;
  "ISO3166-2-lvl6"?: string;
  [key: string]: string | undefined;
}

interface NominatimReverseResult {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  lat: string;
  lon: string;
  display_name?: string;
  type?: string;
  class?: string;
  importance?: number;
  address?: NominatimAddress;
  boundingbox?: [string, string, string, string];
}

function toSearchResult(
  item: NominatimReverseResult,
  latitude: number,
  longitude: number,
): SearchResult {
  const addr = item.address ?? {};
  const locality = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.hamlet ?? "";
  const name =
    locality ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.road ||
    item.display_name?.split(",")[0]?.trim() ||
    "📍 Point sélectionné";

  return {
    id:
      item.osm_type && item.osm_id
        ? `${item.osm_type}/${item.osm_id}`
        : `reverse/${latitude.toFixed(5)}/${longitude.toFixed(5)}`,
    name,
    displayName:
      item.display_name ??
      `${name} · Latitude ${latitude.toFixed(5)}, Longitude ${longitude.toFixed(5)}`,
    type: item.type ?? "selected_point",
    class: item.class ?? "place",
    latitude: Number.parseFloat(item.lat) || latitude,
    longitude: Number.parseFloat(item.lon) || longitude,
    country: addr.country ?? "",
    region: addr.state ?? "",
    department: addr.county ?? addr["ISO3166-2-lvl6"] ?? "",
    locality,
    importance: item.importance ?? 0,
    boundingBox: item.boundingbox
      ? [
          Number.parseFloat(item.boundingbox[2]),
          Number.parseFloat(item.boundingbox[0]),
          Number.parseFloat(item.boundingbox[3]),
          Number.parseFloat(item.boundingbox[1]),
        ]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  const latitude = Number.parseFloat(request.nextUrl.searchParams.get("lat") ?? "");
  const longitude = Number.parseFloat(request.nextUrl.searchParams.get("lon") ?? "");

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Coordonnées invalides" }, { status: 400 });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Coordonnées hors limites" }, { status: 400 });
  }

  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "14");
  url.searchParams.set("accept-language", "fr,en");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "PhotoAtlas/1.0 (contact@photoatlas.app)",
    },
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    return NextResponse.json(null, { status: 404 });
  }

  if (!response.ok) {
    return NextResponse.json(null, { status: response.status });
  }

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || "error" in data) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(toSearchResult(data as NominatimReverseResult, latitude, longitude));
}
