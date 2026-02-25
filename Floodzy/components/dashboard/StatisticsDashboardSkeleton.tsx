'use client';

import { Loader2 } from 'lucide-react';

export const StatisticsDashboardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-800 border border-gray-700 rounded-xl p-6 h-36 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};
