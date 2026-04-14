/* ==========================================================================
   PROPERTY DETAILS — Full property view
   Mobile: slide-up bottom sheet.  Desktop: right side panel.
   Includes image carousel with Stories dots, specs grid, agent card, etc.
   ========================================================================== */

import React, { useState, useCallback, useEffect } from 'react';
import { Property, PropertyImage } from '../../types/propertyApi';
import { useFavorites } from '../../hooks/useFavorites';
import { formatPrice, formatDistance, getVibeTags } from '../../utils/format';
import Icon from '../ui/Icon';
import FavoriteButton from '../ui/FavoriteButton';
import ListingTypeBadge from '../ui/ListingTypeBadge';
import VerifiedBadge from '../ui/VerifiedBadge';
import VibeTag from '../ui/VibeTag';
import Badge from '../ui/Badge';
import ImageGallery from '../ui/ImageGallery';
import './PropertyDetails.css';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Gather all images — main image first, then extras
  const allImages: PropertyImage[] = [];
  if (property.main_image) allImages.push(property.main_image);
  if (property.images) {
    for (const img of property.images) {
      if (img.id !== property.main_image?.id) allImages.push(img);
    }
  }
  const imageCount = allImages.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentSlide > 0) setCurrentSlide((s) => s - 1);
      if (e.key === 'ArrowRight' && currentSlide < imageCount - 1) setCurrentSlide((s) => s + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, currentSlide, imageCount]);

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const prevSlide = useCallback(() => setCurrentSlide((s) => Math.max(0, s - 1)), []);
  const nextSlide = useCallback(() => setCurrentSlide((s) => Math.min(imageCount - 1, s + 1)), [imageCount]);

  const handleShare = async () => {
    const url = window.location.origin + '/property/' + property.id;
    if (navigator.share) {
      try { await navigator.share({ title: property.title, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  // Build specs list
  const specs: { icon: React.ComponentProps<typeof Icon>['name']; value: string; label: string }[] = [];
  if (property.bedrooms != null) specs.push({ icon: 'bed', value: String(property.bedrooms), label: 'Beds' });
  if (property.bathrooms != null) specs.push({ icon: 'bath', value: String(property.bathrooms), label: 'Baths' });
  if (property.size) specs.push({ icon: 'ruler', value: property.size, label: 'Size' });
  if (property.parking_spaces != null) specs.push({ icon: 'parking', value: String(property.parking_spaces), label: 'Parking' });
  if (property.year_built) specs.push({ icon: 'calendar', value: String(property.year_built), label: 'Built' });

  const vibeTags = getVibeTags(property);

  // Agent helpers
  const agent = property.agent;
  const agentInitial = (agent?.agent_name ?? 'A')[0].toUpperCase();
  const agentPhone = agent?.agent_phone_number;
  const whatsappUrl = agentPhone ? `https://wa.me/${agentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in: ${property.title}`)}` : null;

  // Location text
  const locationParts: string[] = [];
  if (property.address?.street_address) locationParts.push(property.address.street_address);
  if (property.address?.location_name ?? property.location_name) locationParts.push((property.address?.location_name ?? property.location_name)!);
  if (property.address?.city) locationParts.push(property.address.city);
  if (property.address?.county) locationParts.push(property.address.county);
  const locationText = locationParts.join(', ') || 'Kenya';

  return (
    <>
      {/* Backdrop */}
      <div className="pd-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="pd-panel" role="dialog" aria-label={property.title}>
        {/* Mobile drag handle */}
        <div className="pd-handle"><span /></div>

        {/* Close button */}
        <button className="pd-close" onClick={onClose} aria-label="Close">
          <Icon name="x" size={18} />
        </button>

        {/* ── Image Carousel ── */}
        {imageCount > 0 ? (
          <div className="pd-carousel">
            {/* Stories progress dots */}
            {imageCount > 1 && (
              <div className="pd-carousel__dots">
                {allImages.map((_, i) => (
                  <div
                    key={i}
                    className={`pd-carousel__dot ${i === currentSlide ? 'pd-carousel__dot--active' : i < currentSlide ? 'pd-carousel__dot--done' : ''}`}
                  />
                ))}
              </div>
            )}

            {/* Track — click opens fullscreen lightbox */}
            <div className="pd-carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {allImages.map((img) => (
                <div
                  key={img.id}
                  className="pd-carousel__slide"
                  onClick={() => setLightboxOpen(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Open fullscreen gallery"
                >
                  <img src={img.url || img.thumbnail_url} alt={img.alt_text ?? property.title} loading="lazy" />
                </div>
              ))}
            </div>

            {/* Arrows */}
            {currentSlide > 0 && (
              <button className="pd-carousel__arrow pd-carousel__arrow--prev" onClick={prevSlide} aria-label="Previous image">
                <Icon name="chevronLeft" size={18} />
              </button>
            )}
            {currentSlide < imageCount - 1 && (
              <button className="pd-carousel__arrow pd-carousel__arrow--next" onClick={nextSlide} aria-label="Next image">
                <Icon name="chevronRight" size={18} />
              </button>
            )}

            {/* Glassmorphic price overlay */}
            {property.price != null && (
              <div className="pd-price-overlay">
                <span className="pd-price-overlay__amount">{formatPrice(property.price, property.currency)}</span>
                {property.listing_type === 'rent' && <span className="pd-price-overlay__suffix">/mo</span>}
              </div>
            )}

            {/* Image counter */}
            {imageCount > 1 && (
              <span className="pd-carousel__counter">{currentSlide + 1} / {imageCount}</span>
            )}

            {/* Expand hint */}
            <button
              className="pd-carousel__expand"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open fullscreen gallery"
            >
              <Icon name="expand" size={16} />
            </button>
          </div>
        ) : (
          /* No-image fallback */
          <div className="pd-carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <Icon name="expand" size={48} />
          </div>
        )}

        {/* ── Body content ── */}
        <div className="pd-body">
          {/* Header: badges + title + location */}
          <div className="pd-header">
            <div className="pd-header__badges">
              <ListingTypeBadge type={property.listing_type} />
              {property.is_engineer_certified && <VerifiedBadge size={18} />}
              {property.distance != null && (
                <Badge variant="accent">{formatDistance(property.distance)}</Badge>
              )}
              {property.category && <Badge variant="muted">{property.category}</Badge>}
            </div>
            <h2 className="pd-header__title">{property.title}</h2>
            <div className="pd-header__location">
              <Icon name="mapPin" size={14} />
              <span>{locationText}</span>
            </div>
          </div>

          {/* Price (fallback if no images to show overlay) */}
          {property.price != null && imageCount === 0 && (
            <div>
              <span className="pd-price-overlay__amount" style={{ color: 'var(--color-text)' }}>
                {formatPrice(property.price, property.currency)}
              </span>
              {property.listing_type === 'rent' && <span className="pd-price-overlay__suffix" style={{ color: 'var(--color-text-secondary)' }}>/mo</span>}
            </div>
          )}

          {/* Actions: Share + Favorite */}
          <div className="pd-actions">
            <button className="pd-actions__share" onClick={handleShare}>
              <Icon name="share" size={16} />
              Share
            </button>
            <FavoriteButton
              active={isFavorite(property.id)}
              onToggle={() => toggleFavorite(property.id)}
            />
          </div>

          {/* Vibe tags */}
          {vibeTags.length > 0 && (
            <div className="pd-vibes">
              {vibeTags.map((tag) => <VibeTag key={tag} tag={tag} />)}
            </div>
          )}

          <hr className="pd-divider" />

          {/* Specs grid */}
          {specs.length > 0 && (
            <div className="pd-specs">
              {specs.map((spec) => (
                <div key={spec.label} className="pd-spec">
                  <Icon name={spec.icon} size={20} className="pd-spec__icon" />
                  <span className="pd-spec__value">{spec.value}</span>
                  <span className="pd-spec__label">{spec.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="pd-description">
              <h3>About this property</h3>
              <p>{property.description}</p>
            </div>
          )}

          <hr className="pd-divider" />

          {/* Location */}
          <div className="pd-location">
            <h3>Location</h3>
            <p className="pd-location__address">{locationText}</p>
            <div className="pd-location__map-placeholder">
              <Icon name="map" size={24} />
              <span style={{ marginLeft: '8px' }}>Map coming soon</span>
            </div>
          </div>

          <hr className="pd-divider" />

          {/* Agent card */}
          {agent && (
            <div>
              <div className="pd-agent">
                {agent.agent_profile_picture ? (
                  <img className="pd-agent__photo" src={agent.agent_profile_picture} alt={agent.agent_name ?? 'Agent'} />
                ) : (
                  <div className="pd-agent__photo pd-agent__photo--placeholder">{agentInitial}</div>
                )}
                <div className="pd-agent__info">
                  <div className="pd-agent__name">{agent.agent_name ?? 'Agent'}</div>
                  <div className="pd-agent__role">Property Agent{agent.is_verified ? ' \u00b7 Verified' : ''}</div>
                </div>
              </div>
              <div className="pd-agent__ctas">
                {agentPhone && (
                  <a className="pd-agent__cta pd-agent__cta--call" href={`tel:${agentPhone}`}>
                    <Icon name="phone" size={16} />
                    Call
                  </a>
                )}
                {whatsappUrl && (
                  <a className="pd-agent__cta pd-agent__cta--whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && imageCount > 0 && (
        <ImageGallery
          images={allImages}
          initialIndex={currentSlide}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default PropertyDetails;
