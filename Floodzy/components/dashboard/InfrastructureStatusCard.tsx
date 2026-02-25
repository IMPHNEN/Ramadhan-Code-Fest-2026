'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Zap, Clock, ShieldCheck, ShieldAlert, Shield, Activity, TrendingUp, AlertTriangle, ChevronsUpDown, Search, CircleDot, CircleOff, Wrench, XCircle, MapPin, Droplets, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WaterLevelPost, PumpData } from '@/lib/api';
import { getTimeAgo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/src/context/LanguageContext';
// Removed Table components as we are using CSS Grid for layout
import { useVirtualizer } from '@tanstack/react-virtual';

// Props interface
interface InfrastructureStatusCardProps {
  waterLevelPosts: WaterLevelPost[];
  pumpStatusData: PumpData[];
}

// Helper functions
const getBadgeVariant = (status: string) => {
  if (!status) return 'default';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('online') || lowerStatus.includes('normal')) {
    return 'success'; // Hijau
  }
  if (lowerStatus.includes('offline') || lowerStatus.includes('siaga i')) {
    return 'destructive'; // Merah
  }
  if (lowerStatus.includes('maintenance') || lowerStatus.includes('warning') || lowerStatus.includes('siaga ii')) {
    return 'warning'; // Kuning
  }
  if (lowerStatus.includes('siaga iii')) {
    return 'secondary'; // Abu-abu
  }
  return 'default'; // Warna default jika tidak ada yang cocok
};

const getStatusIcon = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('online') || lowerStatus.includes('aktif')) return <CircleDot className="h-3 w-3 text-emerald-500" />;
  if (lowerStatus.includes('offline')) return <CircleOff className="h-3 w-3 text-red-500" />;
  if (lowerStatus.includes('maintenance')) return <Wrench className="h-3 w-3 text-amber-500" />;
  return null;
};

const getWaterLevelIcon = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('bahaya') || lowerStatus.includes('awas')) {
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  }
  if (lowerStatus.includes('siaga') || lowerStatus.includes('waspada')) {
    return <TrendingUp className="h-5 w-5 text-amber-400" />;
  }
  return <Waves className="h-5 w-5 text-blue-400" />;
};

const getPumpStatusIcon = (status: string = '') => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'aktif') return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
  if (lowerStatus === 'siaga') return <ShieldAlert className="h-4 w-4 text-amber-500" />;
  return <Shield className="h-4 w-4 text-gray-500" />;
};

