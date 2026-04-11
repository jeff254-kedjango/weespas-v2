import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Property } from '../../types/propertyApi';
import './PropertyGallery.css';

interface PropertyGalleryProps {
  properties: Property[];
  selectedPropertyId: string | null;
  onSelect: (property: Property) => void;
  loading: boolean;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ properties, selectedPropertyId, onSelect, loading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const visibleProperties = useMemo(() => properties.slice(0, 5), [properties]);

  useEffect(() => {
    if (loading || !visibleProperties.length) return;
    const selectedIndex = selectedPropertyId
      ? visibleProperties.findIndex((item) => item.id === selectedPropertyId)
      : 0;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [visibleProperties, selectedPropertyId, loading]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const activeCard = track.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    activeCard?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }, [activeIndex]);

  const featured = visibleProperties[activeIndex] || visibleProperties[0];

  const changeIndex = (direction: 'prev' | 'next') => {
    if (!visibleProperties.length) return;
    setActiveIndex((current) => {
      const nextIndex = direction === 'prev' ? current - 1 : current + 1;
      return Math.min(Math.max(nextIndex, 0), visibleProperties.length - 1);
    });
  };

  if (loading) {
    return (
      <div className="gallery-card gallery-skeleton">
        <div className="hero-skeleton" />
        <div className="carousel-skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="thumbnail-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="gallery-card">
      <div className="gallery-hero" aria-label="Featured property">
        {featured?.main_image?.thumbnail_url && (
          <img
            className="gallery-hero__image"
            src={featured.main_image.thumbnail_url}
            alt={featured.main_image.alt_text ?? featured.title}
            loading="lazy"
          />
        )}
        <div className="hero-gradient" />
        <div className="gallery-hero__content">
          <span className="eyebrow">Featured stay near you</span>
          <h2>{featured?.title || 'Handpicked property'}</h2>
          {featured?.distance !== undefined && featured?.distance !== null && (
            <p className="subtext">{featured.distance.toFixed(1)} km away</p>
          )}
          <p className="hero-copy">{featured?.description || 'Discover one of the best local experiences in your area.'}</p>
        </div>
      </div>

      <div className="carousel-shell">
        <button type="button" className="carousel-btn" onClick={() => changeIndex('prev')} disabled={activeIndex === 0}>
          ‹
        </button>
        <div className="carousel-track" ref={trackRef}>
          {visibleProperties.map((property, index) => (
            <button
              key={property.id}
              type="button"
              className={index === activeIndex ? 'carousel-item active' : 'carousel-item'}
              data-index={index}
              onClick={() => {
                setActiveIndex(index);
                onSelect(property);
              }}
            >
              <div className="thumbnail-visual">
                <span>{property.title.slice(0, 1)}</span>
              </div>
              <div className="thumbnail-copy">
                <strong>{property.title}</strong>
                <span>{property.distance !== undefined && property.distance !== null ? `${property.distance.toFixed(1)} km` : 'Nearby'}</span>
              </div>
            </button>
          ))}
        </div>
        <button type="button" className="carousel-btn" onClick={() => changeIndex('next')} disabled={activeIndex >= visibleProperties.length - 1}>
          ›
        </button>
      </div>
    </section>
  );
};

export default PropertyGallery;
