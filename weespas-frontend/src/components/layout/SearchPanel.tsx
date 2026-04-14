import React, { useState, useCallback, useEffect } from 'react';
import { PropertyCategory, PropertyFilterParams, ListingType } from '../../types/propertyApi';
import { fetchCategories } from '../../api/properties';
import CustomSelect, { SelectOption } from '../ui/CustomSelect';
import './SearchPanel.css';

interface SearchPanelProps {
  filters: PropertyFilterParams;
  onChange: (filters: Partial<PropertyFilterParams>) => void;
  onSearch: () => void;
  onUseLocation: () => void;
}

const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  house: 'House',
  apartment: 'Apartment',
  villa: 'Villa',
  studio: 'Studio',
  office: 'Office',
  land: 'Land',
  warehouse: 'Warehouse',
  shop: 'Shop',
  kiosk: 'Kiosk',
  container: 'Container',
  stall: 'Stall',
  commercial_space: 'Commercial',
  other: 'Other',
};

const FALLBACK_CATEGORIES: PropertyCategory[] = [
  'house', 'apartment', 'villa', 'studio', 'office',
  'land', 'warehouse', 'shop', 'kiosk', 'container', 'stall', 'commercial_space', 'other',
];

const SearchPanel: React.FC<SearchPanelProps> = ({ filters, onChange, onSearch, onUseLocation }) => {
  const [categories, setCategories] = useState<PropertyCategory[]>(FALLBACK_CATEGORIES);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((cats) => {
        if (!cancelled && cats.length > 0) setCategories(cats);
      })
      .catch(() => { /* use fallback */ });
    return () => { cancelled = true; };
  }, []);

  const handleLocationClick = useCallback(() => {
    setLocating(true);
    onUseLocation();
    // Reset after a timeout in case geolocation takes a while
    setTimeout(() => setLocating(false), 5000);
  }, [onUseLocation]);

  const handleListingType = useCallback((type: ListingType) => {
    // Toggle: if already selected, deselect (clear); otherwise set
    onChange({ listing_type: filters.listing_type === type ? undefined : type });
  }, [filters.listing_type, onChange]);

  const handleNumberChange = useCallback(
    (field: keyof PropertyFilterParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange({ [field]: val === '' ? undefined : Number(val) });
    },
    [onChange]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      onChange({ category: value as PropertyCategory | 'all' });
    },
    [onChange]
  );

  const categoryOptions: SelectOption[] = [
    { label: 'All Types', value: 'all' },
    ...categories.map((cat) => ({
      label: CATEGORY_LABELS[cat] ?? cat,
      value: cat,
    })),
  ];

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch();
    },
    [onSearch]
  );

  const hasActiveFilters = Boolean(
    filters.listing_type ||
    (filters.category && filters.category !== 'all') ||
    filters.bedrooms !== undefined ||
    filters.bathrooms !== undefined ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    (filters.latitude && filters.longitude)
  );

  return (
    <aside className="search-panel" id="search-panel">
      <div className="search-panel__header">
        <span className="search-panel__title">Filters</span>
        {hasActiveFilters && (
          <button
            type="button"
            className="search-panel__clear"
            onClick={() => onChange({
              listing_type: undefined,
              category: 'all',
              bedrooms: undefined,
              bathrooms: undefined,
              min_price: undefined,
              max_price: undefined,
              latitude: undefined,
              longitude: undefined,
              radius: 10,
            })}
          >
            Clear all
          </button>
        )}
      </div>

      <form className="search-panel__body" onSubmit={handleSubmit}>
        {/* ── Location ── */}
        <button
          type="button"
          className={`location-button ${locating ? 'locating' : ''} ${filters.latitude && filters.longitude ? 'located' : ''}`}
          onClick={handleLocationClick}
          disabled={locating}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
          {locating
            ? 'Finding your location...'
            : filters.latitude && filters.longitude
              ? 'Location set — search nearby'
              : 'Use my location to search'}
        </button>

        {/* ── Sale / Rent Toggle ── */}
        <div className="search-panel__toggle">
          <button
            type="button"
            className={`toggle-pill ${filters.listing_type === 'rent' ? 'active' : ''}`}
            onClick={() => handleListingType('rent')}
          >
            For Rent
          </button>
          <button
            type="button"
            className={`toggle-pill ${filters.listing_type === 'sale' ? 'active' : ''}`}
            onClick={() => handleListingType('sale')}
          >
            For Sale
          </button>
        </div>

        {/* ── Radius ── */}
        <div className="field-group">
          <label>Radius (km)</label>
          <div className="radius-input-wrap">
            <input
              type="range"
              min={1}
              max={100}
              value={filters.radius ?? 10}
              onChange={(e) => onChange({ radius: Number(e.target.value) })}
              className="radius-slider"
            />
            <span className="radius-value">{filters.radius ?? 10} km</span>
          </div>
        </div>

        {/* ── Property Type ── */}
        <div className="field-group">
          <label>Property Type</label>
          <CustomSelect
            options={categoryOptions}
            value={filters.category ?? 'all'}
            onChange={handleCategoryChange}
            placeholder="All Types"
          />
        </div>

        {/* ── Beds & Baths (side-by-side) ── */}
        <div className="beds-baths-row">
          <div className="field-group">
            <label>Beds</label>
            <input
              type="number"
              min={0}
              value={filters.bedrooms ?? ''}
              onChange={handleNumberChange('bedrooms')}
              placeholder="Any"
            />
          </div>
          <div className="field-group">
            <label>Baths</label>
            <input
              type="number"
              min={0}
              value={filters.bathrooms ?? ''}
              onChange={handleNumberChange('bathrooms')}
              placeholder="Any"
            />
          </div>
        </div>

        {/* ── Price Range ── */}
        <div className="field-group">
          <label>Price Range (KES)</label>
          <div className="price-row">
            <input
              type="number"
              min={0}
              value={filters.min_price ?? ''}
              onChange={handleNumberChange('min_price')}
              placeholder="Min"
            />
            <span className="price-divider">—</span>
            <input
              type="number"
              min={0}
              value={filters.max_price ?? ''}
              onChange={handleNumberChange('max_price')}
              placeholder="Max"
            />
          </div>
        </div>

        {/* ── Search Button ── */}
        <button type="submit" className="primary-button search-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search Properties
        </button>
      </form>
    </aside>
  );
};

export default SearchPanel;
