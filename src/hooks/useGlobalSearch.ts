import { useState, useEffect, useCallback, useRef } from 'react';
import {
  searchService,
  SearchRequest,
  SearchResponse,
  SuggestionsResponse,
} from '../services/searchService';
import { DateRange } from 'react-day-picker';

interface UseGlobalSearchProps {
  orgId: string;
  locationContextId?: string;
}

interface SearchFilters {
  entities: string[];
  itemTypes: string[];
  transactionType: string[];
  dateRange?: DateRange;
  status: string[];
  amountRange?: {
    min: number;
    max: number;
  };
}

interface UseGlobalSearchReturn {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchResults: SearchResponse | null;
  suggestions: string[];
  isSuggestionsLoading: boolean;

  // Filter state
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  selectedFilterTags: string[];
  setSelectedFilterTags: (tags: string[]) => void;

  // Search functions
  performSearch: (query?: string) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Filter functions
  updateFilter: (filterType: keyof SearchFilters, value: any) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  hasMorePages: boolean;
  loadMoreResults: () => Promise<void>;
}

export const useGlobalSearch = ({
  orgId,
  locationContextId,
}: UseGlobalSearchProps): UseGlobalSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    entities: [],
    itemTypes: [],
    transactionType: [],
    status: [],
  });

  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const performSearch = useCallback(
    async (query?: string) => {
      const searchTerm = query || searchQuery;

      if (!searchTerm.trim() || !orgId) {
        setSearchResults(null);
        return;
      }

      setIsSearching(true);

      try {
        const entityTypes = searchService.mapEntityTypesToAPI({
          entities: filters.entities,
          itemTypes: filters.itemTypes,
          transactionType: filters.transactionType,
        });

        const searchRequest: SearchRequest = {
          query: searchTerm,
          entityTypes: entityTypes.length > 0 ? entityTypes : undefined,
          filters: {
            ...(filters.dateRange?.from &&
              filters.dateRange?.to && {
                dateRange: {
                  from: filters.dateRange.from.toISOString(),
                  to: filters.dateRange.to.toISOString(),
                },
              }),
            ...(filters.status.length > 0 && { status: filters.status }),
            ...(filters.amountRange && { amountRange: filters.amountRange }),
          },
          pagination: {
            page: currentPage,
            limit: 20,
          },
          sortBy: 'relevance',
          sortOrder: 'desc',
          fuzzy: true,
          highlight: true,
          minScore: 0.1,
          facets: true,
        };

        const response = await searchService.globalSearch(
          searchRequest,
          orgId,
          locationContextId
        );
        setSearchResults(response);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, orgId, locationContextId, filters, currentPage]
  );

  // Debounced suggestions function
  const getSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || !orgId) {
        setSuggestions([]);
        return;
      }

      // Clear previous timeout
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }

      suggestionsTimeoutRef.current = setTimeout(async () => {
        setIsSuggestionsLoading(true);

        try {
          const response = await searchService.getSuggestions(
            {
              query,
              limit: 10,
            },
            orgId
          );
          setSuggestions(response.suggestions);
        } catch (error) {
          console.error('Failed to get suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsSuggestionsLoading(false);
        }
      }, 300); // 300ms debounce
    },
    [orgId]
  );

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(null);
    setSuggestions([]);
    setCurrentPage(1);

    // Clear timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
  }, []);

  // Update individual filter
  const updateFilter = useCallback(
    (filterType: keyof SearchFilters, value: any) => {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
      setCurrentPage(1); // Reset to first page when filters change
    },
    []
  );

  // Apply filters and search
  const applyFilters = useCallback(() => {
    performSearch();
  }, [performSearch]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      entities: [],
      itemTypes: [],
      transactionType: [],
      status: [],
    });
    setSelectedFilterTags([]);
    setCurrentPage(1);
    performSearch();
  }, [performSearch]);

  // Computed values
  const hasMorePages = searchResults
    ? currentPage < searchResults.totalPages
    : false;

  // Load more results for pagination
  const loadMoreResults = useCallback(async () => {
    if (!searchResults || !hasMorePages || isSearching) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    // Perform search with next page
    await performSearch();
  }, [searchResults, hasMorePages, isSearching, currentPage, performSearch]);

  // Effect to trigger search when query changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch();
        getSuggestions(searchQuery);
      }, 500); // 500ms debounce for search
    } else {
      setSearchResults(null);
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch, getSuggestions]);

  // Effect to trigger search when filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [filters, performSearch]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    suggestions,
    isSuggestionsLoading,

    // Filter state
    filters,
    setFilters,
    selectedFilterTags,
    setSelectedFilterTags,

    // Search functions
    performSearch,
    getSuggestions,
    clearSearch,

    // Filter functions
    updateFilter,
    applyFilters,
    clearFilters,

    // Pagination
    currentPage,
    setCurrentPage,
    hasMorePages,
    loadMoreResults,
  };
};
