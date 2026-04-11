// src/components/listings/PropertyCard.tsx
import React from 'react';
import { Property } from '../../types/propertyApi';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
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
      </div>
      <div className="property-card__footer">
        <span>{property.created_at?.slice(0, 10)}</span>
        {property.price && <strong>{property.price}</strong>}
      </div>
    </button>
  );
};

export default PropertyCard;