export type ListingType = 'sale' | 'rent';
export type PropertyCategory =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'studio'
  | 'office'
  | 'land'
  | 'warehouse'
  | 'shop'
  | 'kiosk'
  | 'container'
  | 'stall'
  | 'commercial_space'
  | 'other';

export interface PropertyImage {
  id: string;
  url: string;
  thumbnail_url: string;
  alt_text?: string;
  order?: number;
  is_main?: boolean;
}

export interface PropertyVideo {
  id: string;
  url: string;
  streaming_url?: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  duration?: number;
}

export interface PropertyAgent {
  id: string;
  agent_name?: string;
  agent_phone_number?: string;
  agent_profile_picture?: string;
  email?: string;
  bio?: string;
  is_verified?: boolean;
}

export interface PropertyAddress {
  id: string;
  location_name?: string;
  street_address?: string;
  city?: string;
  county?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  listing_type?: ListingType;
  category?: PropertyCategory;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  address?: PropertyAddress;
  agent?: PropertyAgent;
  images?: PropertyImage[];
  videos?: PropertyVideo[];
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  parking_spaces?: number;
  year_built?: number;
  is_engineer_certified?: boolean;
  is_featured?: boolean;
  view_count?: number;
  size_numeric?: number;
  is_active?: boolean;
  distance?: number;
  agent_name?: string;
  main_image?: PropertyImage;
  created_at?: string;
  updated_at?: string;
  expires_at?: string | null;
}

export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}

export interface PropertyFilterParams {
  skip?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  listing_type?: ListingType;
  category?: PropertyCategory | 'all';
  min_price?: number;
  max_price?: number;
  engineer_certified?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  sort_by?: 'price' | 'distance' | 'created_at';
  sort_order?: 'asc' | 'desc';
  query?: string;
}
