'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapEvents } from 'react-leaflet';
import dynamic from 'next/dynamic';

const MapContainer = dynamic<any>(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic<any>(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic<any>(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, LocateFixed } from 'lucide-react';

// Fix for default marker icon issue with Leaflet


interface MapPickerProps {
  currentPosition: [number, number];
  onPositionChange: (position: { lat: number; lng: number }) => void;
  onLocationNameChange: (name: string) => void;
}

interface MapEventsHandlerProps {
  position: [number, number];
  setPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  onLocationNameChange: (name: string) => void;
  setMapInstance: (map: any) => void;
}

const MapEvents: React.FC<MapEventsHandlerProps> = ({
  position,
  setPosition,
  onPositionChange,
  onLocationNameChange,
  setMapInstance,
}) => {
  const map = useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      onLocationNameChange(
        `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`,
      );
    },
    locationfound: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, map.getZoom());
      onLocationNameChange(`Lokasi Saat Ini (GPS)`);
    },
    locationerror: (e) => {
      console.error('Location access denied or error:', e.message);
      alert(
        'Gagal mendapatkan lokasi saat ini. Pastikan izin lokasi diberikan dan coba lagi.',
      );
    },
  });

  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);

  const markerRef = useRef<any>(null);

  const eventHandlers = useCallback(
    (e: any) => {
      const newPos = e.target.getLatLng();
      setPosition([newPos.lat, newPos.lng]);
      onPositionChange({ lat: newPos.lat, lng: newPos.lng });
      onLocationNameChange(
        `Lat: ${newPos.lat.toFixed(4)}, Lng: ${newPos.lng.toFixed(4)}`,
      );
    },
    [onPositionChange, onLocationNameChange, setPosition],
  );

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.on('dragend', eventHandlers);
    }
    return () => {
      if (marker) {
        marker.off('dragend', eventHandlers);
      }
    };
  }, [eventHandlers]);

  return <Marker position={position} draggable={true} ref={markerRef} />;
};

const MapPicker: React.FC<MapPickerProps> = ({
  currentPosition,
  onPositionChange,
  onLocationNameChange,
}) => {
  const [position, setPosition] = useState<[number, number]>(currentPosition);
  const [mapInstance, setMapInstance] = useState<any | null>(null); // New state for map instance

  useEffect(() => {
    // Fix for default marker icon issue with Leaflet
    delete ((L as any).Icon.Default.prototype as any)._getIconUrl;
    (L as any).Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // Update internal position state and map view when currentPosition prop changes
  useEffect(() => {
    if (
      mapInstance &&
      (position[0] !== currentPosition[0] || position[1] !== currentPosition[1])
    ) {
      setPosition(currentPosition);
      mapInstance.flyTo(currentPosition, mapInstance.getZoom());
    }
  }, [currentPosition, mapInstance, position]);

  const locateUser = () => {
    if (!mapInstance) {
      alert('Peta belum siap. Coba lagi sebentar.');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          onPositionChange({ lat: latitude, lng: longitude });
          onLocationNameChange('Lokasi Saat Ini (GPS)');
          mapInstance.flyTo([latitude, longitude], 15); // Use mapInstance here
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert(
            'Gagal mendapatkan lokasi saat ini. Pastikan izin lokasi diberikan dan coba lagi.',
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    } else {
      alert('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  return (
    <div className="relative w-full h-72 sm:h-96 rounded-lg overflow-hidden border border-slate-600">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents
          position={position}
          setPosition={setPosition}
          onPositionChange={onPositionChange}
          onLocationNameChange={onLocationNameChange}
          setMapInstance={setMapInstance}
        />
      </MapContainer>
      <button
        type="button"
        onClick={locateUser}
        className="absolute bottom-4 right-4 z-[1000] p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center"
        title="Gunakan Lokasi Saat Ini"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MapPicker;
