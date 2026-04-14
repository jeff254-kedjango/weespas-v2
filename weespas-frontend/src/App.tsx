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
import PropertyMap from './components/map/PropertyMap';
import SortControls from './components/ui/SortControls';
import ViewToggle, { ViewMode } from './components/ui/ViewToggle';
import PropertyDetails from './components/property/PropertyDetails';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import { usePropertySearch } from './hooks/usePropertySearch';
import { useNearbySearch } from './hooks/useNearbySearch';
import { useTextSearch } from './hooks/useTextSearch';
import { usePropertyDetails } from './hooks/usePropertyDetails';
import { useFavorites } from './hooks/useFavorites';
import { Property, PropertyFilterParams } from './types/propertyApi';
import './App.css';

const defaultFilters: PropertyFilterParams = {
  radius: 10,
  category: 'all',
  sort_by: 'created_at',
  sort_order: 'desc'
};

const App: React.FC = () => {
  const { favoriteCount } = useFavorites();
  const [filters, setFilters] = useState<PropertyFilterParams>(defaultFilters);
  const [searchApplied, setSearchApplied] = useState(false);
  const [textQuery, setTextQuery] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const {
    properties: allProperties,
    isLoading: allLoading,
    isError: allError,
    error: allErrorMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePropertySearch(searchApplied ? filters : { skip: 0, limit: 12, sort_by: filters.sort_by, sort_order: filters.sort_order });

  const {
    properties: nearbyProperties,
    isLoading: nearbyLoading,
    isError: nearbyError,
    error: nearbyErrorMessage,
    setQuery: setNearbyQuery
  } = useNearbySearch(filters);

  const {
    properties: textSearchResults,
    isLoading: textSearchLoading,
    total: textSearchTotal,
    isError: textSearchError,
    error: textSearchErrorMessage,
  } = useTextSearch(textQuery);

  const isTextSearchActive = textQuery.length >= 2;

  const selectedPropertyQuery = usePropertyDetails(selectedPropertyId);
  const hasGeo = filters.latitude !== undefined && filters.longitude !== undefined;
  const useNearby = searchApplied && hasGeo;
  const displayProperties: Property[] = isTextSearchActive
    ? textSearchResults
    : useNearby
      ? nearbyProperties
      : allProperties;
  const listLoading = isTextSearchActive ? textSearchLoading : useNearby ? nearbyLoading : allLoading;
  const listError = isTextSearchActive ? textSearchErrorMessage : useNearby ? nearbyErrorMessage : allErrorMessage;

  const activeProperty = selectedPropertyQuery.data ?? displayProperties.find((property) => property.id === selectedPropertyId) ?? displayProperties[0] ?? null;

  const handleTextSearch = (query: string) => {
    setTextQuery(query);
    if (query.trim()) {
      // Scroll to listings when searching
      setTimeout(() => {
        document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSearch = () => {
    setTextQuery(''); // clear text search when using filter search
    setSearchApplied(true);
    setNearbyQuery({ ...filters, skip: 0, limit: 20 });
    setTimeout(() => {
      document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  const handleSortChange = (sort_by: PropertyFilterParams['sort_by'], sort_order: PropertyFilterParams['sort_order']) => {
    const updated = { ...filters, sort_by, sort_order };
    setFilters(updated);
    if (searchApplied) {
      setNearbyQuery({ ...updated, skip: 0, limit: 20 });
    }
  };

  const loadMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  return (
    <Router>
      <AuthProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero
                  onSearch={handleTextSearch}
                  propertyCount={displayProperties.length}
                  searchQuery={textQuery}
                  searchLoading={textSearchLoading}
                  searchTotal={isTextSearchActive ? textSearchTotal : undefined}
                />
                <section className="landing-grid">
                  <PropertyGallery
                    selectedPropertyId={activeProperty?.id ?? null}
                    onSelect={(property) => setSelectedPropertyId(property.id)}
                  />
                  <SearchPanel
                    filters={filters}
                    onChange={handleFilterChange}
                    onSearch={handleSearch}
                    onUseLocation={handleUseLocation}
                  />
                </section>
                <div id="listings" className="preview-section">
                  <div className="preview-header">
                    <div>
                      <p className="eyebrow">{isTextSearchActive ? 'Search Results' : 'Marketplace Preview'}</p>
                      <h2>{isTextSearchActive ? `Results for "${textQuery}"` : 'Latest properties near you'}</h2>
                    </div>
                    <span className="preview-meta">{displayProperties.length} listings available</span>
                  </div>
                  <div className="preview-controls">
                    <SortControls
                      sortBy={filters.sort_by ?? 'created_at'}
                      sortOrder={filters.sort_order ?? 'desc'}
                      onChange={handleSortChange}
                      resultCount={displayProperties.length}
                    />
                    <ViewToggle mode={viewMode} onChange={setViewMode} />
                  </div>
                  {viewMode === 'list' ? (
                    <>
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
                    </>
                  ) : (
                    <PropertyMap
                      properties={displayProperties}
                      onSelect={(property: Property) => setSelectedPropertyId(property.id)}
                      loading={listLoading}
                      center={filters.latitude && filters.longitude ? [filters.latitude, filters.longitude] : undefined}
                    />
                  )}
                </div>
              </>
            }
          />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        {selectedPropertyId && activeProperty && (
          <PropertyDetails
            property={activeProperty}
            onClose={() => setSelectedPropertyId(null)}
          />
        )}
        <Footer />
        <MobileBottomNav
          favoriteCount={favoriteCount}
          viewMode={viewMode}
          onMapToggle={() => {
            setViewMode((prev) => (prev === 'map' ? 'list' : 'map'));
            setTimeout(() => {
              document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
        />
      </div>
      </AuthProvider>
    </Router>
  );
};

export default App;