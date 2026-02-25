'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  Database as TableIcon,
  CloudRain,
  MapPin,
  Clock,
  Droplets,
  AlertCircle,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  ChevronRight,
  Activity,
  Thermometer,
  Wind,
  Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

import { useWeatherData } from '@/hooks/useWeatherData';
import FloodReportChart from './FloodReportChart';
import { useLanguage } from '@/src/context/LanguageContext';

interface LaporanBanjir {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  water_level: string;
  description?: string;
  photo_url?: string;
  reporter_name?: string;
  reporter_contact?: string;
  created_at: string; // ISO string
}

const classifyWaterLevelString = (waterLevelString: string, t: (key: string) => string): {
  label: string;
  level: 'low' | 'medium' | 'high';
  colorClass: string;
  icon: React.ReactNode;
} => {
  switch (waterLevelString) {
    case 'semata_kaki':
      return { label: t('sensorData.filter.low'), level: 'low', colorClass: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20', icon: <Activity className="h-4 w-4" /> };
    case 'selutut':
      return { label: t('sensorData.filter.medium').split('/')[0], level: 'medium', colorClass: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20', icon: <Droplets className="h-4 w-4" /> };
    case 'sepaha':
      return { label: t('sensorData.filter.medium').split('/')[1] || t('sensorData.filter.medium'), level: 'medium', colorClass: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/20', icon: <Droplets className="h-4 w-4" /> };
    case 'sepusar':
      return { label: t('sensorData.filter.high').split('/')[0], level: 'high', colorClass: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20', icon: <AlertCircle className="h-4 w-4" /> };
    case 'lebih_dari_sepusar':
      return { label: t('sensorData.filter.high').split('/')[1] || t('sensorData.filter.high'), level: 'high', colorClass: 'text-red-700 dark:text-red-500 bg-red-200 dark:bg-red-700/20', icon: <AlertCircle className="h-4 w-4" /> };
    default:
      return { label: 'Unknown', level: 'low', colorClass: 'text-slate-600 dark:text-gray-400 bg-slate-100 dark:bg-gray-500/20', icon: <Activity className="h-4 w-4" /> };
  }
};

interface DataSensorClientContentProps {
  initialLaporan: LaporanBanjir[];
}

const DataSensorClientContent: React.FC<DataSensorClientContentProps> = ({ initialLaporan }) => {
  const { t, lang } = useLanguage();
  const [laporan, setLaporan] = useState<LaporanBanjir[]>(initialLaporan);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState('high');
  const [alertMethod, setAlertMethod] = useState('email');
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const { weatherData, isLoading: isWeatherLoading, error: weatherError, fetchWeather } = useWeatherData();

  useEffect(() => {
    // Fetch weather data for a default location (e.g., Jakarta)
    fetchWeather(-6.2088, 106.8456);
  }, [fetchWeather]);

  const INITIAL_DISPLAY_LIMIT = 5; // You can adjust this value
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);

  // Perbaikan: Mendefinisikan filteredAndSortedLaporan
  const filteredAndSortedLaporan = useMemo(() => {
    const filtered = laporan.filter(report => {
      const matchesSearch = searchTerm === '' ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const level = classifyWaterLevelString(report.water_level, t).level;
      const matchesFilter = selectedFilter === 'all' || selectedFilter === level;

      return matchesSearch && matchesFilter;
    });

    // Sorting by created_at in descending order (terbaru ke terlama)
    const sorted = [...filtered].sort((a, b) =>
      parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime()
    );

    return sorted;
  }, [laporan, searchTerm, selectedFilter, t]);


  const displayedReports = useMemo(() => {
    return (filteredAndSortedLaporan || []).slice(0, displayLimit);
  }, [filteredAndSortedLaporan, displayLimit]);

  const stats = useMemo(() => {
    const total = laporan.length;
    const highLevel = laporan.filter(r => classifyWaterLevelString(r.water_level, t).level === 'high').length;
    const mediumLevel = laporan.filter(r => classifyWaterLevelString(r.water_level, t).level === 'medium').length;
    const lowLevel = laporan.filter(r => classifyWaterLevelString(r.water_level, t).level === 'low').length;

    return { total, highLevel, mediumLevel, lowLevel, avgLevel: 0 };
  }, [laporan, t]);

  const handleExportData = () => {
    // Menggunakan displayedReports (seperti yang tampaknya dimaksudkan)
    if (displayedReports.length === 0) {
      alert(t('sensorData.modals.weather.unavailable'));
      return;
    }

    const headers = [
      'ID',
      t('sensorData.reports.location'),
      'Latitude',
      'Longitude',
      'Water Level',
      'Description',
      'Reporter Name',
      'Reporter Contact',
      t('sensorData.reports.time')
    ];

    const csvContent = [
      headers.join(','),
      ...displayedReports.map(report =>
        [
          `"${report.id}"`,
          `"${report.location}"`,
          report.latitude,
          report.longitude,
          `"${classifyWaterLevelString(report.water_level, t).label}"`,
          `"${report.description ? report.description.replace(/"/g, '""') : ''}"`,
          `"${report.reporter_name ? report.reporter_name.replace(/"/g, '""') : ''}"`,
          `"${report.reporter_contact ? report.reporter_contact.replace(/"/g, '""') : ''}"`,
          `"${format(parseISO(report.created_at), 'dd MMM yyyy, HH:mm', { locale: lang === 'id' ? id : enUS })}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'laporan_banjir.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setScheduleEmail('');
    setScheduleFrequency('daily');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('sensorData.modals.schedule.success').replace('{email}', scheduleEmail).replace('{frequency}', scheduleFrequency));
    handleCloseScheduleModal();
  };

  const handleOpenAlertModal = () => {
    setIsAlertModalOpen(true);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
    setAlertThreshold('high');
    setAlertMethod('email');
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('sensorData.modals.alert.success').replace('{threshold}', alertThreshold).replace('{method}', alertMethod));
    handleCloseAlertModal();
  };

  const handleOpenWeatherModal = () => {
    setIsWeatherModalOpen(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (geoError) => {
          console.error("Error getting geolocation:", geoError);
          alert(t('sensorData.modals.weather.geolocationError'));
        }
      );
    } else {
      alert(t('sensorData.modals.weather.geolocationUnsupported'));
    }
  };

  const handleCloseWeatherModal = () => {
    setIsWeatherModalOpen(false);
  };

  return (
    <div className="w-full text-slate-900 dark:text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl">
              <TableIcon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('sensorData.title')}</h1>
              <p className="text-slate-500 dark:text-gray-400">{t('sensorData.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TableIcon className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              <span className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs px-2 py-1 rounded-full">Total</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-slate-500 dark:text-gray-400 text-sm">{t('sensorData.statistics.totalReports')}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full">{t('common.levels.high')}</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{stats.highLevel}</div>
            <div className="text-slate-500 dark:text-gray-400 text-sm">{t('sensorData.statistics.highLevel')}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Droplets className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
              <span className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs px-2 py-1 rounded-full">{t('common.levels.medium')}</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{stats.mediumLevel}</div>
            <div className="text-slate-500 dark:text-gray-400 text-sm">{t('sensorData.statistics.mediumLevel')}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-green-500 dark:text-green-400" />
              <span className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full">{t('common.levels.low')}</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{stats.lowLevel}</div>
            <div className="text-slate-500 dark:text-gray-400 text-sm">{t('sensorData.statistics.lowLevel')}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full">Avg</span>
            </div>
            <div className="text-3xl font-bold mb-1 text-slate-900 dark:text-white">{stats.avgLevel}<span className="text-lg text-slate-400 dark:text-gray-400">cm</span></div>
            <div className="text-slate-500 dark:text-gray-400 text-sm">{t('sensorData.statistics.avgLevel')}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('sensorData.filter.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-400"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">{t('sensorData.filter.allLevels')}</option>
                <option value="low">{t('sensorData.filter.low')}</option>
                <option value="medium">{t('sensorData.filter.medium')}</option>
                <option value="high">{t('sensorData.filter.high')}</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 px-4 py-2 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{t('sensorData.filter.export')}</span>
              </button>
              <button className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <Filter className="h-4 w-4" />
                <span>{t('sensorData.filter.filter')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Reports Table */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                      <TableIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t('sensorData.reports.title')}</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400">
                        {t('sensorData.reports.showing')} {displayedReports.length} {t('sensorData.reports.of')} {laporan.length} {t('sensorData.reports.reports')}
                      </p>
                      {/* Note: Button component is not imported, assuming it's from a library like shadcn/ui */}
                      {displayedReports.length < filteredAndSortedLaporan.length && (
                        <button
                          onClick={() => setDisplayLimit(filteredAndSortedLaporan.length)}
                          className="mt-4 w-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-gray-300 rounded-lg px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {t('sensorData.reports.viewMore')} ({filteredAndSortedLaporan.length - displayedReports.length} {t('sensorData.reports.moreReports')})
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Mengganti latestReports dengan displayedReports */}
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{displayedReports.length}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {/* Mengganti latestReports dengan displayedReports */}
                {displayedReports.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {displayedReports.map((report, index) => (
                      <div key={report.id || index} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                              <h4 className="font-semibold text-slate-900 dark:text-white truncate">{report.location}</h4>
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${classifyWaterLevelString(report.water_level || '', t).colorClass}`}>
                                {classifyWaterLevelString(report.water_level || '', t).icon}
                                <span>{classifyWaterLevelString(report.water_level || '', t).label}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-gray-400 mb-2">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(parseISO(report.created_at), 'dd MMM yyyy, HH:mm', { locale: lang === 'id' ? id : enUS })}</span>
                              </div>
                              {report.reporter_name && (
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{report.reporter_name}</span>
                                </div>
                              )}
                            </div>

                            {report.description && (
                              <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">
                                {report.description.length > 100
                                  ? `${report.description.substring(0, 100)}...`
                                  : report.description
                                }
                              </p>
                            )}
                            {report.photo_url && (
                              <div className="relative w-48 h-48 mt-2">
                                <Image
                                  src={report.photo_url}
                                  alt="Foto Laporan"
                                  fill
                                  className="object-cover rounded-md"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>

                          <button className="ml-4 p-2 text-slate-400 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <TableIcon className="h-16 w-16 text-slate-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-500 dark:text-gray-400 mb-2">{t('sensorData.reports.noData')}</h3>
                    <p className="text-slate-400 dark:text-gray-500">{t('sensorData.reports.noDataDesc')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weather Analysis Sidebar */}
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg">
                    <CloudRain className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('sensorData.weather.title')}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{t('sensorData.weather.subtitle')}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {isWeatherLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-gray-400">{t('sensorData.weather.loading')}</p>
                  </div>
                ) : weatherError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
                    <p className="text-red-500 dark:text-red-400">{t('sensorData.weather.error')} {weatherError}</p>
                  </div>
                ) : weatherData ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{Math.round(weatherData.current.main.temp)}°C</div>
                      <div className="text-slate-500 dark:text-gray-400">{weatherData.current.weather[0].description}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <Droplets className="h-6 w-6 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData.current.main.humidity}%</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.humidity')}</div>
                      </div>
                      <div className="text-center">
                        <Wind className="h-6 w-6 text-green-500 dark:text-green-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData.current.wind.speed} m/s</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.wind')}</div>
                      </div>
                      <div className="text-center">
                        <Thermometer className="h-6 w-6 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData.current.main.pressure} hPa</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.pressure')}</div>
                      </div>
                      <div className="text-center">
                        <Eye className="h-6 w-6 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData.current.visibility / 1000} km</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.visibility')}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-slate-400 dark:text-gray-400 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-gray-400">{t('sensorData.weather.unavailable')}</p>
                  </div>
                )}
              </div>
            </div>



            {/* Flood Report Chart */}
            <FloodReportChart />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('sensorData.actions.title')}</h3>
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center justify-between p-3 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Download className="h-4 w-4" />
                    <span>{t('sensorData.filter.export')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleOpenScheduleModal}
                  className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4" />
                    <span>{t('sensorData.actions.scheduleReport')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleOpenAlertModal}
                  className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t('sensorData.actions.alertSettings')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleOpenWeatherModal}
                  className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Cloud className="h-4 w-4" />
                    <span>{t('sensorData.actions.currentWeather')}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-auto shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('sensorData.modals.schedule.title')}</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label htmlFor="scheduleEmail" className="block text-slate-700 dark:text-gray-300 text-sm font-medium mb-1">{t('sensorData.modals.schedule.emailLabel')}</label>
                <input
                  type="email"
                  id="scheduleEmail"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="scheduleFrequency" className="block text-slate-700 dark:text-gray-300 text-sm font-medium mb-1">{t('sensorData.modals.schedule.frequencyLabel')}</label>
                <select
                  id="scheduleFrequency"
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="daily">{t('sensorData.modals.schedule.daily')}</option>
                  <option value="weekly">{t('sensorData.modals.schedule.weekly')}</option>
                  <option value="monthly">{t('sensorData.modals.schedule.monthly')}</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseScheduleModal}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('sensorData.modals.schedule.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  {t('sensorData.modals.schedule.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAlertModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-auto shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('sensorData.modals.alert.title')}</h3>
            <form onSubmit={handleAlertSubmit} className="space-y-4">
              <div>
                <label htmlFor="alertThreshold" className="block text-slate-700 dark:text-gray-300 text-sm font-medium mb-1">{t('sensorData.modals.alert.thresholdLabel')}</label>
                <select
                  id="alertThreshold"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="low">{t('sensorData.filter.low')}</option>
                  <option value="medium">{t('sensorData.filter.medium')}</option>
                  <option value="high">{t('sensorData.filter.high')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="alertMethod" className="block text-slate-700 dark:text-gray-300 text-sm font-medium mb-1">{t('sensorData.modals.alert.methodLabel')}</label>
                <select
                  id="alertMethod"
                  value={alertMethod}
                  onChange={(e) => setAlertMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="email">{t('sensorData.modals.alert.email')}</option>
                  <option value="sms">{t('sensorData.modals.alert.sms')}</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseAlertModal}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('sensorData.modals.alert.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  {t('sensorData.modals.alert.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isWeatherModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-auto shadow-xl">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('sensorData.modals.weather.title')}</h3>
            {isWeatherLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-gray-400">{t('sensorData.weather.loading')}</p>
              </div>
            ) : weatherError ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-red-500 dark:text-red-400">{t('sensorData.weather.error')} {weatherError}</p>
              </div>
            ) : weatherData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-slate-500 dark:text-gray-400 text-sm">{t('sensorData.reports.location')}: {weatherData?.current?.name}</p>
                  <div className="text-5xl font-bold text-slate-900 dark:text-white mt-2">{Math.round(weatherData?.current?.main?.temp || 0)}°C</div>
                  <p className="text-slate-500 dark:text-gray-400 text-lg">{weatherData?.current?.weather?.[0]?.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Droplets className="h-6 w-6 text-blue-500 dark:text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData?.current?.main?.humidity}%</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.humidity')}</p>
                  </div>
                  <div>
                    <Wind className="h-6 w-6 text-green-500 dark:text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData?.current?.wind?.speed} m/s</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.wind')}</p>
                  </div>
                  <div>
                    <Thermometer className="h-6 w-6 text-orange-500 dark:text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData?.current?.main?.pressure} hPa</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.pressure')}</p>
                  </div>
                  <div>
                    <Eye className="h-6 w-6 text-purple-500 dark:text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData?.current?.visibility ? weatherData.current.visibility / 1000 : 'N/A'} km</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.visibility')}</p>
                  </div>
                  <div>
                    <Clock className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData?.current?.sys?.sunrise ? format(new Date(weatherData.current.sys.sunrise * 1000), 'HH:mm') : 'N/A'}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.sunrise')}</p>
                  </div>
                  <div>
                    <Clock className="h-6 w-6 text-yellow-500 dark:text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{weatherData?.current?.sys?.sunset ? format(new Date(weatherData.current.sys.sunset * 1000), 'HH:mm') : 'N/A'}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{t('sensorData.weather.sunset')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-slate-400 dark:text-gray-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-gray-400">{t('sensorData.weather.unavailable')}</p>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleCloseWeatherModal}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {t('sensorData.modals.weather.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSensorClientContent;