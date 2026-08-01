"use client";

import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/useDebounce";

import { searchService } from "../services/search.service";
import type { SearchResult } from "../types";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;
const STALE_TIME_MS = 5 * 60 * 1000;

export function useSearch(query: string): {
  results: SearchResult[];
  isLoading: boolean;
  hasError: boolean;
} {
  const debouncedQuery = useDebounce(query.trim(), DEBOUNCE_MS);
  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isError } = useQuery({
    queryKey: ["geo-search", debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    results: data ?? [],
    isLoading: isFetching && enabled,
    hasError: isError,
  };
}
