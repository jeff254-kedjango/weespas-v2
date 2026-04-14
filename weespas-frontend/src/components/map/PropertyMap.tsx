// src/components/map/PropertyMap.tsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../../types/propertyApi';
import { formatPrice } from '../../utils/format';
import './PropertyMap.css';

// Fix Leaflet's default icon paths (broken by bundlers)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface PropertyMapProps {
  properties: Property[];
  onSelect: (property: Property) => void;
  loading: boolean;
  center?: [number, number];
}

const DEFAULT_CENTER: [number, number] = [-1.2921, 36.8219]; // Nairobi
const DEFAULT_ZOOM = 12;

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onSelect, loading, center }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center ?? DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setView(center, mapRef.current.getZoom());
  }, [center]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    const validProperties = properties.filter(
      (p) => p.latitude != null && p.longitude != null
    );

    if (validProperties.length === 0) return;

    const bounds = L.latLngBounds([]);

    validProperties.forEach((property) => {
      const lat = property.latitude!;
      const lng = property.longitude!;
      const latlng = L.latLng(lat, lng);
      bounds.extend(latlng);

      const priceText = property.price
        ? formatPrice(property.price, property.listing_type)
        : 'Price on request';

      const imageHtml = property.main_image?.thumbnail_url
        ? `<img src="${property.main_image.thumbnail_url}" alt="${property.title}" class="map-popup__image" />`
        : `<div class="map-popup__image map-popup__image--placeholder">${property.title?.slice(0, 1) ?? 'W'}</div>`;

      const distanceText = property.distance != null
        ? `<span class="map-popup__distance">${property.distance.toFixed(1)} km away</span>`
        : '';

      const popupContent = `
        <div class="map-popup" data-property-id="${property.id}">
          ${imageHtml}
          <div class="map-popup__body">
            <h4 class="map-popup__title">${property.title}</h4>
            <p class="map-popup__price">${priceText}</p>
            ${distanceText}
            <button type="button" class="map-popup__cta">View Details</button>
          </div>
        </div>
      `;

      const marker = L.marker(latlng)
        .bindPopup(popupContent, {
          maxWidth: 260,
          minWidth: 200,
          className: 'map-popup-container',
          closeButton: true,
        });

      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        if (!popup) return;
        const el = popup.getElement();
        const btn = el?.querySelector('.map-popup__cta');
        btn?.addEventListener('click', () => onSelect(property));
      });

      markersRef.current!.addLayer(marker);
    });

    // Fit map to show all markers
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [properties, onSelect]);

  if (loading) {
    return (
      <div className="property-map property-map--loading">
        <div className="property-map__skeleton">
          <div className="property-map__skeleton-pulse" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="property-map">
      <div ref={mapContainerRef} className="property-map__container" />
      {properties.length === 0 && (
        <div className="property-map__empty">
          <p>No properties to display on the map</p>
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
