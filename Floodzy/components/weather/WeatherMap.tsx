'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Settings,
  MapPin,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherData } from '@/lib/api';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface OpenWeatherMapCurrentResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number; // m/s
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  rain?: {
    '1h'?: number; // Rain volume for the last 1 hour, mm
  };
  dt: number;
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface CombinedWeatherData {
  current: OpenWeatherMapCurrentResponse;
  daily: any[]; // Assuming daily is an array of forecast data, adjust if a specific interface exists
}

interface WeatherLayers {
  clouds: boolean;
  precipitation: boolean;
  temperature: boolean;
  wind: boolean;
  pressure: boolean;
}

import { SelectedLocation } from '@/types/location';

/**
 * Props for the WeatherMap component.
 * @property apiKey This API key is intended for public client-side use (e.g., for tile map services).
 *                  It should be a `NEXT_PUBLIC_` prefixed environment variable and configured with appropriate domain restrictions
 *                  on the service provider's side (e.g., OpenWeatherMap).
 */
interface WeatherMapProps {
  center: [number, number];
  zoom: number;
  weatherLayers: WeatherLayers;
  selectedLocation: SelectedLocation | null;
  currentWeatherData: CombinedWeatherData | null; // Use CombinedWeatherData
  className?: string;
  apiKey: string; // Add apiKey prop
  onToggleLayer: (layerType: keyof WeatherLayers) => void;
}

// Custom weather marker icon
const createWeatherIcon = (iconCode: string) => {
  let emoji = '☁️';
  if (iconCode) {
    if (iconCode.startsWith('01')) emoji = iconCode === '01d' ? '☀️' : '🌙';
    else if (iconCode.startsWith('02')) emoji = '🌤️';
    else if (iconCode.startsWith('03') || iconCode.startsWith('04'))
      emoji = '☁️';
    else if (iconCode.startsWith('09') || iconCode.startsWith('10'))
      emoji = '🌧️';
    else if (iconCode.startsWith('11')) emoji = '⛈️';
    else if (iconCode.startsWith('13')) emoji = '🌨️';
    else if (iconCode.startsWith('50')) emoji = '🌫️';
  }

  const svgString = `
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="14" fill="rgba(59, 130, 246, 0.9)" stroke="white" stroke-width="2"/>
      <text x="15" y="20" text-anchor="middle" fill="white" font-size="16">${emoji}</text>
    </svg>
  `;

  const encodedSvg = btoa(unescape(encodeURIComponent(svgString)));

  return new (L as any).Icon({
    iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Component to update map view
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    const isCenterChanged =
      currentCenter.lat !== center[0] || currentCenter.lng !== center[1];
    const isZoomChanged = currentZoom !== zoom;

    if (isCenterChanged || isZoomChanged) {
      map.setView(center, zoom, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [center, zoom, map]);

  return null;
}

// Map reset component
function MapReset({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  const resetView = () => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.5,
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={resetView}
      className="absolute top-4 right-16 z-[1000] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/80"
    >
      <RotateCcw size={16} className="text-white" />
    </Button>
  );
}

// Weather layer tile component
function WeatherLayers({
  layers,
  apiKey,
}: {
  layers: WeatherLayers;
  apiKey: string;
}) {
  const map = useMap();

  useEffect(() => {
    // Remove existing weather layers
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isWeatherLayer) {
        map.removeLayer(layer);
      }
    });

    // Add active weather layers
    Object.entries(layers).forEach(([layerType, isActive]) => {
      if (isActive) {
        let layerUrl = '';
        let opacity = 0.6;

        switch (layerType) {
          case 'clouds':
            layerUrl = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`;
            opacity = 0.6;
            break;
          case 'precipitation':
            layerUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`;
            opacity = 0.7;
            break;
          case 'temperature':
            layerUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`;
            opacity = 0.6;
            break;
          case 'wind':
            layerUrl = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`;
            opacity = 0.6;
            break;
          case 'pressure':
            layerUrl = `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${apiKey}`;
            opacity = 0.6;
            break;
        }

        if (layerUrl) {
          const weatherLayer = (L as any).tileLayer(layerUrl, {
            attribution: 'Weather data © OpenWeatherMap',
            opacity: opacity,
            maxZoom: 18,
            isWeatherLayer: true, // Custom property to identify weather layers
          } as any);

          weatherLayer.addTo(map);
        }
      }
    });
  }, [layers, map, apiKey]);

  return null;
}

