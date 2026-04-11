import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { fetchPropertyList, filterProperties } from '../api/properties';
import { PaginatedResponse, Property, PropertyFilterParams } from '../types/propertyApi';

const DEFAULT_PAGE_SIZE = 12;

const shouldUseFilterEndpoint = (filters: PropertyFilterParams) => {
  return Boolean(
    filters.latitude !== undefined ||
    filters.longitude !== undefined ||
    filters.radius !== undefined ||
    filters.listing_type ||
    (filters.category && filters.category !== 'all') ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    filters.engineer_certified !== undefined ||
    filters.bedrooms !== undefined ||
    filters.bathrooms !== undefined ||
    filters.sort_by ||
    filters.sort_order ||
    filters.query
  );
};

export function usePropertySearch(filters: PropertyFilterParams = {}) {
  const normalizedFilters: PropertyFilterParams = {
    ...filters,
    skip: 0,
    limit: filters.limit ?? DEFAULT_PAGE_SIZE
  };
  const key = ['properties', JSON.stringify(normalizedFilters)];
  const useFilter = shouldUseFilterEndpoint(filters);

  const query = useInfiniteQuery<PaginatedResponse<Property>, Error, InfiniteData<PaginatedResponse<Property>, number>, readonly unknown[], number>({
    queryKey: key,
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      const request: PropertyFilterParams = { ...normalizedFilters, skip: pageParam };
      return useFilter
        ? filterProperties(request)
        : fetchPropertyList({ skip: request.skip, limit: request.limit });
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.skip + lastPage.limit;
      return nextPage < lastPage.total ? nextPage : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const properties = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    properties,
    total
  };
}
