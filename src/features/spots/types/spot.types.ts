export interface NearbySpotsSearchInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit: number;
}

export interface NearbySpotRpcRow {
  id: string;
  name: string;
  slug: string;
  spot_type: string;
  latitude: number;
  longitude: number;
  distance_m: number;
  country_code: string;
  region: string | null;
  locality: string | null;
  description: string | null;
  landscape_potential: number | null;
  sunrise_potential: number | null;
  sunset_potential: number | null;
  astro_potential: number | null;
}

export interface NearbySpot {
  id: string;
  name: string;
  slug: string;
  spotType: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  countryCode: string;
  region: string | null;
  locality: string | null;
  description: string | null;
  potentials: {
    landscape: number | null;
    sunrise: number | null;
    sunset: number | null;
    astro: number | null;
  };
}

export interface NearbySpotsResponse {
  center: {
    latitude: number;
    longitude: number;
  };
  radiusKm: number;
  count: number;
  spots: NearbySpot[];
}