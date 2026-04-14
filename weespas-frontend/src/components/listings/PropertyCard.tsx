// src/components/listings/PropertyCard.tsx
import React from 'react';
import { Property } from '../../types/propertyApi';
import VerifiedBadge from '../ui/VerifiedBadge';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

function formatShortPrice(price?: number, currency?: string): string {
  if (!price) return '';
  const prefix = currency === 'KES' || !currency ? 'KES ' : `${currency} `;
  if (price >= 1_000_000) return `${prefix}${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  if (price >= 1_000) return `${prefix}${(price / 1_000).toFixed(0)}K`;
  return `${prefix}${price}`;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  return (
    <button type="button" className="property-card" onClick={() => onSelect(property)}>
      <div className="property-card__image">
        {property.main_image?.thumbnail_url ? (
          <img
            src={property.main_image.thumbnail_url}
            alt={property.main_image.alt_text ?? property.title}
            loading="lazy"
            width={160}
            height={120}
          />
        ) : (
          <span>{property.title?.slice(0, 1)}</span>
        )}
      </div>
      <div className="property-card__body">
        <div className="property-card__row">
          <h3>{property.title}</h3>
          <span className="tag">{property.distance !== undefined && property.distance !== null ? `${property.distance.toFixed(1)} km` : 'Nearby'}</span>
        </div>
        <p>{property.description}</p>
        {property.bedrooms != null && property.bedrooms > 0 && (
          <div className="property-card__specs">
            <span className="spec-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7" />
                <path d="M21 11H3V7a2 2 0 012-2h14a2 2 0 012 2v4z" />
                <path d="M7 11V7" />
              </svg>
              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          </div>
        )}
      </div>
      <div className="property-card__footer">
        {property.is_engineer_certified && (
          <VerifiedBadge size={18} />
        )}
        {property.price && <strong>{formatShortPrice(property.price, property.currency)}</strong>}
      </div>
    </button>
  );
};

export default PropertyCard;