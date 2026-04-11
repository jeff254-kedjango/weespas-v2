/* ==========================================================================
   HERO — Full-viewport landing section
   Background image with dark overlay, headline targeting Kenyan youth,
   inline search CTA with Electric Lime button.
   ========================================================================== */

import React, { useState } from 'react';
import Icon from '../ui/Icon';
import './Hero.css';

interface HeroProps {
  propertyCount: number;
  onSearch?: (query: string) => void;
}

const Hero: React.FC<HeroProps> = ({ propertyCount, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };
  return (
    <section className="hero">
      {/* Background image with overlay */}
      <div className="hero__bg">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80"
          alt=""
          className="hero__bg-image"
          loading="eager"
        />
        <div className="hero__overlay" />
      </div>

      {/* Content */}
      <div className="hero__content container">
        <span className="hero__eyebrow">Kenya's #1 Property Platform</span>
        <h1 className="hero__title">
          Find Your <br />Dream Space
        </h1>
        <p className="hero__subtitle">
          Discover {propertyCount.toLocaleString()}+ homes, apartments, and land
          across 14 cities. Location-first search built for you.
        </p>

        {/* Search pill */}
        <div className="hero__search-bar">
          <div className="hero__search-icon">
            <Icon name="mapPin" size={20} />
          </div>
          <span className="hero__search-text">Search Nairobi, Mombasa, Kisumu...</span>
          <Link to="/#listings" className="hero__search-btn btn btn-primary">
            Explore
          </Link>
        </div>

        {/* Quick stats */}
        <div className="hero__stats">
          <div className="hero__stat">
            <strong>{propertyCount}+</strong>
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

      {/* Scroll indicator */}
      <div className="hero__scroll-hint">
        <span>Scroll to explore</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
};

export default Hero;
