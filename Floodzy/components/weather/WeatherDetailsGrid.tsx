'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Sun,
  Eye,
  Thermometer,
  Sunrise,
  Sunset,
  Cloud,
} from 'lucide-react';

interface WeatherDetailsGridProps {
  current: any; // TODO: Define a proper type for current weather data
}

export function WeatherDetailsGrid({ current }: WeatherDetailsGridProps) {
  if (!current) {
    return null;
  }

  const uvIndex = current.uvi?.toFixed(0);
  const visibility = (current.visibility / 1000)?.toFixed(1); // Convert meters to kilometers
  const dewPoint = current.dew_point?.toFixed(1);
  const pressure = current.pressure;
  const sunriseTime = current.sunrise ? format(new Date(current.sunrise * 1000), 'HH:mm', { locale: id }) : '-';
  const sunsetTime = current.sunset ? format(new Date(current.sunset * 1000), 'HH:mm', { locale: id }) : '-';

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Detail Cuaca Tambahan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5 text-yellow-400" />
            <span>Indeks UV: {uvIndex}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-gray-400" />
            <span>Jarak Pandang: {visibility} km</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-red-400" />
            <span>Titik Embun: {dewPoint}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            <span>Tekanan Udara: {pressure} hPa</span>
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
