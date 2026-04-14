/* ==========================================================================
   HERO — 100vh landing section
   White background, search bar top-center, info left, map animation as
   ambient background layer behind content.
   ========================================================================== */

import React, { useState } from 'react';
import Icon from '../ui/Icon';
import HeroAnimation from './HeroAnimation';
import './Hero.css';

interface HeroProps {
  propertyCount: number;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  searchLoading?: boolean;
  searchTotal?: number;
}

const Hero: React.FC<HeroProps> = ({ propertyCount, onSearch, searchQuery = '', searchLoading, searchTotal }) => {
  const [query, setQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('');
  };

  return (
    <section className="hero">
      {/* Animation — background layer (z-index 1) */}
      <div className="hero__animation">
        <HeroAnimation />
      </div>

      {/* Search bar — top center (z-index 2) */}
      <div className="hero__search-region container">
        <form className="hero__search-bar" onSubmit={handleSubmit}>
          <div className="hero__search-icon">
            <Icon name="mapPin" size={20} />
          </div>
          <input
            type="text"
            className="hero__search-input"
            placeholder="Search Nairobi, Mombasa, Kisumu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search properties"
          />
          {query && (
            <button type="button" className="hero__search-clear" onClick={handleClear} aria-label="Clear search">
              <Icon name="x" size={16} />
            </button>
          )}
          <button type="submit" className="hero__search-btn btn btn-primary" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {searchQuery && searchTotal !== undefined && (
          <p className="hero__search-results-hint">
            {searchTotal} result{searchTotal !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Main content (z-index 2) */}
      <div className="hero__body container">
        <div className="hero__info">
          <span className="hero__eyebrow">Kenya's #1 Property Platform</span>
          <h1 className="hero__title">
            Find Your <br />Dream Space
          </h1>
          <p className="hero__subtitle">
            Discover {propertyCount.toLocaleString()}+ homes, apartments, and land
            across 14 cities. Location-first search built for you.
          </p>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <strong>12+</strong>
              <span>Listings</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <strong>14</strong>
              <span>Cities</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <strong>10</strong>
              <span>Agents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint (z-index 2) */}
      <div className="hero__scroll-hint">
        <span className="hero__scroll-text">Scroll to explore</span>
        <div className="hero__scroll-line" />
      </div>

      {/* Scroll anchor */}
      <div id="after-hero" />
    </section>
  );
};

export default Hero;
