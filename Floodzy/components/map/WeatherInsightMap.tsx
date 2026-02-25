'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Play, Pause, Loader2, Info, ZoomIn, MapPin, Cloud, CloudRain, Sun, CloudSun, Wind, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from 'next-themes';
import { WeatherLegend } from '@/components/map/WeatherLegend';
import { RadarLayer } from '@/components/map/RadarLayer';
import { TimelineScrubber } from '@/components/map/TimelineScrubber';
import { MockAQILayer, AQIDetailCard, MockAQIPoint } from '@/components/map/MockAQILayer';
// ... other imports

// ...


import { cn } from '@/lib/utils';

// Dynamic imports for Leaflet components
const MapContainer = dynamic<any>(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false },
);
const Popup = dynamic<any>(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false },
);
const TileLayer = dynamic<any>(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false },
);
const Marker = dynamic<any>(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false },
);

// ... (existing imports)
import { AQIPopup } from '@/components/map/AQIPopup';

// --- CONFIGURATION ---
const INDONESIA_BOUNDS: any[] = [
    [-11.0, 94.0], // South West (Rote/Sabang overlap)
    [6.5, 142.0],  // North East (Miangas/Papua)
];
const MIN_AQI_ZOOM = 7;

// --- HELPER COMPONENTS ---

