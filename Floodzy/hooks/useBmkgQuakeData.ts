import { useState, useEffect } from 'react';
import { fetchBmkgLatestQuake } from '@/lib/api.client';
import { BmkgGempaData } from '@/lib/api';

const DATA_FETCH_INTERVAL_MS = 10 * 60 * 1000;

export const useBmkgQuakeData = () => {
  const [latestQuake, setLatestQuake] = useState<BmkgGempaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLatestQuake = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBmkgLatestQuake();
        setLatestQuake(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getLatestQuake();
    const interval = setInterval(getLatestQuake, DATA_FETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { latestQuake, isLoading, error };
};
