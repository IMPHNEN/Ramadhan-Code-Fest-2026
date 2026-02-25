'use client';

import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Home,
  Phone,
  ExternalLink,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Navigation,
  Shield,
  Clock,
  AlertTriangle,
  Droplets,
  Zap,
  HeartPulse,
} from 'lucide-react';
import { EvacuationLocation } from '@/types'; // Pastikan tipe ini diperbarui di types/index.ts
import dynamic from 'next/dynamic';
import { useLanguage } from '@/src/context/LanguageContext';

// Dynamic imports for Leaflet components to avoid SSR issues
const MapContainer = dynamic<any>(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic<any>(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic<any>(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic<any>(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false },
);

const DEFAULT_MAP_CENTER: [number, number] = [-6.2088, 106.8456]; // Jakarta
const DEFAULT_MAP_ZOOM = 10;

export default function InfoEvakuasiPage() {
  const { t, lang } = useLanguage();
  const [evacuationLocations, setEvacuationLocations] = useState<EvacuationLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<EvacuationLocation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [L, setL] = useState<any>(null);
  const [evacuationIcon, setEvacuationIcon] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then(leaflet => {
      // The leaflet object could be the L namespace directly,
      // or it could be a module object with a .default property.
      // Let's handle both cases.
      const L = (leaflet.default || leaflet) as any;

      setL(L);
      setEvacuationIcon(
        new L.Icon({
          iconUrl: '/assets/evacuation_marker.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
      );
    });

    const fetchEvacuationLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/evakuasi');
        if (!response.ok) {
          throw new Error(`Gagal mengambil data: ${response.statusText}`);
        }
        const data: EvacuationLocation[] = await response.json();
        setEvacuationLocations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvacuationLocations();
  }, []);

  const handleLocationClick = (location: EvacuationLocation) => {
    setSelectedLocation(location);
    setIsDialogOpen(true);
  };

  const openGoogleMaps = (lat: number, lon: number) => {
    window.open(`http://googleusercontent.com/maps.google.com/2{lat},${lon}`, '_blank');
  };

  const getStatusColor = (location: EvacuationLocation) => {
    const percentage = (location.capacity_current / location.capacity_total) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-orange-400';
    return 'text-green-400';
  };

  const getStatusBadge = (location: EvacuationLocation) => {
    const percentage = (location.capacity_current / location.capacity_total) * 100;
    if (percentage >= 100) return { text: t('evacuationInfo.status.full'), color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (percentage >= 70) return { text: t('evacuationInfo.status.almostFull'), color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { text: t('evacuationInfo.status.available'), color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const getOperationalStatusBadge = (status: string) => {
    // Basic mapping based on Indonesian string content, ideally the backend returns a code
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('buka') || lowerStatus.includes('open')) {
      return { text: t('evacuationInfo.status.open'), color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle className="w-4 h-4" /> };
    }
    if (lowerStatus.includes('penuh') || lowerStatus.includes('full')) {
      return { text: t('evacuationInfo.status.full'), color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-4 h-4" /> };
    }
    if (lowerStatus.includes('tutup') || lowerStatus.includes('closed')) {
      return { text: t('evacuationInfo.status.closed'), color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <AlertTriangle className="w-4 h-4" /> };
    }
    return { text: t('evacuationInfo.status.na'), color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <Info className="w-4 h-4" /> };
  };

  const getServiceIcon = (serviceKey: string, status: string) => {
    // "Tersedia" is usually hardcoded in API response for now, adjusting logic to be safer
    const isAvailable = status.toLowerCase().includes("tersedia") || status.toLowerCase().includes("available");
    const color = isAvailable ? "text-green-400" : "text-red-400";

    switch (serviceKey) {
      case 'clean_water': return <Droplets className={`w-5 h-5 ${color}`} />;
      case 'electricity': return <Zap className={`w-5 h-5 ${color}`} />;
      case 'medical_support': return <HeartPulse className={`w-5 h-5 ${color}`} />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  // KOMPONEN BARU: Untuk menampilkan legenda status kapasitas
  const StatusLegend = () => (
    <div className="bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/30 rounded-lg p-3 mb-4 text-xs">
      <h5 className="font-semibold text-slate-900 dark:text-white mb-2">{t('evacuationInfo.list.legendTitle')}</h5>
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 border border-slate-300 dark:border-slate-400/50" />
          <span className="text-slate-600 dark:text-slate-300">{t('evacuationInfo.list.legendAvailable')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0 border border-slate-300 dark:border-slate-400/50" />
          <span className="text-slate-600 dark:text-slate-300">{t('evacuationInfo.list.legendAlmostFull')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0 border border-slate-300 dark:border-slate-400/50" />
          <span className="text-slate-600 dark:text-slate-300">{t('evacuationInfo.list.legendFull')}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 dark:border-cyan-400/30 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-900 dark:text-white">{t('evacuationInfo.loading.title')}</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{t('evacuationInfo.loading.subtitle')}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-xl font-medium text-slate-900 dark:text-white mb-2">{t('evacuationInfo.error.title')}</p>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <p className="text-slate-500 dark:text-slate-400">{t('evacuationInfo.error.retry')}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-600 dark:text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Floodzie</h1>
            <p className="text-cyan-600 dark:text-cyan-400 text-sm">{t('evacuationInfo.title')}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center"><Home className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{evacuationLocations.length}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('evacuationInfo.stats.totalLocations')}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{evacuationLocations.reduce((acc, loc) => acc + (loc.capacity_total - loc.capacity_current), 0)}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('evacuationInfo.stats.remainingCapacity')}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{evacuationLocations.filter((loc) => (loc.capacity_current / loc.capacity_total) >= 0.7).length}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('evacuationInfo.stats.almostFull')}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">Live</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{t('evacuationInfo.stats.liveUpdate')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('evacuationInfo.map.title')}</h3>
            </div>
            <div className="h-[520px] w-full rounded-lg overflow-hidden border border-slate-600/30">
              {L && evacuationIcon && (
                <MapContainer center={DEFAULT_MAP_CENTER} zoom={DEFAULT_MAP_ZOOM} scrollWheelZoom={true} className="h-full w-full">
                  <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  {evacuationLocations.map((loc) => (
                    <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={evacuationIcon} eventHandlers={{ click: () => handleLocationClick(loc) }}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{loc.name}</p>
                          <button onClick={() => handleLocationClick(loc)} className="text-cyan-500 hover:underline mt-1">{t('evacuationInfo.map.viewDetail')}</button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>
        </motion.div>

        {/* List Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('evacuationInfo.list.title')}</h3>
            </div>

            <StatusLegend />

            {evacuationLocations.length === 0 && !loading ? (
              <p className="text-slate-400 text-center py-8">{t('evacuationInfo.list.noData')}</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {evacuationLocations.map((loc, index) => {
                  const statusBadge = getStatusBadge(loc);
                  return (
                    <motion.div key={loc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}>
                      <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/30 rounded-lg p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-all group" onClick={() => handleLocationClick(loc)}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{loc.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs border ${statusBadge.color}`}>{statusBadge.text}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{loc.address}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span className={`text-xs ${getStatusColor(loc)}`}>{loc.capacity_current}/{loc.capacity_total}</span>
                          </div>
                          <Navigation className="w-3 h-3 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Location Detail Modal */}
      <AnimatePresence>
        {isDialogOpen && selectedLocation && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600/50 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedLocation.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedLocation.address}</p>
                  </div>
                  <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                        <span className="text-slate-900 dark:text-white font-medium">{t('evacuationInfo.details.operationalStatus')}</span>
                      </div>
                      {selectedLocation.operational_status && (
                        <span className={`px-3 py-1 rounded-full text-sm border flex items-center gap-1.5 ${getOperationalStatusBadge(selectedLocation.operational_status).color}`}>
                          {getOperationalStatusBadge(selectedLocation.operational_status).icon}
                          {getOperationalStatusBadge(selectedLocation.operational_status).text}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="text-slate-900 dark:text-white font-medium">{t('evacuationInfo.details.capacity')}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusBadge(selectedLocation).color}`}>
                        {getStatusBadge(selectedLocation).text}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{t('evacuationInfo.details.filled')}:</span>
                      <span className="text-slate-900 dark:text-white font-medium">{selectedLocation.capacity_current} / {selectedLocation.capacity_total}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all" style={{ width: `${(selectedLocation.capacity_current / selectedLocation.capacity_total) * 100}%` }} />
                    </div>
                  </div>

                  {selectedLocation.essential_services && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600/30">
                      <h4 className="text-slate-900 dark:text-white font-medium mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-green-500 dark:text-green-400" />
                        {t('evacuationInfo.details.essentialServices')}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(selectedLocation.essential_services).map(([key, value]) => (
                          <div key={key} className="bg-white dark:bg-slate-600/50 border border-slate-200 dark:border-slate-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                            {getServiceIcon(key, value as string)}
                            <span className="text-slate-700 dark:text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLocation.facilities && selectedLocation.facilities.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600/30">
                      <h4 className="text-slate-900 dark:text-white font-medium mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        {t('evacuationInfo.details.facilities')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocation.facilities.map((facility, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-600/50 border border-slate-200 dark:border-slate-500/30 rounded-full px-3 py-1">
                            <span className="text-slate-700 dark:text-slate-300 text-xs">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3 border border-slate-200 dark:border-slate-600/30">
                    <h4 className="text-slate-900 dark:text-white font-medium mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                      {t('evacuationInfo.details.contactInfo')}
                    </h4>
                    {selectedLocation.contact_person && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{t('evacuationInfo.details.contactPerson')}:</span>
                        <span className="text-slate-900 dark:text-white">{selectedLocation.contact_person}</span>
                      </div>
                    )}
                    {selectedLocation.contact_phone && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{t('evacuationInfo.details.phone')}:</span>
                        <a href={`tel:${selectedLocation.contact_phone}`} className="text-cyan-400 hover:text-cyan-300 transition-colors">{selectedLocation.contact_phone}</a>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50 space-y-2">
                      {selectedLocation.last_updated && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{t('evacuationInfo.details.lastUpdated')}:</span>
                          <span className="text-slate-500 dark:text-slate-400">{new Date(selectedLocation.last_updated).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      {selectedLocation.verified_by && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{t('evacuationInfo.details.verifiedBy')}:</span>
                          <span className="text-slate-900 dark:text-white font-medium">{selectedLocation.verified_by}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={() => openGoogleMaps(selectedLocation.latitude, selectedLocation.longitude)} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    {t('evacuationInfo.details.navigate')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}