// src/components/weather/WeatherDisplay.tsx
'use client';

import { motion } from 'framer-motion';
import {
  Cloud,
  Sun,
  CloudRain,
  Zap,
  Wind,
  Droplets,
  Thermometer,
  Eye, // Eye ikon untuk visibility jika ada di WeatherData
  Gauge,
  ArrowUp, // Ikon untuk UV Index
  Loader2,
  Frown,
  CloudDrizzle, // Digunakan juga untuk salju sementara
  CloudSnow, // Jika ada ikon salju yang lebih spesifik
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Sunrise, Sunset } from 'lucide-react'; // Add Sunrise and Sunset icons
import { CombinedWeatherData, OpenWeatherMapCurrentResponse } from '@/lib/api';

interface WeatherDisplayProps {
  data: CombinedWeatherData | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

// Mapper untuk ikon cuaca OpenWeatherMap
const getOpenWeatherIcon = (iconCode: string) => {
  if (!iconCode) return Cloud;

  if (iconCode.startsWith('01')) return Sun; // Clear sky
  if (
    iconCode.startsWith('02') || // Few clouds
    iconCode.startsWith('03') || // Scattered clouds
    iconCode.startsWith('04') // Broken clouds
  )
    return Cloud;
  if (
    iconCode.startsWith('09') || // Shower rain
    iconCode.startsWith('10') // Rain
  )
    return CloudRain;
  if (iconCode.startsWith('11')) return Zap; // Thunderstorm
  // Perbaikan: Ikon untuk salju
  if (iconCode.startsWith('13')) return CloudSnow || CloudDrizzle; // Prefer CloudSnow if available, else CloudDrizzle
  if (iconCode.startsWith('50')) return Cloud; // Mist / Haze

  return Cloud; // Default fallback
};

const weatherMetrics = [
  { key: 'humidity', label: 'Kelembaban', icon: Droplets, unit: '%' },
  { key: 'windSpeed', label: 'Kecepatan Angin', icon: Wind, unit: 'm/s' }, // Changed unit to m/s as per page.tsx
  { key: 'pressure', label: 'Tekanan', icon: Gauge, unit: 'hPa' },
  { key: 'visibility', label: 'Visibilitas', icon: Eye, unit: 'km' },
];

export function WeatherDisplay({
  data,
  loading,
  error,
  className,
}: WeatherDisplayProps) {
  if (loading) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden h-[250px] flex items-center justify-center',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Memuat cuaca...</p>
          <Skeleton className="h-8 w-48 bg-gray-700" />
          <Skeleton className="h-6 w-32 bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden h-[250px] flex items-center justify-center bg-red-900/30 border-red-700/50 text-red-300',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
          <Frown className="h-10 w-10" />
          <p className="font-semibold">Error memuat cuaca</p>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Ensure data and data.current exist before proceeding
  if (!data || !data.current) {
    return (
      <Card
        className={cn(
          'relative overflow-hidden h-[250px] flex items-center justify-center',
          className,
        )}
      >
        <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
          <Thermometer className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            Pilih wilayah untuk melihat cuaca.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { current } = data;
  const WeatherIcon = getOpenWeatherIcon(current.weather[0].icon);

  // Helper function to safely get and round a numeric value
  const getRoundedValue = (
    value: number | undefined | null,
    isVisibility: boolean = false,
  ): string | number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return isVisibility ? (value / 1000).toFixed(1) : Math.round(value);
    }
    return 'N/A'; // Return a string if the value is not a valid number
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('space-y-4', className)}
    >
      {/* Main Weather Card */}
      <Card
        className={cn(
          'relative overflow-hidden',
          'bg-gray-800 border-gray-700',
          'text-white',
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">Cuaca Saat Ini</CardTitle>
            <Badge variant="glass" className="text-white">
              {new Date(current.dt * 1000).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <WeatherIcon className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
              </motion.div>

              <div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    {getRoundedValue(current.main.temp)}
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl">°C</span>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-white/90 capitalize">
                  {current.weather[0].description}
                </p>
              </div>
            </div>

            <div className="text-right">
              {/* UV Index removed as it's not available from this endpoint */}
              <div className="flex items-center space-x-1 text-xs sm:text-sm mt-1">
                <Thermometer className="h-4 w-4" />
                <span>
                  Terasa: {getRoundedValue(current.main.feels_like)}°C
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm mt-1">
                <Sunrise className="h-4 w-4" />
                <span>
                  Terbit:{' '}
                  {new Date(current.sys.sunrise * 1000).toLocaleTimeString(
                    'id-ID',
                    { hour: '2-digit', minute: '2-digit' },
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm mt-1">
                <Sunset className="h-4 w-4" />
                <span>
                  Terbenam:{' '}
                  {new Date(current.sys.sunset * 1000).toLocaleTimeString(
                    'id-ID',
                    { hour: '2-digit', minute: '2-digit' },
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Animated background elements (tetap sama) */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-8 left-8 w-6 h-6 bg-white rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
        </div>
      </Card>

      {/* Weather Metrics Grid */}
      <div
        className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4')}
      >
        {weatherMetrics.map((metric, index) => (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center text-center w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                    <span className="text-xs sm:text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl sm:text-2xl font-bold">
                      {getRoundedValue(
                        metric.key === 'humidity'
                          ? current.main.humidity
                          : metric.key === 'windSpeed'
                            ? current.wind.speed
                            : metric.key === 'pressure'
                              ? current.main.pressure
                              : metric.key === 'visibility'
                                ? current.visibility
                                : undefined,
                        metric.key === 'visibility',
                      )}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {metric.unit}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {typeof current.rain?.['1h'] === 'number' &&
          !isNaN(current.rain['1h']) &&
          current.rain['1h'] > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center text-center w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      <CloudRain className="h-5 w-5 text-primary" />
                      <span className="text-xs sm:text-sm font-medium">
                        Curah Hujan (1h)
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl sm:text-2xl font-bold">
                        {getRoundedValue(current.rain['1h'])}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">mm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </div>
    </motion.div>
  );
}
