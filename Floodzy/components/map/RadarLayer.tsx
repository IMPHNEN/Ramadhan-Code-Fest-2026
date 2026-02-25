import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

interface RadarFrame {
    path: string;
    time: number;
}

interface RadarLayerProps {
    frames: RadarFrame[];
    currentIndex: number;
    host: string;
    opacity?: number;
    visible?: boolean;
}

export function RadarLayer({ frames, currentIndex, host, opacity = 0.75, visible = true }: RadarLayerProps) {
    const map = useMap();
    const layersRef = useRef<{ [key: number]: any }>({}); // Map frame index to Leaflet Layer

    useEffect(() => {
        // 1. Determine which indices should be active (Current, Prev, Next)
        const activeIndices = new Set([
            currentIndex,
            (currentIndex + 1) % frames.length,
            (currentIndex - 1 + frames.length) % frames.length,
            (currentIndex + 2) % frames.length
        ]);

        // 2. Manage Layers
        frames.forEach((frame, index) => {
            const isActive = activeIndices.has(index);

            if (isActive) {
                // Create layer if it doesn't exist
                if (!layersRef.current[index]) {
                    const layer = (L as any).tileLayer(
                        `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
                        {
                            opacity: 0,
                            zIndex: 10,
                            attribution: 'RainViewer'
                        }
                    );
                    layer.addTo(map);
                    layersRef.current[index] = layer;
                }

                // Update opacity based on whether it is the CURRENT frame and VISIBLE
                const layer = layersRef.current[index];
                const targetOpacity = visible
                    ? (index === currentIndex ? opacity : 0) // Normal behavior if visible
                    : 0; // Force 0 if not visible

                if (layer.options.opacity !== targetOpacity) {
                    layer.setOpacity(targetOpacity);
                }
            } else {
                // Remove layer if it exists but is no longer active (Cleanup to save memory)
                if (layersRef.current[index]) {
                    map.removeLayer(layersRef.current[index]);
                    delete layersRef.current[index];
                }
            }
        });

    }, [currentIndex, frames, host, map, opacity, visible]);

    // 3. Cleanup on Unmount (Critical!)
    useEffect(() => {
        return () => {
            Object.values(layersRef.current).forEach(layer => {
                map.removeLayer(layer);
            });
            layersRef.current = {};
        };
    }, [map]);

    return null;
}