export function WeatherMap({
  center,
  zoom,
  weatherLayers,
  selectedLocation,
  currentWeatherData,
  className,
  apiKey,
  onToggleLayer,
}: WeatherMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<any | null>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative rounded-lg overflow-hidden shadow-lg',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className,
      )}
      style={{ height: isFullscreen ? '100vh' : '100%' }}
    >
      <MapContainer
        {...{
          center: center as any,
          zoom: zoom,
          scrollWheelZoom: true,
          className: "w-full h-full",
          ref: mapRef as any,
          zoomControl: false,
        } as any}
      >
        {/* Base tile layer */}
        <TileLayer
          {...{
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          } as any}
        />

        {/* Weather layers */}
        <WeatherLayers layers={weatherLayers} apiKey={apiKey} />

        {/* Map updater */}
        <MapUpdater center={center} zoom={zoom} />

        {/* Map reset button */}
        <MapReset center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} />

        {/* Location marker */}
        {selectedLocation?.latitude && selectedLocation?.longitude && (
          <Marker
            {...{
              position: [selectedLocation.latitude, selectedLocation.longitude],
              icon: createWeatherIcon(
                currentWeatherData?.current?.weather?.[0]?.icon || '',
              ),
            } as any}
          >
            <Popup>
              <Card className="min-w-[250px] p-4 border-0 shadow-none">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">
                      {selectedLocation?.name || 'Lokasi Tidak Diketahui'}
                    </h3>
                    <Badge variant="secondary">Live</Badge>
                  </div>

                  {currentWeatherData?.current ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {currentWeatherData.current.weather?.[0]?.icon?.startsWith(
                            '01',
                          )
                            ? '☀️'
                            : currentWeatherData.current.weather?.[0]?.icon?.startsWith(
                              '09',
                            ) ||
                              currentWeatherData.current.weather?.[0]?.icon?.startsWith(
                                '10',
                              )
                              ? '🌧️'
                              : currentWeatherData.current.weather?.[0]?.icon?.startsWith(
                                '11',
                              )
                                ? '⛈️'
                                : '☁️'}
                        </div>
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {Math.round(
                              currentWeatherData.current.main?.temp || 0,
                            )}
                            °C
                          </div>
                          <div className="text-sm text-slate-600 capitalize">
                            {currentWeatherData.current.weather?.[0]
                              ?.description || 'Tidak diketahui'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span>
                            Terasa:{' '}
                            {Math.round(
                              currentWeatherData.current.main?.feels_like || 0,
                            )}
                            °C
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Cloud className="w-4 h-4 text-gray-500" />
                          <span>
                            Kelembapan:{' '}
                            {currentWeatherData.current.main?.humidity ?? 'N/A'}
                            %
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind className="w-4 h-4 text-green-500" />
                          <span>
                            Angin:{' '}
                            {currentWeatherData.current.wind?.speed !==
                              undefined
                              ? `${Math.round(currentWeatherData.current.wind.speed * 3.6)}`
                              : 'N/A'}{' '}
                            km/h
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Gauge className="w-4 h-4 text-purple-500" />
                          <span>
                            Tekanan:{' '}
                            {currentWeatherData.current.main?.pressure ?? 'N/A'}{' '}
                            hPa
                          </span>
                        </div>
                      </div>

                      {currentWeatherData.current.rain?.['1h'] &&
                        currentWeatherData.current.rain['1h'] > 0 && (
                          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                            <CloudRain className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-700">
                              Hujan: {currentWeatherData.current.rain['1h']}{' '}
                              mm/jam
                            </span>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      Data cuaca tidak tersedia
                    </div>
                  )}

                  <div className="text-xs text-slate-500 border-t pt-2">
                    Lat: {selectedLocation?.latitude?.toFixed(4) || 'N/A'}, Lng:{' '}
                    {selectedLocation?.longitude?.toFixed(4) || 'N/A'}
                  </div>
                </div>
              </Card>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Fullscreen toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/80"
      >
        {isFullscreen ? (
          <Minimize2 size={16} className="text-white" />
        ) : (
          <Maximize2 size={16} className="text-white" />
        )}
      </Button>

      {/* Weather layer toggles */}
      <div className="absolute top-4 right-20 z-[1000] flex flex-col space-y-2">
        {Object.entries(weatherLayers).map(([layerType, isActive]) => {
          const IconComponent = {
            clouds: Cloud,
            precipitation: CloudRain,
            temperature: Thermometer,
            wind: Wind,
            pressure: Gauge,
          }[layerType as keyof WeatherLayers];
          const label = {
            clouds: 'Awan',
            precipitation: 'Hujan',
            temperature: 'Suhu',
            wind: 'Angin',
            pressure: 'Tekanan',
          }[layerType as keyof WeatherLayers];

          return (
            <Button
              key={layerType}
              variant="ghost"
              size="icon"
              onClick={() => onToggleLayer(layerType as keyof WeatherLayers)}
              className={cn(
                'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/80',
                isActive ? 'bg-blue-500/20 border-blue-500/30' : '',
              )}
              title={`Toggle ${label} Layer`}
            >
              {IconComponent && (
                <IconComponent size={16} className="text-white" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Active layers indicator */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 p-3">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-white">Layer Aktif:</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(weatherLayers)
                .filter(([_, isActive]) => isActive)
                .map(([layerType, _]) => {
                  const layerNames = {
                    clouds: 'Awan',
                    precipitation: 'Hujan',
                    temperature: 'Suhu',
                    wind: 'Angin',
                    pressure: 'Tekanan',
                  };
                  return (
                    <Badge
                      key={layerType}
                      variant="secondary"
                      className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30"
                    >
                      {layerNames[layerType as keyof typeof layerNames]}
                    </Badge>
                  );
                })}
              {Object.values(weatherLayers).every((v) => !v) && (
                <Badge variant="outline" className="text-xs text-slate-400">
                  Tidak ada layer aktif
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
