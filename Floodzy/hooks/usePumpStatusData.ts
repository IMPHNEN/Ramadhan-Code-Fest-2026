import { useQuery } from '@tanstack/react-query';
import { fetchPumpStatusData } from '@/lib/api.client';
import { PumpData } from '@/lib/api';

export const usePumpStatusData = (districtName?: string) => {
  const { data, isLoading, error, refetch } = useQuery<PumpData[], Error>({
    queryKey: ['pumpStatusData', districtName],
    queryFn: () => fetchPumpStatusData(districtName),
    enabled: !!districtName, // Only fetch if districtName is provided
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  return {
    pumpStatusData: data || [],
    isLoading,
    error: error ? error.message : null,
    fetchPumpStatus: refetch,
  };
};
