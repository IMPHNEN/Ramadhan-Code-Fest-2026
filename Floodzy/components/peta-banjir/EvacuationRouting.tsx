import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface EvacuationRoutingProps {
  start: [number, number];
  end: [number, number];
}

const EvacuationRouting: React.FC<EvacuationRoutingProps> = ({ start, end }) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Import CSS and JS dynamically
    // @ts-ignore
    import('leaflet-routing-machine/dist/leaflet-routing-machine.css');
    // @ts-ignore
    import('leaflet-routing-machine').then(() => {
        // Once loaded, create and add the control
        if (map) { // Check if map is still available
            // Hapus rute lama jika ada
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }

            const routingControl = L.Routing.control({
                waypoints: [(L as any).latLng(start[0], start[1]), (L as any).latLng(end[0], end[1])],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                show: false,
                lineOptions: {
                    styles: [
                        { color: '#007BFF', opacity: 0.8, weight: 6 },
                    ],
                },
            }).addTo(map);

            routingControlRef.current = routingControl;
        }
    });

    // Cleanup function
    return () => {
      const currentRoutingControl = routingControlRef.current;
      if (currentRoutingControl) {
        setTimeout(() => {
          if (map && map.removeControl) { // Check if map is still valid
            currentRoutingControl.setWaypoints([]); // Clear waypoints again just in case
            map.removeControl(currentRoutingControl);
          }
          routingControlRef.current = null;
        }, 0);
      }
    };
  }, [map, start, end]);

  return null;
};

export default EvacuationRouting;