'use client';

import { useMapEvents } from 'react-leaflet';

interface MapEventsHandlerProps {
  onMapClick: (coords: [number, number]) => void;
}

export default function MapEventsHandler({ onMapClick }: MapEventsHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null; // This component does not render anything itself
}