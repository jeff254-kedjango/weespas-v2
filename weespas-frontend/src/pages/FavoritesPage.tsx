import React, { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { fetchPropertyDetails } from '../api/properties';
import PropertyList from '../components/listings/PropertyList';
import PropertyDetails from '../components/property/PropertyDetails';
import Icon from '../components/ui/Icon';
import { Property } from '../types/propertyApi';
import './FavoritesPage.css';

const FavoritesPage: React.FC = () => {
  const { favorites, favoriteCount } = useFavorites();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const propertyQueries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ['property', id],
      queryFn: () => fetchPropertyDetails(id),
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 15,
      retry: 1,
    })),
  });

  const isLoading = propertyQueries.some((q) => q.isLoading);
  const properties = propertyQueries
    .filter((q) => q.isSuccess && q.data)
    .map((q) => q.data as Property);

  if (favoriteCount === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <p className="eyebrow">Your Collection</p>
          <h1>Saved Properties</h1>
        </div>
        <div className="favorites-empty">
          <span className="favorites-empty__icon">
            <Icon name="heart" size={48} />
          </span>
          <p className="empty-state__title">No saved properties yet</p>
          <p className="empty-state__copy">
            Browse listings and tap the heart icon to save properties you love.
          </p>
          <Link to="/" className="favorites-empty__cta">
            Explore Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div>
          <p className="eyebrow">Your Collection</p>
          <h1>Saved Properties</h1>
        </div>
        <span className="preview-meta">{favoriteCount} saved</span>
      </div>
      <PropertyList
        properties={properties}
        onSelect={(property) => setSelectedProperty(property)}
        loading={isLoading}
        error={null}
      />
      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
