// src/hooks/useRegionData.ts
import { useState, useEffect } from 'react';
import { fetchRegionsClient } from '@/lib/api.client'; // Import client-side fetchRegions
import { RegionData } from '@/lib/api'; // RegionData tetap diimpor secara named

interface UseRegionDataOptions {
  type: 'provinces' | 'regencies' | 'districts' | 'villages';
  parentCode?: number | string | null;
  enabled?: boolean; // Untuk mengontrol kapan fetching aktif
}

interface UseRegionDataResult {
  data: RegionData[];
  loading: boolean;
  error: string | null;
}

export function useRegionData({
  type,
  parentCode,
  enabled = true,
}: UseRegionDataOptions): UseRegionDataResult {
  const [data, setData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hanya fetch jika 'enabled' dan parentCode valid jika diperlukan
    if (
      !enabled ||
      (parentCode === null &&
        (type === 'regencies' || type === 'districts' || type === 'villages'))
    ) {
      setData([]); // Kosongkan data jika tidak enabled atau parentCode null
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // === PERBAIKAN DI SINI: Panggil fetchRegions melalui alias apiService ===
        const result = await fetchRegionsClient(
          type,
          parentCode || undefined,
        );
        console.log(
          `DEBUG useRegionData: Raw API response for type '${type}' and parent '${parentCode}':`,
          result,
        );
        setData(result);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
        setData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, parentCode, enabled]); // Dependencies untuk useEffect

  return { data, loading, error };
}
