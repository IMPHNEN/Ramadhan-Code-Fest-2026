'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Zap,
} from 'lucide-react';

interface HourlyForecastProps {
  hourly: any[]; // TODO: Define a proper type for hourly forecast data
}

const getHourlyWeatherIcon = (iconCode: string) => {
  switch (iconCode) {
    case '01d':
    case '01n':
      return <Sun className="h-8 w-8 text-yellow-400" />;
    case '02d':
    case '02n':
      return <CloudSun className="h-8 w-8 text-gray-300" />;
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return <Cloud className="h-8 w-8 text-gray-400" />;
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return <CloudRain className="h-8 w-8 text-blue-400" />;
    case '11d':
    case '11n':
      return <Zap className="h-8 w-8 text-yellow-500" />;
    case '13d':
    case '13n':
      return <CloudSnow className="h-8 w-8 text-cyan-400" />;
    case '50d':
    case '50n':
      return <Cloud className="h-8 w-8 text-gray-500" />;
    default:
      return <Cloud className="h-8 w-8 text-gray-400" />;
  }
};

export function HourlyForecast({ hourly }: HourlyForecastProps) {
  if (!hourly || hourly.length === 0) {
    return null;
  }

  // Take the next 24 hours
  const next24Hours = hourly.slice(0, 24);

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Prakiraan Per Jam (24 Jam Ke Depan)</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md pb-4">
          <div className="flex space-x-4">
            {next24Hours.map((hourData, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 border border-gray-700/50 rounded-lg bg-gray-700/30 flex-shrink-0"
              >
                <p className="text-sm font-semibold">
                  {format(new Date(hourData.dt * 1000), 'HH:mm', { locale: id })}
                </p>
                <div className="my-2">
                  {getHourlyWeatherIcon(hourData.weather?.[0]?.icon || '01d')}
                </div>
                <p className="text-lg font-bold">{hourData.temp?.toFixed(0)}°C</p>
                <p className="text-xs text-gray-400 capitalize text-center">
                  {hourData.weather?.[0]?.description || '-'}
                </p>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
