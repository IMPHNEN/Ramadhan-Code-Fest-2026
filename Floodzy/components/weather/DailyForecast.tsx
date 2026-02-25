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
  Sun,
  Zap,
} from 'lucide-react';

interface DailyForecastProps {
  daily: any[]; // TODO: Define a proper type for daily forecast data
}

const getDailyWeatherIcon = (iconCode: string) => {
  switch (iconCode) {
    case '01d':
    case '01n':
      return <Sun className="h-6 w-6 text-yellow-400" />;
    case '02d':
    case '02n':
      return <CloudSun className="h-6 w-6 text-gray-300" />;
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return <Cloud className="h-6 w-6 text-gray-400" />;
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    case '11d':
    case '11n':
      return <Zap className="h-6 w-6 text-yellow-500" />;
    case '13d':
    case '13n':
      return <CloudSnow className="h-6 w-6 text-cyan-400" />;
    case '50d':
    case '50n':
      return <Cloud className="h-6 w-6 text-gray-500" />;
    default:
      return <Cloud className="h-6 w-6 text-gray-400" />;
  }
};

export function DailyForecast({ daily }: DailyForecastProps) {
  if (!daily || daily.length === 0) {
    return null;
  }

  // Take the next 7 days
  const next7Days = daily.slice(0, 7);

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold">Prakiraan Harian (7 Hari Ke Depan)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {next7Days.map((dayData, index) => (
            <div key={index} className="flex items-center justify-between border-b border-gray-700/50 pb-3 last:border-b-0 last:pb-0">
              <div className="flex items-center space-x-3">
                {getDailyWeatherIcon(dayData.weather?.[0]?.icon || '01d')}
                <div>
                  <p className="font-semibold">
                    {index === 0 ? 'Hari Ini' : format(new Date(dayData.dt * 1000), 'EEEE', { locale: id })}
                  </p>
                  <p className="text-sm text-gray-400 capitalize">
                    {dayData.weather?.[0]?.description || '-'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{dayData.temp?.max?.toFixed(0)}°C / {dayData.temp?.min?.toFixed(0)}°C</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
