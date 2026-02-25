// src/components/dashboard/DashboardStats.tsx
'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Bell,
  Shield,
  Users,
  Activity, // Digunakan untuk Status Sistem (Monitoring Aktif)
  Clock, // Digunakan untuk Aktivitas Terkini
  Waves, // Ikon untuk air, mungkin bisa dipakai untuk pompa juga
  Gauge,
  ArrowUp,
  ArrowDown,
  Loader2, // Icon spinner
  CheckCircle, // Icon untuk status 'Online' atau 'Beroperasi'
  XCircle, // Icon untuk status 'Tidak Beroperasi' atau 'Rusak'
  AlertTriangle, // Icon untuk peringatan
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTimeAgo } from '@/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';

// Import untuk data API
import { WaterLevelPost, PumpData } from '@/lib/api'; // === IMPORT BARU: PumpData ===

// Definisi props untuk DashboardStats
interface DashboardStatsProps {
  stats: {
    totalRegions: number;
    activeAlerts: number;
    floodZones: number;
    peopleAtRisk: number;
    weatherStations: number;
    lastUpdate: string;
  };
  // PROPS UNTUK DATA PUPR TMA
  waterLevelPosts: WaterLevelPost[];
  loadingWaterLevel: boolean;
  waterLevelError: string | null;
  // === PROPS BARU UNTUK DATA POMPA BANJIR ===
  pumpStatusData: PumpData[];
  loadingPumpStatus: boolean;
  pumpStatusError: string | null;
  className?: string;
}

