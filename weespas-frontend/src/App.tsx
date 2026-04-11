// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import SearchPanel from './components/layout/SearchPanel';
import PropertyGallery from './components/layout/PropertyGallery';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import PropertyList from './components/listings/PropertyList';
import PropertyDetails from './components/property/PropertyDetails';
import { usePropertySearch } from './hooks/usePropertySearch';
import { useNearbySearch } from './hooks/useNearbySearch';
import { usePropertyDetails } from './hooks/usePropertyDetails';
import { useFavorites } from './hooks/useFavorites';
import { Property, PropertyFilterParams } from './types/propertyApi';
import './App.css';

const defaultFilters: PropertyFilterParams = {
  latitude: -0.7172,
  longitude: 36.431,
  radius: 10,
  listing_type: 'sale',
  category: 'all',
  min_price: 0,
  max_price: 1000000,
  bedrooms: 0,
  bathrooms: 0,
  sort_by: 'created_at',
  sort_order: 'desc'
};

const App: React.FC = () => {
  const { favoriteCount } = useFavorites();
  const [filters, setFilters] = useState<PropertyFilterParams>(defaultFilters);
  const [searchApplied, setSearchApplied] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const {
    properties: allProperties,
    isLoading: allLoading,
    isError: allError,
    error: allErrorMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePropertySearch(searchApplied ? filters : { skip: 0, limit: 12 });

  const {
    properties: nearbyProperties,
    isLoading: nearbyLoading,
    isError: nearbyError,
    error: nearbyErrorMessage,
    setQuery: setNearbyQuery
  } = useNearbySearch(filters);

  const selectedPropertyQuery = usePropertyDetails(selectedPropertyId);
  const displayProperties: Property[] = searchApplied ? nearbyProperties : allProperties;
  const listLoading = searchApplied ? nearbyLoading : allLoading;
  const listError = searchApplied ? nearbyErrorMessage : allErrorMessage;

  const activeProperty = selectedPropertyQuery.data ?? displayProperties.find((property) => property.id === selectedPropertyId) ?? displayProperties[0] ?? null;

  const handleSearch = () => {
    setSearchApplied(true);
    setNearbyQuery({ ...filters, skip: 0, limit: 20 });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));
        const updatedFilters = { ...filters, latitude: lat, longitude: lng };
        setFilters(updatedFilters);
        setSearchApplied(true);
        setNearbyQuery({ ...updatedFilters, skip: 0, limit: 20 });
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const handleFilterChange = (newFilters: Partial<PropertyFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const loadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero onScrollToSearch={() => document.getElementById('search-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} propertyCount={displayProperties.length} />
                <section className="landing-grid">
                  <PropertyGallery
                    properties={displayProperties}
                    selectedPropertyId={activeProperty?.id ?? null}
                    onSelect={(property) => setSelectedPropertyId(property.id)}
                    loading={listLoading}
                  />
                  <SearchPanel
                    filters={filters}
                    onChange={handleFilterChange}
                    onSearch={handleSearch}
                    onUseLocation={handleUseLocation}
                  />
                </section>
                <div className="preview-section">
                  <div className="preview-header">
                    <div>
                      <p className="eyebrow">Marketplace Preview</p>
                      <h2>Latest properties near you</h2>
                    </div>
                    <span className="preview-meta">{displayProperties.length} listings available</span>
                  </div>
                  <PropertyList
                    properties={displayProperties}
                    onSelect={(property: Property) => setSelectedPropertyId(property.id)}
                    loading={listLoading}
                    error={listError ? String(listError) : null}
                  />
                  {hasNextPage && (
                    <div className="load-more-wrap">
                      <button type="button" className="secondary-button" onClick={loadMore} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Loading more...' : 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            }
          />
        </Routes>
        {activeProperty && <PropertyDetails property={activeProperty} onClose={() => setSelectedPropertyId(null)} />}
        <Footer />
        <MobileBottomNav favoriteCount={favoriteCount} />
      </div>
    </Router>
  );
};

export default App;