/** Types de lieux connus — extensibles via string pour les futurs fournisseurs */
export type SearchResultType =
  | "city"
  | "town"
  | "village"
  | "hamlet"
  | "suburb"
  | "neighbourhood"
  | "road"
  | "pedestrian"
  | "path"
  | "house"
  | "building"
  | "country"
  | "state"
  | "county"
  | (string & Record<never, never>); // extensible sans perdre l'autocomplétion

export interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  type: SearchResultType;
  class: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  department: string;
  locality: string;
  importance: number;
  boundingBox?: [west: number, south: number, east: number, north: number];
}

export interface SearchOptions {
  limit?: number;
  language?: string;
  countryCode?: string;
}

/** Contrat d'un fournisseur de recherche — permet de changer de source facilement */
export interface ISearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}