// 1. Weather Marker Icon
const createCustomIcon = () => {
    return (L as any).divIcon({
        className: 'custom-pin',
        html: `<div class="relative flex h-4 w-4">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-lg"></span>
                </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });
};

function LocationMarker({ position }: { position: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 10, { duration: 1.5 });
        }
    }, [position, map]);

    return <Marker position={position} icon={createCustomIcon()} />;
}

function AQILayer({ visible }: { visible: boolean }) {
    if (!visible) return null;
    return (
        <TileLayer
            url="https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png"
            attribution='&copy; WAQI'
            opacity={0.7}
            zIndex={10}
            bounds={INDONESIA_BOUNDS as any}
        />
    );
}

// 2. Map Auto Zoom Helper
function MapAutoZoom({ activeMode }: { activeMode: string }) {
    const map = useMap();
    useEffect(() => {
        if (activeMode === 'radar') {
            // Zoom closer (level 5) centered on Indonesia
            map.flyTo([-2.5, 118], 5, {
                duration: 1.5
            });
        }
    }, [activeMode, map]);
    return null;
}

interface MapEventHandlerProps {
    onInteractionStart: () => void;
    onInteractionEnd: () => void;
    onZoomChange?: (zoom: number) => void;
    onMapClick?: (lat: number, lon: number) => void;
}

function MapEventHandler({ onInteractionStart, onInteractionEnd, onZoomChange, onMapClick }: MapEventHandlerProps) {
    const map = useMapEvents({
        movestart: () => onInteractionStart(),
        zoomstart: () => onInteractionStart(),
        moveend: () => onInteractionEnd(),
        zoomend: () => onInteractionEnd(),
        click: (e) => {
            if (onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    useEffect(() => {
        if (onZoomChange) {
            onZoomChange(map.getZoom());
        }
    }, [map, onZoomChange]);
    return null;
}

// --- MAIN COMPONENT ---

interface WeatherInsightMapProps {
    center: [number, number];
    zoom: number;
    activeMode: 'radar' | 'aqi';
    className?: string;
    selectedLocationName?: string;
    weatherData?: any;
    onMapClick?: (lat: number, lon: number) => void;
    activeFloodCount?: number;
}

export default function WeatherInsightMap({
    center,
    zoom,
    activeMode,
    className,
    selectedLocationName,
    weatherData,
    onMapClick,
    activeFloodCount = 0,
}: WeatherInsightMapProps) {
    const { theme, systemTheme } = useTheme();
    // Lifted state
    const [isPlaying, setIsPlaying] = useState(false);
    const [frames, setFrames] = useState<any[]>([]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [host, setHost] = useState<string>('https://tile.rainviewer.com');
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(zoom);
    const [mounted, setMounted] = useState(false);

    // UI State
    const [isRadarOpen, setIsRadarOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // AQI State
    const [selectedAqiPoint, setSelectedAqiPoint] = useState<MockAQIPoint | null>(null);
    const [aqiLoading, setAqiLoading] = useState(false);
    const [aqiPosition, setAqiPosition] = useState<[number, number] | null>(null);
    const [aqiData, setAqiData] = useState<any>(null);

    // Click Handler for AQI
    const handleMapClick = useCallback((lat: number, lon: number) => {
        // If a point is selected, clicking the map (background) should close it
        if (selectedAqiPoint) {
            setSelectedAqiPoint(null);
            return;
        }

        if (activeMode === 'aqi') {
            setAqiPosition([lat, lon]);
            setAqiLoading(true);
            setAqiData(null); // Clear previous data

            fetch(`/api/aqi?lat=${lat}&lon=${lon}`)
                .then(res => res.json())
                .then(data => {
                    setAqiData(data);
                })
                .catch(err => {
                    console.error("AQI fetch error:", err);
                    setAqiData({ status: 'error' }); // Fallback state
                })
                .finally(() => setAqiLoading(false));
        } else if (onMapClick) {
            // Pass through to parent if not in AQI mode
            onMapClick(lat, lon);
        }
    }, [activeMode, onMapClick, selectedAqiPoint]);

    const mapContainerRef = useRef<HTMLDivElement>(null);

    // ... (rest of imports/setup)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            mapContainerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen change events to update state (e.g. when user presses ESC)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const showAqiData = activeMode === 'aqi' && currentZoom >= MIN_AQI_ZOOM;

    const radarVisible = activeMode === 'radar';

    // 1. Fetch Radar Data (Lifted logic)
    useEffect(() => {
        // Fetch only if module is radar and we haven't loaded yet,
        // OR if user clicks play/scrub and we don't have data (though we trigger auto-fetch on mount if radar mode)
        // Let's lazy load on first radar activation
        if (activeMode === 'radar' && !hasLoaded && !isLoadingData) {
            setIsLoadingData(true);
            fetch(`https://api.rainviewer.com/public/weather-maps.json?_=${Date.now()}`, {
                cache: 'no-store'
            })
                .then(res => res.json())
                .then((data) => {
                    if (data.radar && data.radar.past) {
                        let newHost = data.host || 'https://tile.rainviewer.com';
                        if (newHost.startsWith('http:')) {
                            newHost = newHost.replace('http:', 'https:');
                        }
                        setHost(newHost);

                        // Process frames with isPast flag
                        const pastFrames = data.radar.past.map((f: any) => ({ ...f, isPast: true }));
                        const nowcastFrames = (data.radar.nowcast || []).map((f: any) => ({ ...f, isPast: false }));
                        const allFrames = [...pastFrames, ...nowcastFrames];

                        setFrames(allFrames);
                        // Start at the last "past" frame (most recent real data)
                        const initialIndex = pastFrames.length > 0 ? pastFrames.length - 1 : 0;
                        setCurrentFrameIndex(initialIndex);
                        setHasLoaded(true);
                    }
                })
                .catch(err => console.error("Radar fetch error:", err))
                .finally(() => setIsLoadingData(false));
        }
    }, [activeMode, hasLoaded, isLoadingData]);

    // Derived state for Forecast Mode
    const currentFrame = frames[currentFrameIndex];
    const isForecastFrame = currentFrame && !currentFrame.isPast;

    // 2. Animation Loop (Refactored)
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isPlaying && frames.length > 0) {
            intervalId = setInterval(() => {
                setCurrentFrameIndex(prev => (prev + 1) % frames.length);
            }, 1000); // 1.5s per frame
        }

        return () => clearInterval(intervalId);
    }, [isPlaying, frames]);

    if (!mounted) return null;

    return (
        <div
            ref={mapContainerRef}
            className={`relative w-full h-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 ${className}`}
        >
            <MapContainer
                center={center}
                zoom={zoom}
                minZoom={4}
                maxBounds={INDONESIA_BOUNDS as any}
                maxBoundsViscosity={1.0}
                className="w-full h-full z-0"
                zoomControl={true}
            >
                <TileLayer
                    key={isDark ? 'dark' : 'light'}
                    url={tileUrl}
                    attribution={isDark ? '&copy; CARTO' : '&copy; OpenStreetMap'}
                />

                {/* Radar Layer */}
                {activeMode === 'radar' && frames.length > 0 && (
                    <RadarLayer
                        frames={frames}
                        currentIndex={currentFrameIndex}
                        host={host}
                        opacity={isForecastFrame ? 0.6 : 0.75} // Slightly lower opacity for forecast to indicate uncertainty
                        visible={true}
                    />
                )}

                <MapAutoZoom activeMode={activeMode} />

                {activeMode === 'aqi' && (
                    <MockAQILayer
                        visible={true}
                        onPointSelect={(point) => setSelectedAqiPoint(point)}
                    />
                )}

                {/* AQI Hero Popup */}
                {activeMode === 'aqi' && selectedAqiPoint && (
                    <Popup
                        position={[selectedAqiPoint.lat, selectedAqiPoint.lon]}
                        onClose={() => setSelectedAqiPoint(null)}
                        className="aqi-popup-hero !m-0 !p-0 overflow-visible"
                        closeButton={false}
                        autoPan={true}
                        autoPanPadding={[20, 20]}
                        offset={[0, -20]}
                    >
                        <div onClick={(e) => e.stopPropagation()}>
                            {/* Stop propagation to prevent map click closing it immediately if event bubbling occurs */}
                            <AQIDetailCard point={selectedAqiPoint} />
                        </div>
                    </Popup>
                )}

                <MapEventHandler
                    onZoomChange={setCurrentZoom}
                    onInteractionStart={() => setIsUserInteracting(true)}
                    onInteractionEnd={() => setIsUserInteracting(false)}
                    onMapClick={handleMapClick}
                />

                {selectedLocationName && <LocationMarker position={center} />}
            </MapContainer>

            {/* --- TOP RIGHT: FLOOD STATUS SYSTEM INDICATOR & LEGEND & CONTROLS --- */}
            <div className="absolute top-3 right-3 z-[500] pointer-events-none flex flex-col items-end gap-2">

                {/* Top Row: Status Badge & Fullscreen */}
                <div className="flex items-center gap-2 pointer-events-auto">

                    {/* Status Badge - Always visible to show global/regional status */}
                    <div
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg transition-colors",
                            activeFloodCount > 0
                                ? "bg-red-900/80 border-red-500/30 text-red-100"
                                : "bg-emerald-900/80 border-emerald-500/30 text-emerald-100"
                        )}
                    >
                        {activeFloodCount > 0 ? (
                            <>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                <span className="text-[11px] font-bold tracking-wider uppercase">
                                    Waspada ({activeFloodCount})
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[11px] font-bold tracking-wider uppercase">
                                    Zona Aman
                                </span>
                            </>
                        )}
                    </div>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-200 hover:bg-slate-800 shadow-lg transition-all"
                        title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen Map"}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>

                {/* 2. New Clean Legend (Pointer events auto) - Only show if Radar control is OPEN */}
                {activeMode === 'radar' && (
                    <div className="pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300">
                        <WeatherLegend mode={activeMode} />
                    </div>
                )}
                {activeMode === 'aqi' && (
                    <div className="pointer-events-auto flex flex-col items-end gap-2">
                        <WeatherLegend mode={activeMode} />
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 backdrop-blur-md border border-yellow-500/20 rounded-full text-[10px] font-medium text-yellow-200 shadow-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
                            Data Estimasi
                        </div>
                    </div>
                )}
            </div>

            {/* --- BOTTOM CONTROLS (Unified) --- */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] flex justify-center pointer-events-none">
                <div className="pointer-events-auto shadow-2xl">
                    <TimelineScrubber
                        frames={frames}
                        currentIndex={currentFrameIndex}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying(!isPlaying)}
                        onScrub={(index) => {
                            setIsPlaying(false); // Pause on user interaction
                            setCurrentFrameIndex(index);
                        }}
                        isLoading={isLoadingData}
                        isExpanded={isRadarOpen}
                        onExpandedChange={setIsRadarOpen}
                    />
                </div>
            </div>

            {activeMode === 'aqi' && !showAqiData && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
                    <div className="bg-slate-900/80 backdrop-blur px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl">
                        <div className="p-1.5 bg-yellow-500/20 rounded-full">
                            <ZoomIn size={18} className="text-yellow-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-100">Perbesar peta untuk detail AQI</span>
                    </div>
                </div>
            )}

        </div>
    );
}
