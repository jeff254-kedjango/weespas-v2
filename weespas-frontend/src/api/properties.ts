import { fetchJson, API_BASE_URL } from './config';
import { PaginatedResponse, Property, PropertyCategory, PropertyFilterParams } from '../types/propertyApi';

function buildSearchParams(params: Record<string, any>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(key, String(value));
  });

  return query.toString();
}

const hasGeoQuery = (params: PropertyFilterParams) => {
  return params.latitude !== undefined && params.longitude !== undefined && params.radius !== undefined;
};

const hasAdvancedFilters = (params: PropertyFilterParams) => {
  return Boolean(
    params.listing_type ||
    (params.category && params.category !== 'all') ||
    params.min_price !== undefined ||
    params.max_price !== undefined ||
    params.engineer_certified !== undefined ||
    params.bedrooms !== undefined ||
    params.bathrooms !== undefined ||
    params.sort_by ||
    params.sort_order ||
    params.query
  );
};

export async function fetchPropertyList(params: { skip?: number; limit?: number } = {}): Promise<PaginatedResponse<Property>> {
  const queryString = buildSearchParams({
    skip: params.skip ?? 0,
    limit: params.limit ?? 12
  });

  return fetchJson<PaginatedResponse<Property>>(`${API_BASE_URL}/properties?${queryString}`);
}

export async function fetchPropertyDetails(propertyId: string): Promise<Property> {
  return fetchJson<Property>(`${API_BASE_URL}/properties/${propertyId}`);
}

export async function fetchNearbyProperties(params: PropertyFilterParams): Promise<PaginatedResponse<Property>> {
  const queryString = buildSearchParams({
    latitude: params.latitude,
    longitude: params.longitude,
    radius: params.radius ?? 10,
    skip: params.skip ?? 0,
    limit: params.limit ?? 20
  });

  return fetchJson<PaginatedResponse<Property>>(`${API_BASE_URL}/properties/nearby?${queryString}`);
}

export async function filterProperties(params: PropertyFilterParams): Promise<PaginatedResponse<Property>> {
  return fetchJson<PaginatedResponse<Property>>(`${API_BASE_URL}/properties/filter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skip: params.skip ?? 0,
      limit: params.limit ?? 20,
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      listing_type: params.listing_type,
      category: params.category === 'all' ? undefined : params.category,
      min_price: params.min_price,
      max_price: params.max_price,
      engineer_certified: params.engineer_certified,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
      query: params.query
    })
  });
}

export async function searchProperties(query: string, skip = 0, limit = 20): Promise<PaginatedResponse<Property>> {
  const queryString = buildSearchParams({ q: query, skip, limit });
  return fetchJson<PaginatedResponse<Property>>(`${API_BASE_URL}/properties/search/query?${queryString}`);
}

export async function fetchFeaturedProperties(limit = 10): Promise<Property[]> {
  const queryString = buildSearchParams({ limit });
  return fetchJson<Property[]>(`${API_BASE_URL}/properties/featured?${queryString}`);
}

export async function fetchCategories(): Promise<PropertyCategory[]> {
  try {
    return await fetchJson<PropertyCategory[]>(`${API_BASE_URL}/properties/categories`);
  } catch {
    // Endpoint may not exist yet — return empty so the component uses its fallback
    return [];
  }
}

export async function fetchGeoProperties(params: PropertyFilterParams): Promise<PaginatedResponse<Property>> {
  if (hasAdvancedFilters(params)) {
    return filterProperties(params);
  }
  if (hasGeoQuery(params)) {
    return fetchNearbyProperties(params);
  }
  return fetchPropertyList(params);
}
