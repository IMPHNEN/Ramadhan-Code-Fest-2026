import { useState, useCallback } from 'react';
import { fetchDisasterProneData } from '@/lib/api.client';
import { OverpassElement } from '@/lib/api';
import { getCachedData, setCachedData } from '@/lib/indexeddb'; // ADDED: Import IndexedDB utilities
import { UserFriendlyError } from '@/lib/error-utils'; // ADDED: Import UserFriendlyError

const CACHE_KEY = 'disasterProneAreas';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

export const useDisasterData = () => {
  const [disasterProneAreas, setDisasterProneAreas] = useState<
    OverpassElement[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataFromCache, setIsDataFromCache] = useState(false); // ADDED: State to indicate data source

  const fetchDisasterAreas = useCallback(
    async (bounds: {
      south: number;
      west: number;
      north: number;
      east: number;
    }) => {
      setIsLoading(true);
      setError(null);
      setIsDataFromCache(false); // Reset data source indicator

      const cacheId = `${CACHE_KEY}-${JSON.stringify(bounds)}`; // Unique ID for cache entry

      try {
        // 1. Try to load from cache
        const cached = await getCachedData<{ data: OverpassElement[]; timestamp: number }>(cacheId);
        if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRATION_MS)) {
          setDisasterProneAreas(cached.data);
          setIsDataFromCache(true);
          console.log('Disaster data loaded from cache.');
          return; // Use cached data if fresh
        }
        console.log('Disaster data not in cache or expired, fetching from network.');

        // 2. Fetch from network
        const data = await fetchDisasterProneData(
          bounds.south,
          bounds.west,
          bounds.north,
          bounds.east,
        );
        setDisasterProneAreas(data.elements);
        setIsDataFromCache(false);

        // 3. Store in cache
        await setCachedData(cacheId, { data: data.elements, timestamp: Date.now() });

      } catch (err: any) {
        // If network fetch fails, try to load from cache even if expired
        const cached = await getCachedData<{ data: OverpassElement[]; timestamp: number }>(cacheId);
        if (cached) {
          setDisasterProneAreas(cached.data);
          setIsDataFromCache(true);
          setError(`Gagal memuat data terbaru. Menampilkan data dari cache (${new Date(cached.timestamp).toLocaleTimeString()}).`);
          console.warn('Network fetch failed, falling back to expired cache:', err);
        } else {
          if (err instanceof UserFriendlyError) {
            setError(err.message);
          } else {
            setError('Terjadi kesalahan saat memuat data area rawan bencana.');
          }
          setDisasterProneAreas([]);
          console.error('Error fetching disaster data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { disasterProneAreas, isLoading, error, fetchDisasterAreas, isDataFromCache }; // EXPOSED isDataFromCache
};