export function DashboardStats({
  stats,
  waterLevelPosts,
  loadingWaterLevel,
  waterLevelError,
  pumpStatusData, // Menerima data pompa
  loadingPumpStatus, // Menerima status loading pompa
  pumpStatusError, // Menerima status error pompa
  className,
}: DashboardStatsProps) {
  const { t, lang } = useLanguage();

  const getStatusLabel = (status: string) => {
    if (!status) return '';
    if (lang === 'en') {
      if (status.toLowerCase().includes('bahaya')) return 'Danger';
      if (status.toLowerCase().includes('siaga 3')) return 'Alert 3';
      if (status.toLowerCase().includes('siaga 2')) return 'Alert 2';
      if (status.toLowerCase().includes('siaga 1')) return 'Alert 1';
      if (status.toLowerCase().includes('normal')) return 'Normal';
    }
    return status;
  };

  // === LOGIKA UNTUK MENGHITUNG STATUS POMPA ===
  const totalPumps = pumpStatusData.length;
  const activePumps = pumpStatusData.filter(
    (pump) =>
      pump.kondisi_bangunan &&
      pump.kondisi_bangunan.toLowerCase().includes('beroperasi'),
  ).length;
  const inactivePumps = totalPumps - activePumps;
  const pumpsNeedingMaintenance = pumpStatusData.filter(
    (pump) =>
      pump.kondisi_bangunan &&
      (pump.kondisi_bangunan.toLowerCase().includes('rusak') ||
        pump.kondisi_bangunan.toLowerCase().includes('tidak beroperasi')),
  ).length;

  const getPumpStatusBadge = (status: string) => {
    if (status.toLowerCase().includes('beroperasi'))
      return <Badge variant="success">{t('dashboard.operating')}</Badge>;
    if (
      status.toLowerCase().includes('tidak beroperasi') ||
      status.toLowerCase().includes('rusak')
    )
      return <Badge variant="danger">{t('dashboard.notOperating')}</Badge>;
    return <Badge variant="secondary">{t('dashboard.unknown')}</Badge>;
  };

  const statsConfig = [
    {
      title: t('landing.totalRegions'),
      value: stats.totalRegions,
      unit: '',
      icon: MapPin,
      color: 'text-blue-500',
      change: '2%',
      changeType: 'up',
    },
    {
      title: t('landing.activeAlerts'),
      value: stats.activeAlerts,
      unit: '',
      icon: Bell,
      color: 'text-yellow-500',
      change: '5%',
      changeType: 'down',
    },
    {
      title: t('dashboard.floodZones'),
      value: stats.floodZones,
      unit: '',
      icon: Shield,
      color: 'text-red-500',
      change: '3%',
      changeType: 'up',
    },
    {
      title: t('dashboard.peopleAtRisk'),
      value: `${(stats.peopleAtRisk / 1000000).toFixed(1)}M`, // Mengubah 2.5M menjadi 2.5M
      unit: '',
      icon: Users,
      color: 'text-purple-500',
      change: '12%',
      changeType: 'down',
    },
    {
      title: t('dashboard.weatherStations'),
      value: stats.weatherStations,
      unit: '',
      icon: Activity,
      color: 'text-green-500',
      change: '1%',
      changeType: 'up',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsConfig.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <item.icon className={cn('h-4 w-4 sm:h-5 sm:w-5', item.color)} />
                    <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.title}
                    </span>
                  </div>
                  {item.change && (
                    <Badge
                      variant={item.changeType === 'up' ? 'success' : 'danger'}
                      className="text-xs"
                    >
                      {item.change}
                    </Badge>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {item.value}
                  <span className="text-sm sm:text-base text-slate-500 dark:text-slate-400 ml-1">
                    {item.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* === BAGIAN STATUS SISTEM: MENGGUNAKAN DATA POMPA BANJIR === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">{t('dashboard.pumpSystemStatus')}</span> {/* Judul diubah */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPumpStatus ? (
                <div className="text-center text-xs sm:text-sm text-muted-foreground flex items-center justify-center space-x-2 h-[120px]">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>{t('dashboard.loadingPumpStatus')}</span>
                </div>
              ) : pumpStatusError ? (
                <div className="text-center text-xs sm:text-sm text-red-400 h-[120px] flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{t('dashboard.pumpError')}{pumpStatusError}</span>
                </div>
              ) : totalPumps > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">{t('dashboard.totalRegisteredPumps')}</span>
                    <Badge variant="secondary">{totalPumps}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">{t('dashboard.operatingPumps')}</span>
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {activePumps}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">{t('dashboard.nonOperatingPumps')}</span>
                    <Badge variant="danger">
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {inactivePumps}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">{t('dashboard.needingMaintenance')}</span>
                    <Badge variant="warning">
                      <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {pumpsNeedingMaintenance}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center text-xs sm:text-sm text-muted-foreground h-[120px] flex items-center justify-center">
                  <span>{t('dashboard.selectRegionForPumps')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">{t('dashboard.recentActivity')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* MENAMPILKAN DATA TINGGI MUKA AIR DARI PUPR */}
                {loadingWaterLevel && (
                  <div className="text-center text-sm text-muted-foreground flex items-center justify-center space-x-2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span>{t('dashboard.loadingWaterLevel')}</span>
                  </div>
                )}
                {waterLevelError && (
                  <div className="text-center text-sm text-red-400">
                    {t('dashboard.waterLevelError')}{waterLevelError}
                  </div>
                )}
                {!loadingWaterLevel &&
                  !waterLevelError &&
                  waterLevelPosts.length > 0 ? (
                  waterLevelPosts.slice(0, 3).map(
                    (
                      post, // Tampilkan hingga 3 pos TMA terdekat
                    ) => (
                      <div
                        key={post.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />{' '}
                        {/* Warna biru untuk TMA */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {t('dashboard.waterLevel')} {post.name}: {post.water_level || 'N/A'}{' '}
                            {post.unit || 'm'}
                            {post.status && ` (${getStatusLabel(post.status)})`}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            {post.timestamp
                              ? getTimeAgo(new Date(post.timestamp), lang)
                              : t('dashboard.timeUnavailable')}
                          </p>
                        </div>
                        {post.status && (
                          <Badge
                            variant={
                              post.status.toLowerCase().includes('awas')
                                ? 'danger'
                                : post.status.toLowerCase().includes('siaga')
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {getStatusLabel(post.status)}
                          </Badge>
                        )}
                      </div>
                    ),
                  )
                ) : !loadingWaterLevel &&
                  !waterLevelError &&
                  waterLevelPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    {t('dashboard.selectRegionForWaterLevel')}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
