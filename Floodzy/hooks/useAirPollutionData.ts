import { useState, useCallback } from 'react';
import { getAirPollutionData } from '@/lib/geocodingService';
import { AirPollutionData } from '@/types/airPollution';

export function useAirPollutionData() {
  const [airPollutionData, setAirPollutionData] =
    useState<AirPollutionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAirPollutionData = useCallback(
    async (lat: number, lon: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAirPollutionData(lat, lon);
        setAirPollutionData(data);
      } catch (err) {
        setError('Failed to fetch air pollution data');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { airPollutionData, isLoading, error, fetchAirPollutionData };
}
