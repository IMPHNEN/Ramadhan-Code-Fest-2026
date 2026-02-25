'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface RainfallData {
  timestamp: number;
  rain: number;
}

const HistoricalRainfallChart: React.FC = () => {
  const [rainfallData, setRainfallData] = useState<RainfallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRainfallData = async () => {
      try {
        // Example coordinates (Jakarta) and a 24-hour period
        const lat = '-6.2088';
        const lon = '106.8456';
        const endTimestamp = Math.floor(Date.now() / 1000); // current time in Unix timestamp
        const startTimestamp = endTimestamp - (24 * 3600); // 24 hours ago

        const response = await fetch(`/api/weather-history?lat=${lat}&lon=${lon}&start=${startTimestamp}&end=${endTimestamp}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: RainfallData[] = await response.json();
        setRainfallData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRainfallData();
  }, []);

  if (loading) {
    return <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8"><CardContent>Loading historical rainfall data...</CardContent></Card>;
  }

  if (error) {
    return <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8"><CardContent>Error: {error}</CardContent></Card>;
  }

  return (
    <Card className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg mt-8">
      <CardHeader>
        <CardTitle>Curah Hujan Historis (24 Jam Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        {rainfallData.length === 0 ? (
          <p>Tidak ada data curah hujan historis yang tersedia.</p>
        ) : (
          <div className="space-y-2">
            {rainfallData.map((dataPoint, index) => (
              <p key={index}>
                {format(new Date(dataPoint.timestamp * 1000), 'dd/MM/yyyy HH:mm')}: {dataPoint.rain} mm
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalRainfallChart;
