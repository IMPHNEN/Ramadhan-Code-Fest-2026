'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subHours, getHours } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, AlertCircle } from 'lucide-react';
import { normalizeSeries, ChartRow } from '@/lib/utils';
import { safeFetch, UserFriendlyError } from '@/lib/error-utils';
import { useLanguage } from '@/src/context/LanguageContext';

interface FloodReportData {
  hour: string;
  count: number;
}

const DATA_KEYS = ['count'];

const FloodReportChart: React.FC = () => {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<FloodReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHourlyFloodReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const twentyFourHoursAgo = subHours(new Date(), 24); // Keep as Date object for comparison

      // Fetch data from the new /api/laporan endpoint
      const reports: { id: string; timestamp: string; }[] = await safeFetch(
        '/api/laporan',
        undefined,
        t('sensorData.errorTitle') // Using translated error title as fallback
      );

      // Filter reports for the last 24 hours
      const recentReports = reports.filter(report => {
        const reportDate = new Date(report.timestamp);
        return !isNaN(reportDate.getTime()) && reportDate >= twentyFourHoursAgo;
      });

      const hourlyCounts: { [key: string]: number } = {};
      // Initialize counts for the last 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = getHours(subHours(new Date(), 23 - i)); // Get hours from 23 hours ago to current hour
        hourlyCounts[hour.toString().padStart(2, '0')] = 0;
      }

      recentReports.forEach(report => {
        const reportDate = new Date(report.timestamp);
        if (!isNaN(reportDate.getTime())) { // Check if date is valid
          const hour = getHours(reportDate);
          const formattedHour = hour.toString().padStart(2, '0');
          if (hourlyCounts[formattedHour] !== undefined) {
            hourlyCounts[formattedHour]++;
          }
        }
      });

      const formattedData = Object.keys(hourlyCounts).sort().map(hour => ({
        hour: `${hour}:00`, // Keep this format for XAxis tickFormatter
        count: hourlyCounts[hour],
      }));

      const safeData = normalizeSeries(formattedData as ChartRow[], DATA_KEYS) as FloodReportData[];

      console.log('[Chart] range=24h len=', Array.isArray(safeData) ? safeData.length : 0);
      if (safeData.length > 0) {
        console.table(safeData.slice(0, 3));
      }

      setChartData(safeData);
    } catch (err: any) {
      if (err instanceof UserFriendlyError) {
        setError(err.message);
      } else {
        setError(t('sensorData.errorMessage').replace('{message}', 'Unknown error'));
      }
      console.error('Error fetching hourly flood reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHourlyFloodReports();
    // Refresh every 1 hour instead of 24 hours for more dynamic data
    const interval = setInterval(fetchHourlyFloodReports, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-sm">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-3" />
        <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">{t('sensorData.statistics.title')}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-sm">
        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
        <p className="text-sm sm:text-base text-red-500 dark:text-red-400">{t('sensorData.errorTitle')}: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('sensorData.reports.title')} (24h)</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartData && chartData.length > 0 ? (
          <BarChart data={chartData} margin={{
            top: 5, right: 10, left: 10, bottom: 5,
          }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
            <XAxis
              dataKey="hour"
              stroke="#64748b"
              tickFormatter={(tick) => format(new Date().setHours(parseInt(tick.split(':')[0])), 'HH:mm', { locale: id })}
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
              itemStyle={{ color: '#0f172a' }}
              cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
              formatter={(value: number) => [`${value} ${t('sensorData.charts.reports')}`, t('sensorData.charts.total')]}
            />
            <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <div className="flex items-center justify-center h-full text-sm sm:text-base text-slate-500">
            {t('sensorData.charts.noData')}
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default FloodReportChart;