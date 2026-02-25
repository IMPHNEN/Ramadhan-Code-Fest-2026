import { useQuery } from '@tanstack/react-query';
import { fetchWaterLevelData } from '@/lib/api.client';
import { WaterLevelPost } from '@/lib/api';

export const useWaterLevelData = (districtName?: string) => {
  const { data, isLoading, error, refetch } = useQuery<WaterLevelPost[], Error>(
    {
      queryKey: ['waterLevelData', districtName],
      queryFn: () => fetchWaterLevelData(districtName),
      enabled: !!districtName, // Only fetch if districtName is provided
      staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
  );

  return {
    waterLevelPosts: data || [],
    isLoading,
    error: error ? error.message : null,
    fetchWaterLevels: refetch,
  };
};
