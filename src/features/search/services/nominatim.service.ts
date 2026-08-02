import type { ISearchProvider, SearchOptions, SearchResult } from "../types";

/** Types bruts de la réponse Nominatim — usage interne uniquement */
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

interface NominatimResult {
  place_id: number;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
  importance: number;
  address: NominatimAddress;
  boundingbox: [string, string, string, string];
}

function toSearchResult(item: NominatimResult): SearchResult {
  const addr = item.address;
  const locality = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.hamlet ?? "";

  return {
    id: `${item.osm_type}/${item.osm_id}`,
    name: item.display_name.split(",")[0]?.trim() ?? item.display_name,
    displayName: item.display_name,
    type: item.type,
    class: item.class,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    country: addr.country ?? "",
    region: addr.state ?? "",
    department: addr.county ?? addr["ISO3166-2-lvl6"] ?? "",
    locality,
    importance: item.importance,
    boundingBox: item.boundingbox
      ? [
          parseFloat(item.boundingbox[2]),
          parseFloat(item.boundingbox[0]),
          parseFloat(item.boundingbox[3]),
          parseFloat(item.boundingbox[1]),
        ]
      : undefined,
  };
}

export class NominatimProvider implements ISearchProvider {
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const params = new URLSearchParams({ q: query });
    if (options.limit) params.set("limit", String(options.limit));

    const response = await fetch(`/api/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Erreur de recherche : ${response.status}`);
    }

    const raw: unknown = await response.json();

    if (!Array.isArray(raw)) return [];

    return (raw as NominatimResult[]).map(toSearchResult);
  }
}
