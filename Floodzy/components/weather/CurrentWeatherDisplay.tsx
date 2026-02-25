'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  Sunrise,
  Sunset,
  Gauge,
  Eye,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

interface CurrentWeatherDisplayProps {
  current: any; // TODO: Define a proper type for current weather data
}

const getWeatherIcon = (iconCode: string) => {
  switch (iconCode) {
    case '01d':
    case '01n':
      return <Sun className="h-16 w-16 text-yellow-400" />;
    case '02d':
    case '02n':
      return <CloudSun className="h-16 w-16 text-gray-300" />;
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return <Cloud className="h-16 w-16 text-gray-400" />;
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return <CloudRain className="h-16 w-16 text-blue-400" />;
    case '11d':
    case '11n':
      return <Zap className="h-16 w-16 text-yellow-500" />;
    case '13d':
    case '13n':
      return <CloudSnow className="h-16 w-16 text-cyan-400" />;
    case '50d':
    case '50n':
      return <Cloud className="h-16 w-16 text-gray-500" />;
    default:
      return <Cloud className="h-16 w-16 text-gray-400" />;
  }
};

export function CurrentWeatherDisplay({ current }: CurrentWeatherDisplayProps) {
  if (!current) {
    return null;
  }

  const temperature = current.temp?.toFixed(0);
  const feelsLike = current.feels_like?.toFixed(0);
  const description = current.weather?.[0]?.description || '-';
  const iconCode = current.weather?.[0]?.icon || '01d';
  const humidity = current.humidity;
  const windSpeed = current.wind_speed?.toFixed(1);
  const sunriseTime = current.sunrise ? format(new Date(current.sunrise * 1000), 'HH:mm', { locale: id }) : '-';
  const sunsetTime = current.sunset ? format(new Date(current.sunset * 1000), 'HH:mm', { locale: id }) : '-';

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span>Cuaca Saat Ini</span>
          <span className="text-lg font-normal text-gray-400">
            {format(new Date(current.dt * 1000), 'EEEE, dd MMMM HH:mm', { locale: id })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex flex-col items-center justify-center">
          {getWeatherIcon(iconCode)}
          <p className="text-5xl font-bold mt-2">{temperature}°C</p>
          <p className="text-lg text-gray-300">Terasa seperti {feelsLike}°C</p>
          <p className="text-xl font-semibold text-gray-200 capitalize mt-1">{description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="h-5 w-5 text-blue-400" />
            <span>Kelembapan: {humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-5 w-5 text-green-400" />
            <span>Angin: {windSpeed} m/s</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sunrise className="h-5 w-5 text-yellow-400" />
            <span>Matahari Terbit: {sunriseTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sunset className="h-5 w-5 text-orange-400" />
            <span>Matahari Terbenam: {sunsetTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
