import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Property } from '../../types/propertyApi';
import { fetchFeaturedProperties } from '../../api/properties';
import './PropertyGallery.css';

interface PropertyGalleryProps {
  selectedPropertyId: string | null;
  onSelect: (property: Property) => void;
}

/** Format price as KES shorthand (e.g. "5M", "25K") */
function formatShortPrice(price?: number, currency?: string): string {
  if (!price) return '';
  const prefix = currency === 'KES' || !currency ? 'KES ' : `${currency} `;
  if (price >= 1_000_000) return `${prefix}${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  if (price >= 1_000) return `${prefix}${(price / 1_000).toFixed(price % 1_000 === 0 ? 0 : 0)}K`;
  return `${prefix}${price}`;
}

/** Get carousel/hero image — prefer full-res URL for sharper display, thumbnail as fallback */
function getCardImage(property: Property): { src: string; srcSet?: string } | null {
  const img = property.main_image ?? property.images?.[0];
  if (!img) return null;
  const full = img.url;
  const thumb = img.thumbnail_url;
  if (full && thumb && full !== thumb) {
    return { src: full, srcSet: `${thumb} 200w, ${full} 600w` };
  }
  return { src: full || thumb };
}

const AUTOPLAY_INTERVAL = 4000;

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ selectedPropertyId, onSelect }) => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const changingRef = useRef(false);

  // Fetch featured properties from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeaturedProperties(10)
      .then((data) => {
        if (!cancelled) {
          setFeaturedProperties(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const visibleProperties = useMemo(() => featuredProperties.slice(0, 10), [featuredProperties]);

  // Sync activeIndex with selectedPropertyId from outside
  useEffect(() => {
    if (loading || !visibleProperties.length || !selectedPropertyId) return;
    const idx = visibleProperties.findIndex((p) => p.id === selectedPropertyId);
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx);
    }
  }, [visibleProperties, selectedPropertyId, loading]);

  const changeIndex = useCallback((newIndex: number, wrap = false) => {
    if (!visibleProperties.length || changingRef.current) return;
    let target = newIndex;
    if (wrap) {
      target = newIndex >= visibleProperties.length ? 0 : newIndex < 0 ? visibleProperties.length - 1 : newIndex;
    } else {
      target = Math.min(Math.max(newIndex, 0), visibleProperties.length - 1);
    }
    if (target === activeIndex) return;

    changingRef.current = true;
    setHeroFading(true);
    setTimeout(() => {
      setActiveIndex(target);
      setHeroFading(false);
      changingRef.current = false;
    }, 200);
  }, [activeIndex, visibleProperties.length]);

  const handlePrev = useCallback(() => changeIndex(activeIndex - 1, true), [changeIndex, activeIndex]);
  const handleNext = useCallback(() => changeIndex(activeIndex + 1, true), [changeIndex, activeIndex]);

  // --- Auto-scroll: advances every 4s unless paused ---
  useEffect(() => {
    if (paused || loading || visibleProperties.length <= 1) {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
        autoplayTimer.current = null;
      }
      return;
    }

    autoplayTimer.current = setInterval(() => {
      changeIndex(activeIndex + 1, true);
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current);
        autoplayTimer.current = null;
      }
    };
  }, [paused, loading, visibleProperties.length, activeIndex, changeIndex]);

  // Pause on hover
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  // Pause on card click (user interaction)
  const handleCardClick = (index: number, property: Property) => {
    setPaused(true);
    changeIndex(index);
    onSelect(property);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { setPaused(true); handlePrev(); }
      if (e.key === 'ArrowRight') { setPaused(true); handleNext(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handlePrev, handleNext]);

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    const threshold = 50;
    if (touchDeltaX.current > threshold) handlePrev();
    else if (touchDeltaX.current < -threshold) handleNext();
    touchDeltaX.current = 0;
  };

  const featured = visibleProperties[activeIndex] || visibleProperties[0];
  const heroImage = featured ? getCardImage(featured) : null;

  // Calculate translateX: slide the track so the active card is at the start
  // Each card is 200px wide + 12px gap
  const CARD_WIDTH = 200;
  const CARD_GAP = 12;
  const trackOffset = -(activeIndex * (CARD_WIDTH + CARD_GAP));

  if (loading) {
    return (
      <div className="gallery-card gallery-skeleton" aria-busy="true">
        <div className="hero-skeleton">
          <div className="hero-skeleton__content">
            <div className="skel-line skel-eyebrow" />
            <div className="skel-line skel-title" />
            <div className="skel-line skel-subtitle" />
            <div className="skel-line skel-body" />
          </div>
        </div>
        <div className="carousel-skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="thumbnail-skeleton">
              <div className="skel-thumb-img" />
              <div className="skel-thumb-text">
                <div className="skel-line" />
                <div className="skel-line skel-short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!visibleProperties.length) return null;

  return (
    <section
      className="gallery-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* gallery-card has overflow:hidden for border-radius clipping */}
      <div className="gallery-card">
        {/* ── Hero Section ── */}
        <div className={`gallery-hero ${heroFading ? 'hero--fading' : ''}`} aria-label="Featured property">
          {heroImage ? (
            <img
              key={featured?.id}
              className="gallery-hero__image"
              src={heroImage.src}
              srcSet={heroImage.srcSet}
              sizes="(max-width: 768px) 100vw, 600px"
              alt={featured?.main_image?.alt_text ?? featured?.title ?? 'Featured property'}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="gallery-hero__placeholder" />
          )}
          <div className="hero-gradient" />

          {/* Dot navigation overlaid on hero — always visible on screen */}
          <div className="carousel-dots" role="tablist" aria-label="Property slides">
            {visibleProperties.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Slide ${i + 1}`}
                className={`carousel-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => { setPaused(true); changeIndex(i); }}
              />
            ))}
          </div>

          <div className="gallery-hero__content">
            <span className="eyebrow">Featured stay near you</span>
            <h2>{featured?.title || 'Handpicked property'}</h2>

            <div className="hero-meta">
              {featured?.listing_type && (
                <span className={`hero-badge hero-badge--${featured.listing_type}`}>
                  For {featured.listing_type}
                </span>
              )}
              {featured?.distance !== undefined && featured?.distance !== null && (
                <span className="hero-distance">{featured.distance.toFixed(1)} km away</span>
              )}
              {featured?.price ? (
                <span className="hero-price">{formatShortPrice(featured.price, featured.currency)}</span>
              ) : null}
            </div>

            <p className="hero-copy">
              {featured?.description || 'Discover one of the best local experiences in your area.'}
            </p>
          </div>
        </div>

        {/* ── Carousel viewport (inside clipped card) ── */}
        <div className="carousel-viewport">
          <div
            className="carousel-track"
            style={{ transform: `translateX(${trackOffset}px)` }}
            role="tabpanel"
          >
            {visibleProperties.map((property, index) => {
              const cardImg = getCardImage(property);
              return (
                <button
                  key={property.id}
                  type="button"
                  className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
                  data-index={index}
                  onClick={() => handleCardClick(index, property)}
                  aria-label={`View ${property.title}`}
                >
                  <div className="thumbnail-visual">
                    {cardImg ? (
                      <img
                        className="thumbnail-visual__img"
                        src={cardImg.src}
                        srcSet={cardImg.srcSet}
                        sizes="200px"
                        alt={property.main_image?.alt_text ?? property.title}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="thumbnail-visual__letter">{property.title.slice(0, 1)}</span>
                    )}
                    {property.price ? (
                      <span className="thumbnail-price">
                        {formatShortPrice(property.price, property.currency)}
                      </span>
                    ) : null}
                  </div>
                  <div className="thumbnail-copy">
                    <strong>{property.title}</strong>
                    <span>
                      {property.category && <span className="thumb-category">{property.category}</span>}
                      {property.distance !== undefined && property.distance !== null
                        ? `${property.distance.toFixed(1)} km`
                        : 'Nearby'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyGallery;