const DetailPopup = ({ item, onClose }: { item: WaterLevelPost | PumpData, onClose: () => void }) => {
  const isWaterLevel = 'water_level' in item;

  let title: string;
  let lastUpdated: string;

  const { t, lang } = useLanguage();

  if (isWaterLevel) {
    title = item.name;
    lastUpdated = getTimeAgo(item.timestamp || new Date().toISOString(), lang); // Provide default for timestamp
  } else {
    title = (item as PumpData).nama_infrastruktur;
    lastUpdated = getTimeAgo(new Date((item as PumpData).updated_at || new Date().getTime()), lang); // Use updated_at for PumpData
  }

  const details = isWaterLevel
    ? [
      { label: "Tinggi Air", value: `${item.water_level} ${item.unit}`, icon: <Waves className="w-4 h-4 text-slate-400" /> },
      { label: t('infrastructure.status'), value: item.status, icon: <ShieldCheck className="w-4 h-4 text-slate-400" /> },
      { label: "ID Sensor", value: item.id, icon: <Info className="w-4 h-4 text-slate-400" /> },
    ]
    : [
      { label: t('infrastructure.location'), value: (item as PumpData).lokasi || 'N/A', icon: <MapPin className="w-4 h-4 text-slate-400" /> },
      { label: t('infrastructure.pumpSystemStatus'), value: (item as PumpData).kondisi_bangunan, icon: <ShieldCheck className="w-4 h-4 text-slate-400" /> },
      { label: "Kapasitas", value: `${(item as PumpData).kapasitas_liter_per_detik} L/detik`, icon: <Droplets className="w-4 h-4 text-slate-400" /> },
      { label: "ID Pompa", value: (item as PumpData).id, icon: <Info className="w-4 h-4 text-slate-400" /> },
    ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isWaterLevel ? 'bg-sky-500/10 dark:bg-sky-500/20' : 'bg-amber-500/10 dark:bg-amber-500/20'}`}>
            {isWaterLevel ? <Waves className="h-8 w-8 text-sky-500 dark:text-sky-400" /> : <Zap className="h-8 w-8 text-amber-500 dark:text-amber-400" />}
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isWaterLevel ? 'Pos Pantau TMA' : 'Rumah Pompa'}</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/80">
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Main Details Card */}
      <Card className="bg-slate-100 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
            {details.map(({ label, value, icon }) => (
              <div key={label} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors">
                <div className="text-slate-600 dark:text-slate-400 mt-1">{icon}</div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  {label === 'Status' || label === 'Status Pompa' ? (
                    <Badge variant={getBadgeVariant(value)} className="mt-1">{value}</Badge>
                  ) : (
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <p>Update Terakhir: {lastUpdated}</p>
      </div>
    </div>
  );
};

// Main component with new layout
export function InfrastructureStatusCard({ waterLevelPosts, pumpStatusData }: InfrastructureStatusCardProps) {
  const { t, lang } = useLanguage();
  // State for popup/modal
  const [selectedItem, setSelectedItem] = useState<WaterLevelPost | PumpData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // State for Water Level section
  const [waterLevelSearchTerm, setWaterLevelSearchTerm] = useState('');
  const [isWaterLevelExpanded, setIsWaterLevelExpanded] = useState(true);

  // State for Pump Status section
  const [pumpSearchTerm, setPumpSearchTerm] = useState('');
  const [isPumpExpanded, setIsPumpExpanded] = useState(true);

  // Filtered data for Water Level
  const filteredWaterLevelPosts = waterLevelPosts.filter(post =>
    post.name.toLowerCase().includes(waterLevelSearchTerm.toLowerCase()) ||
    post.status?.toLowerCase().includes(waterLevelSearchTerm.toLowerCase())
  );

  // Filtered data for Pump Status
  const filteredPumpData = pumpStatusData.filter(pump =>
    pump.nama_infrastruktur.toLowerCase().includes(pumpSearchTerm.toLowerCase()) ||
    pump.kondisi_bangunan?.toLowerCase().includes(pumpSearchTerm.toLowerCase()) ||
    pump.lokasi?.toLowerCase().includes(pumpSearchTerm.toLowerCase()) // Added location search
  );

  // Virtualizer for Water Level Table
  const waterLevelParentRef = useRef<HTMLDivElement>(null);
  const waterLevelRowVirtualizer = useVirtualizer({
    count: filteredWaterLevelPosts.length,
    getScrollElement: () => waterLevelParentRef.current,
    estimateSize: () => 48, // Estimate row height in pixels
    overscan: 5, // Render 5 items above and below the visible area
  });

  // Virtualizer for Pump Status Table
  const pumpParentRef = useRef<HTMLDivElement>(null);
  const pumpRowVirtualizer = useVirtualizer({
    count: filteredPumpData.length,
    getScrollElement: () => pumpParentRef.current,
    estimateSize: () => 48, // Estimate row height in pixels
    overscan: 5, // Render 5 items above and below the visible area
  });

  const handleItemClick = (item: WaterLevelPost | PumpData) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  if (!waterLevelPosts || !pumpStatusData) {
    return null;
  }

  const collapsibleContentVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto", transition: { opacity: { duration: 0.3 }, height: { duration: 0.4 } } },
    exit: { opacity: 0, height: 0, transition: { opacity: { duration: 0.2 }, height: { duration: 0.3 } } },
  };

  return (
    <>
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm dark:shadow-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('infrastructure.criticalInfrastructure')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('infrastructure.clickDetail')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">{t('infrastructure.liveData')}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left Column: Water Level */}
            <Collapsible open={isWaterLevelExpanded} onOpenChange={setIsWaterLevelExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 cursor-pointer transition-colors border border-slate-300 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Waves className="h-6 w-6 text-sky-500 dark:text-sky-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('infrastructure.viewWaterLevel')}</h3>
                  </div>
                  <ChevronsUpDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
              </CollapsibleTrigger>
              <AnimatePresence>
                {isWaterLevelExpanded && (
                  <motion.div
                    key="water-level-content"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={collapsibleContentVariants}
                    className="overflow-hidden"
                  >
                    <CollapsibleContent className="pt-4">
                      <div className="mt-4 flex flex-col">
                        <div className="relative mb-4">
                          <Input
                            placeholder={t('infrastructure.searchWaterPost')}
                            value={waterLevelSearchTerm}
                            onChange={(e) => setWaterLevelSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        <div className="grid grid-cols-4 gap-4 px-2 pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                          <div className="whitespace-nowrap">{t('infrastructure.station')}</div>
                          <div className="whitespace-nowrap">{t('infrastructure.height')}</div>
                          <div className="whitespace-nowrap">{t('infrastructure.status')}</div>
                          <div className="whitespace-nowrap">{t('infrastructure.lastUpdate')}</div>
                        </div>
                        <div
                          ref={waterLevelParentRef}
                          className="w-full h-[250px] overflow-y-auto custom-scrollbar rounded-lg border border-slate-200 dark:border-slate-700/50"
                        >
                          <div
                            style={{
                              height: `${waterLevelRowVirtualizer.getTotalSize()}px`,
                              width: '100%',
                              position: 'relative',
                            }}
                          >
                            {waterLevelRowVirtualizer.getVirtualItems().map((virtualItem) => {
                              const post = filteredWaterLevelPosts[virtualItem.index];
                              return (
                                <div
                                  key={virtualItem.key}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                  }}
                                  className="grid grid-cols-4 items-center gap-4 p-2 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                  onClick={() => handleItemClick(post)}
                                >
                                  <span className="font-medium text-slate-900 dark:text-white whitespace-nowrap truncate">{post.name}</span>
                                  <span className="text-slate-700 dark:text-white whitespace-nowrap truncate">{post.water_level} {post.unit}</span>
                                  <div className="whitespace-nowrap">
                                    <Badge variant={getBadgeVariant(post.status)} className="flex items-center gap-1">
                                      {getStatusIcon(post.status)} {post.status}
                                    </Badge>
                                  </div>
                                  <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap truncate">{getTimeAgo(post.timestamp, lang)}</span>
                                </div>
                              );
                            })}
                            {filteredWaterLevelPosts.length === 0 && (
                              <div className="grid grid-cols-4 text-center text-slate-500 dark:text-slate-400 py-4">
                                <div className="col-span-4 flex flex-col items-center justify-center">
                                  <Search className="h-6 w-6 mb-2" />
                                  {t('dashboard.selectRegionForWaterLevel')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Collapsible>

            {/* Right Column: Pump Status */}
            <Collapsible open={isPumpExpanded} onOpenChange={setIsPumpExpanded}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 cursor-pointer transition-colors border border-slate-300 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('infrastructure.viewPumpStatus')}</h3>
                  </div>
                  <ChevronsUpDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
              </CollapsibleTrigger>
              <AnimatePresence>
                {isPumpExpanded && (
                  <motion.div
                    key="pump-status-content"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={collapsibleContentVariants}
                    className="overflow-hidden"
                  >
                    <CollapsibleContent className="pt-4">
                      <div className="mt-4 flex flex-col">
                        <div className="relative mb-4">
                          <Input
                            placeholder={t('infrastructure.searchPump')}
                            value={pumpSearchTerm}
                            onChange={(e) => setPumpSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 px-2 pb-2 text-sm font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                          <div className="whitespace-nowrap">{t('infrastructure.pumpName')}</div>
                          <div className="whitespace-nowrap">{t('infrastructure.location')}</div>
                          <div className="whitespace-nowrap">{t('infrastructure.status')}</div>
                        </div>
                        <div
                          ref={pumpParentRef}
                          className="w-full h-[250px] overflow-y-auto custom-scrollbar rounded-lg border border-slate-200 dark:border-slate-700/50"
                        >
                          <div
                            style={{
                              height: `${pumpRowVirtualizer.getTotalSize()}px`,
                              width: '100%',
                              position: 'relative',
                            }}
                          >
                            {pumpRowVirtualizer.getVirtualItems().map((virtualItem) => {
                              const pump = filteredPumpData[virtualItem.index];
                              return (
                                <div
                                  key={virtualItem.key}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                  }}
                                  className="grid grid-cols-3 items-center gap-4 p-2 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                  onClick={() => handleItemClick(pump)}
                                >
                                  <span className="font-medium text-slate-900 dark:text-white whitespace-nowrap truncate">{pump.nama_infrastruktur}</span>
                                  <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap truncate">{pump.lokasi || 'N/A'}</span>
                                  <div className="whitespace-nowrap">
                                    <Badge variant={getBadgeVariant(pump.kondisi_bangunan)} className="flex items-center gap-1">
                                      {getStatusIcon(pump.kondisi_bangunan)} {pump.kondisi_bangunan || 'Tidak Diketahui'}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                            {filteredPumpData.length === 0 && (
                              <div className="grid grid-cols-3 text-center text-slate-500 dark:text-slate-400 py-4">
                                <div className="col-span-3 flex flex-col items-center justify-center">
                                  <Search className="h-6 w-6 mb-2" />
                                  {t('dashboard.selectRegionForPumps')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Collapsible>

          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('infrastructure.monitoredWaterPosts')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{waterLevelPosts.length}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('infrastructure.totalRegistered')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pumpStatusData.length}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">{pumpStatusData.filter(p => p.kondisi_bangunan?.toLowerCase() === 'aktif').length}</p>
                <div className="text-sm text-slate-500 dark:text-slate-400">{t('infrastructure.active')}</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('landing.floodZones')}</p>
                <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{waterLevelPosts.filter(p => p.status?.toLowerCase().includes('siaga')).length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isDetailOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setIsDetailOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >

              <DetailPopup item={selectedItem} onClose={() => setIsDetailOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  );
}