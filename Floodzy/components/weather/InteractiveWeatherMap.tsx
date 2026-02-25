'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, CloudRain, Wind } from 'lucide-react';

// Dynamic import for the new specialized map
const WeatherInsightMap = dynamic(
  () => import('@/components/map/WeatherInsightMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    ),
  },
);

interface InteractiveWeatherMapProps {
  latitude: number;
  longitude: number;
  activeLayer?: string | null; // Kept for backward compatibility if needed, but we use internal state now
}

export function InteractiveWeatherMap({ latitude, longitude }: InteractiveWeatherMapProps) {
  const [mode, setMode] = useState<'radar' | 'aqi'>('radar');

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-md text-white p-6">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Peta Cuaca Interaktif</CardTitle>

        {/* Mode Switcher */}
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(val) => { if (val) setMode(val as 'radar' | 'aqi') }}
          className="bg-slate-900/50 p-1 rounded-lg border border-slate-700"
        >
          <ToggleGroupItem value="radar" aria-label="Rain Radar" className="data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
            <CloudRain size={16} className="mr-2" />
            Radar Hujan
          </ToggleGroupItem>
          <ToggleGroupItem value="aqi" aria-label="Air Quality" className="data-[state=on]:bg-green-600 data-[state=on]:text-white">
            <Wind size={16} className="mr-2" />
            Kualitas Udara
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full rounded-lg overflow-hidden border border-slate-700 shadow-inner bg-slate-950">
          <WeatherInsightMap
            center={[latitude, longitude]}
            zoom={8} // Slightly zoomed out for radar context
            activeMode={mode}
            className="h-full w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
