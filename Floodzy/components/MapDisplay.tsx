'use client';

import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import dynamic from 'next/dynamic';

const MapContainer = dynamic<any>(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic<any>(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic<any>(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Fix for default marker icon issue with Webpack/Vite
import L from 'leaflet';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude, zoom = 13 }) => {
  const position: [number, number] = [latitude, longitude];

  useEffect(() => {
    // Fix for default marker icon issue with Webpack/Vite
    delete ((L as any).Icon.Default.prototype as any)._getIconUrl;
    (L as any).Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full rounded-2xl z-0" // Ensure map takes full height and width
    >
      <ChangeView center={position} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}></Marker>
    </MapContainer>
  );
};

export default MapDisplay;
