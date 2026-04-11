/* ==========================================================================
   FORMAT UTILITIES
   Consistent formatting for prices, dates, distances across the app.
   All functions are pure — no side effects, easily testable.
   ========================================================================== */

/**
 * Format price with KES currency and smart abbreviation.
 * Examples: "KES 8.5M", "KES 25K", "KES 150K/mo"
 */
export function formatPrice(
  price: number | undefined,
  currency: string = 'KES',
  listingType?: string
): string {
  if (price === undefined || price === null) return 'Price on request';

  let formatted: string;
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    formatted = millions % 1 === 0
      ? `${currency} ${millions}M`
      : `${currency} ${millions.toFixed(1)}M`;
  } else if (price >= 1_000) {
    const thousands = price / 1_000;
    formatted = thousands % 1 === 0
      ? `${currency} ${thousands}K`
      : `${currency} ${thousands.toFixed(1)}K`;
  } else {
    formatted = `${currency} ${price.toLocaleString()}`;
  }

  /* Append /mo for rental listings */
  if (listingType === 'rent') {
    formatted += '/mo';
  }

  return formatted;
}

/**
 * Format date as relative time string.
 * Examples: "Just now", "2 hours ago", "3 days ago", "Jan 15, 2025"
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format distance in kilometers.
 * Examples: "1.2 km", "500 m", "< 100 m"
 */
export function formatDistance(km: number | undefined): string {
  if (km === undefined || km === null) return '';
  if (km < 0.1) return '< 100 m';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Format bed/bath count as compact string.
 * Examples: "3 bed · 2 bath", "Studio", "–"
 */
export function formatBedBath(
  bedrooms: number | undefined,
  bathrooms: number | undefined
): string {
  const parts: string[] = [];

  if (bedrooms !== undefined && bedrooms !== null) {
    parts.push(bedrooms === 0 ? 'Studio' : `${bedrooms} bed`);
  }
  if (bathrooms !== undefined && bathrooms !== null && bathrooms > 0) {
    parts.push(`${bathrooms} bath`);
  }

  return parts.length > 0 ? parts.join(' · ') : '';
}

/**
 * Generate vibe tags based on property attributes.
 * Returns 1-2 relevant lifestyle hashtags for the card.
 */
export function getVibeTags(property: {
  category?: string;
  bedrooms?: number;
  is_engineer_certified?: boolean;
  listing_type?: string;
  size_numeric?: number;
}): string[] {
  const tags: string[] = [];

  /* Category-based tags */
  const categoryTags: Record<string, string> = {
    studio: '#CompactLiving',
    apartment: '#CityVibes',
    villa: '#LuxuryLiving',
    house: '#FamilyHome',
    office: '#WorkFromHere',
    land: '#InvestmentReady',
    warehouse: '#CommercialSpace',
    shop: '#RetailReady',
    kiosk: '#StartupSpot',
  };

  if (property.category && categoryTags[property.category]) {
    tags.push(categoryTags[property.category]);
  }

  /* Feature-based tags */
  if (property.is_engineer_certified) {
    tags.push('#Certified');
  }
  if (property.bedrooms && property.bedrooms >= 4) {
    tags.push('#Spacious');
  }
  if (property.listing_type === 'rent') {
    tags.push('#MoveInReady');
  }

  return tags.slice(0, 2);
}
