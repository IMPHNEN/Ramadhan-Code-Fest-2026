import { useState, useCallback } from 'react';
import type {
  CombinedWeatherData,
  OpenWeatherMapCurrentResponse,
} from '@/lib/api';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<CombinedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(
    async (latitude: number, longitude: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/weather?lat=${latitude}&lon=${longitude}`,
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal mengambil data cuaca.');
        }
        const data: CombinedWeatherData = await response.json();
        setWeatherData(data);
      } catch (err: any) {
        setError(err.message);
        setWeatherData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { weatherData, isLoading, error, fetchWeather };
};
