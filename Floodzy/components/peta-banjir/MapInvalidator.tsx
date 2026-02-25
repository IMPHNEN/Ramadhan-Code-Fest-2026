import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapInvalidatorProps {
  isBrowserFullScreen: boolean;
}

const MapInvalidator: React.FC<MapInvalidatorProps> = ({ isBrowserFullScreen }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [isBrowserFullScreen, map]);

  return null;
};

export default MapInvalidator;
