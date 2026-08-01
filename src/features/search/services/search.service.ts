import type { ISearchProvider, SearchOptions, SearchResult } from "../types";

import { NominatimProvider } from "./nominatim.service";

/**
 * Service de recherche géographique — façade provider-agnostique.
 * Pour changer de fournisseur : remplacer l'instance dans la dernière ligne.
 */
class SearchService {
  constructor(private readonly provider: ISearchProvider) {}

  search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    return this.provider.search(query, options);
  }
}

export const searchService = new SearchService(new NominatimProvider());
