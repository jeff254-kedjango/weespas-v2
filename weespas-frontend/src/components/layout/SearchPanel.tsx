import React from 'react';
import { PropertyCategory, PropertyFilterParams } from '../../types/propertyApi';
import './SearchPanel.css';

interface SearchPanelProps {
  filters: PropertyFilterParams;
  onChange: (filters: Partial<PropertyFilterParams>) => void;
  onSearch: () => void;
  onUseLocation: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ filters, onChange, onSearch, onUseLocation }) => {
  return (
    <aside className="search-panel" id="search-panel">
      <div className="search-panel__header">
        <span>QUICK SEARCH</span>
      </div>

      <div className="search-panel__body">
        <div className="search-panel__toggle">
          <button
            type="button"
            className={filters.listing_type === 'sale' ? 'toggle-pill active' : 'toggle-pill'}
            onClick={() => onChange({ listing_type: 'sale' })}
          >
            For Sale
          </button>
          <button
            type="button"
            className={filters.listing_type === 'rent' ? 'toggle-pill active' : 'toggle-pill'}
            onClick={() => onChange({ listing_type: 'rent' })}
          >
            For Rent
          </button>
        </div>

        <div className="field-group">
          <label>Location</label>
          <div className="location-row">
            <input
              type="number"
              step="0.0001"
              value={filters.latitude ?? ''}
              onChange={(event) => onChange({ latitude: Number(event.target.value) })}
              placeholder="Latitude"
            />
            <input
              type="number"
              step="0.0001"
              value={filters.longitude ?? ''}
              onChange={(event) => onChange({ longitude: Number(event.target.value) })}
              placeholder="Longitude"
            />
          </div>
          <button type="button" className="location-button" onClick={onUseLocation}>
            Use my location
          </button>
        </div>

        <div className="field-group">
          <label>Radius (km)</label>
          <input
            type="number"
            value={filters.radius ?? 10}
            onChange={(event) => onChange({ radius: Number(event.target.value) })}
            placeholder="10"
          />
        </div>

        <div className="field-group">
          <label>Property type</label>
          <select
            value={filters.category ?? 'all'}
            onChange={(event) => onChange({ category: event.target.value as PropertyCategory | 'all' })}
          >
            <option value="all">All categories</option>
            <option value="house">House</option>
            <option value="land">Land</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        <div className="form-grid">
          <div className="field-group">
            <label>Beds</label>
            <input
              type="number"
              value={filters.bedrooms ?? ''}
              onChange={(event) => onChange({ bedrooms: Number(event.target.value) })}
              placeholder="Any"
            />
          </div>
          <div className="field-group">
            <label>Baths</label>
            <input
              type="number"
              value={filters.bathrooms ?? ''}
              onChange={(event) => onChange({ bathrooms: Number(event.target.value) })}
              placeholder="Any"
            />
          </div>
          <div className="field-group">
            <label>Min Price</label>
            <input
              type="number"
              value={filters.min_price ?? ''}
              onChange={(event) => onChange({ min_price: Number(event.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="field-group">
            <label>Max Price</label>
            <input
              type="number"
              value={filters.max_price ?? ''}
              onChange={(event) => onChange({ max_price: Number(event.target.value) })}
              placeholder="1000000"
            />
          </div>
        </div>

        <button type="button" className="primary-button search-button" onClick={onSearch}>
          Search
        </button>

        <button type="button" className="link-button" onClick={() => onChange({})}>
          Advanced Search
        </button>
      </div>
    </aside>
  );
};

export default SearchPanel;
