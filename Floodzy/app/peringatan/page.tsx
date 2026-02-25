'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Loader2,
  ChevronRight,
  TrendingUp,
  Droplets,
  Eye,
  Users,
  Shield,
  ChevronLeft,
  Newspaper,
  MessageSquare,
} from 'lucide-react';

import { useLanguage } from '@/src/context/LanguageContext';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface Alert {
  id: string;
  level: 'low' | 'medium' | 'high';
  location: string;
  timestamp: string;
  reason: string;
  details?: string;
  affectedAreas?: string[];
  estimatedPopulation?: number;
  severity?: number;
}

interface NewsReport {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  timestamp: string;
}

// --- MOCK DATA POOL ---
const allMockAlerts: Alert[] = [
  { id: 'alert-1', level: 'high', location: 'Bendung Katulampa', timestamp: '10:30', reason: 'TMA (Tinggi Muka Air) terpantau 210 cm (Siaga 1), tren naik.', severity: 9, affectedAreas: ['Rawajati', 'Cawang', 'Bidara Cina'], estimatedPopulation: 14850 },
  { id: 'alert-2', level: 'medium', location: 'Pintu Air Manggarai', timestamp: '10:28', reason: 'Ketinggian air 850 cm (Siaga 3), debit air meningkat dari arah Depok.', severity: 7, affectedAreas: ['Bukit Duri', 'Kampung Melayu', 'Grogol'], estimatedPopulation: 8230 },
  { id: 'alert-3', level: 'low', location: 'Pos Angke Hulu', timestamp: '10:25', reason: 'TMA 150 cm (Siaga 4), kondisi saat ini masih terpantau normal.', severity: 4, affectedAreas: ['Cengkareng', 'Kembangan', 'Pesing'], estimatedPopulation: 2477 },
  { id: 'alert-4', level: 'medium', location: 'Kali Sunter', timestamp: '10:20', reason: 'Terjadi kenaikan debit air signifikan pasca hujan lokal di area hulu.', severity: 6, affectedAreas: ['Kelapa Gading Barat', 'Sunter Jaya'], estimatedPopulation: 6150 },
  { id: 'alert-5', level: 'high', location: 'Waduk Pluit', timestamp: '10:15', reason: 'Pompa air diaktifkan untuk mengurangi volume air kiriman dari BKB.', severity: 8, affectedAreas: ['Penjaringan', 'Muara Angke', 'Kapuk Muara'], estimatedPopulation: 11780 },
  { id: 'alert-6', level: 'low', location: 'Cipinang Hulu', timestamp: '10:10', reason: 'Aliran deras namun masih dalam batas aman, tinggi air 130 cm.', severity: 3, affectedAreas: ['Makasar', 'Cipinang Melayu'], estimatedPopulation: 1520 },
  { id: 'alert-7', level: 'high', location: 'Kali Krukut', timestamp: '10:05', reason: 'Luapan air mulai menggenangi Jalan Kemang Raya, lalu lintas terganggu.', severity: 9, affectedAreas: ['Kemang', 'Cipete Selatan', 'Pela Mampang'], estimatedPopulation: 11240 },
  { id: 'alert-8', level: 'medium', location: 'Pesanggrahan', timestamp: '10:00', reason: 'Ketinggian air naik 50cm dalam 1 jam terakhir, warga diimbau waspada.', severity: 7, affectedAreas: ['Bintaro', 'Cipulir', 'Ulujami'], estimatedPopulation: 7490 },
  { id: 'alert-9', level: 'high', location: 'Jembatan Ciliwung Depok', timestamp: '09:55', reason: 'Hujan deras di area hulu, debit Ciliwung naik tajam ke level Siaga 2.', severity: 8, affectedAreas: ['Pondok Cina', 'Margonda', 'Beji'], estimatedPopulation: 9300 },
  { id: 'alert-10', level: 'low', location: 'Kali Bekasi', timestamp: '09:50', reason: 'Status Siaga 4, TMA 310 cm. Kondisi masih aman terkendali.', severity: 2, affectedAreas: ['Bekasi Barat', 'Bekasi Timur'], estimatedPopulation: 3100 },
  { id: 'alert-11', level: 'medium', location: 'Sungai Cisadane, Tangerang', timestamp: '09:45', reason: 'Cisadane meluap di beberapa titik, terutama di area dataran rendah.', severity: 6, affectedAreas: ['Cikokol', 'Karawaci', 'Batuceper'], estimatedPopulation: 5650 },
  { id: 'alert-12', level: 'high', location: 'Puncak, Bogor', timestamp: '09:40', reason: 'Peringatan dini dari BMKG: potensi hujan badai dan longsor.', severity: 9, affectedAreas: ['Cisarua', 'Gadog', 'Ciawi'], estimatedPopulation: 10500 },
  { id: 'alert-13', level: 'medium', location: 'Kali Grogol', timestamp: '09:35', reason: 'Ketinggian air waspada (Siaga 3), potensi genangan di underpass.', severity: 7, affectedAreas: ['Grogol', 'Petamburan', 'Jelambar'], estimatedPopulation: 8450 },
  { id: 'alert-14', level: 'low', location: 'Kali Item', timestamp: '09:30', reason: 'Aliran terpantau normal, tidak ada kenaikan signifikan. TMA 80 cm.', severity: 3, affectedAreas: ['Senen', 'Johar Baru', 'Kemayoran'], estimatedPopulation: 2150 },
  { id: 'alert-15', level: 'high', location: 'Banjir Kanal Barat', timestamp: '09:25', reason: 'Pintu air Karet dibuka untuk mengalirkan debit ke laut. Siaga 2.', severity: 8, affectedAreas: ['Tanah Abang', 'Roxy', 'Petojo'], estimatedPopulation: 13200 },
];

const fetchNewsAndReports = async (): Promise<NewsReport[]> => {
  const now = new Date();
  return [
    { id: 'news-1', title: 'Banjir Jakarta: Ketinggian Air Terus Meningkat', content: '...', source: 'Detik News', url: 'https://news.detik.com/', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'news-2', title: 'Gempa Bumi Magnitudo 5.2 Guncang Malang', content: '...', source: 'Kompas.com', url: 'https://www.kompas.com/', timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'news-3', title: 'Peringatan Dini Cuaca Ekstrem di Sumatera Barat', content: '...', source: 'Antara News', url: 'https://www.antaranews.com/', timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString() },
    { id: 'news-4', title: 'Debit Air Sungai Ciliwung Mencapai Siaga 3', content: '...', source: 'Tempo', url: 'https://www.tempo.co/', timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() },
  ];
};

export default function PeringatanPage() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<Alert[]>(() => allMockAlerts.slice(0, 8));
  const [newsReports, setNewsReports] = useState<NewsReport[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [geminiNewsSummary, setGeminiNewsSummary] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  // Real-time alert simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(currentAlerts => {
        const newAlerts = [...currentAlerts];
        const numToReplace = Math.floor(Math.random() * 2) + 2; // Replace 2-3 items

        for (let i = 0; i < numToReplace; i++) {
          const randomIndex = Math.floor(Math.random() * newAlerts.length);
          let newAlert;
          do {
            newAlert = allMockAlerts[Math.floor(Math.random() * allMockAlerts.length)];
          } while (newAlerts.some(a => a.id === newAlert.id)); // Ensure it's a new alert

          newAlerts[randomIndex] = { ...newAlert, timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
        }
        return newAlerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      });
    }, 60000); // Update every 1 minute

    return () => clearInterval(interval);
  }, []);

  const fetchAndSummarizeNews = useCallback(async () => {
    setIsNewsLoading(true);
    setNewsError(null);
    setGeminiNewsSummary({});
    try {
      const reports = await fetchNewsAndReports();
      setNewsReports(reports);
      // Mock summary
      const summaries = reports.reduce((acc, report) => {
        acc[report.id] = t('warnings.summaryTemplate').replace('{title}', report.title);
        return acc;
      }, {} as { [key: string]: string });
      setGeminiNewsSummary(summaries);
    } catch (err: any) {
      setNewsError(err.message || t('warnings.errorNews'));
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSummarizeNews();
    const newsIntervalId = setInterval(fetchAndSummarizeNews, 60000 * 5);
    return () => clearInterval(newsIntervalId);
  }, [fetchAndSummarizeNews]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      case 'medium': return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20';
      case 'low': return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
      default: return 'text-slate-700 dark:text-gray-400 bg-slate-100 dark:bg-gray-500/10 border-slate-200 dark:border-gray-500/20';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Info className="h-5 w-5" />;
      case 'low': return <Bell className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const fetchGeminiExplanation = async (alert: Alert) => {
    setIsLoading(true);
    setError(null);
    setGeminiExplanation(null);
    setSelectedAlert(alert);
    setSelectedAlert(alert);
    setTimeout(() => {
      setGeminiExplanation(t('warnings.analysisResult')
        .replace('{location}', alert.location)
        .replace('{reason}', alert.reason)
        .replace('{areas}', alert.affectedAreas?.join(', ') || ''));
      setIsLoading(false);
    }, 1500);
  };

  const totalAlerts = alerts.length;
  const highAlerts = React.useMemo(() => alerts.filter((a) => a.level === 'high').length, [alerts]);
  const mediumAlerts = React.useMemo(() => alerts.filter((a) => a.level === 'medium').length, [alerts]);
  const lowAlerts = React.useMemo(() => alerts.filter((a) => a.level === 'low').length, [alerts]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 h-10 w-10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{t('warnings.title')}</h2>
            <p className="text-slate-500 dark:text-gray-400">{t('warnings.subtitle')}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-sm">{t('warnings.totalAlerts')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAlerts}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-lg"><Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
            </div>
            <div className="mt-4 flex items-center text-sm"><TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" /><span className="text-green-600 dark:text-green-400">{t('warnings.active')}</span></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-sm">{t('warnings.highLevel')}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highAlerts}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-500/10 p-3 rounded-lg"><AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
            </div>
            <div className="mt-4 flex items-center text-sm"><span className="text-red-600 dark:text-red-400">{t('warnings.immediateAction')}</span></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-sm">{t('warnings.mediumLevel')}</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{mediumAlerts}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-500/10 p-3 rounded-lg"><Info className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div>
            </div>
            <div className="mt-4 flex items-center text-sm"><span className="text-yellow-600 dark:text-yellow-400">{t('warnings.monitorConstantly')}</span></div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-gray-400 text-sm">{t('warnings.lowLevel')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{lowAlerts}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-500/10 p-3 rounded-lg"><Bell className="h-6 w-6 text-green-600 dark:text-green-400" /></div>
            </div>
            <div className="mt-4 flex items-center text-sm"><span className="text-green-600 dark:text-green-400">{t('warnings.stableCondition')}</span></div>
          </motion.div>
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 p-1">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-gray-400"><Bell className="w-4 h-4 mr-2" /> {t('warnings.alertsTab')}</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-gray-400"><Newspaper className="w-4 h-4 mr-2" /> {t('warnings.newsTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <AnimatePresence>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 ${selectedAlert?.id === alert.id ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'shadow-sm'
                      }`}
                    onClick={() => fetchGeminiExplanation(alert)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getLevelColor(alert.level)}`}>
                        {getLevelIcon(alert.level)}
                        <span className="text-sm font-medium">{t(`common.levels.${alert.level}`)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500 dark:text-gray-400 text-sm"><Clock className="h-4 w-4" /><span>{alert.timestamp}</span></div>
                    </div>
                    <div className="flex items-center space-x-2 mb-3"><MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400" /><h3 className="text-lg font-semibold text-slate-900 dark:text-white">{alert.location}</h3></div>
                    <p className="text-slate-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{alert.reason}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-100 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1"><Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /><span className="text-xs text-slate-500 dark:text-gray-400">{t('warnings.affected')}</span></div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{alert.estimatedPopulation?.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="bg-slate-100 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1"><Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /><span className="text-xs text-slate-500 dark:text-gray-400">{t('warnings.severity')}</span></div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{alert.severity}/10</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">{t('warnings.affectedRegions')}</p>
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedAreas?.slice(0, 3).map((area, areaIndex) => (<span key={areaIndex} className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 text-xs px-2 py-1 rounded">{area}</span>))}
                        {alert.affectedAreas && alert.affectedAreas.length > 3 && (<span className="text-xs text-slate-500 dark:text-gray-400">+{alert.affectedAreas.length - 3} {t('warnings.others')}</span>)}
                      </div>
                    </div>
                    <button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      onClick={(e) => { e.stopPropagation(); fetchGeminiExplanation(alert); }}
                      disabled={isLoading && selectedAlert?.id === alert.id}
                    >
                      {isLoading && selectedAlert?.id === alert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                      <span>{t('warnings.viewDetail')}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {selectedAlert && (
              <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('warnings.detailTitle')}: {selectedAlert.location}</h3>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getLevelColor(selectedAlert.level)}`}>
                    {getLevelIcon(selectedAlert.level)}
                    <span className="font-medium">{t(`common.levels.${selectedAlert.level}`)}</span>
                  </div>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
                      <p className="text-lg text-slate-600 dark:text-gray-300">{t('warnings.loadingAnalysis')}</p>
                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">{t('warnings.analyzingData')}</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2"><AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /><span className="text-red-600 dark:text-red-400 font-medium">{t('warnings.error')}</span></div>
                    <p className="text-red-800 dark:text-red-300">{error}</p>
                  </div>
                ) : geminiExplanation ? (
                  <div className="bg-slate-50 dark:bg-gray-700/50 rounded-lg p-6">
                    <div className="prose prose-invert max-w-none"><div className="whitespace-pre-line text-slate-700 dark:text-gray-200 leading-relaxed">{geminiExplanation}</div></div>
                  </div>
                ) : (
                  <div className="text-center py-8"><Info className="h-12 w-12 text-slate-400 dark:text-gray-400 mx-auto mb-4" /><p className="text-slate-500 dark:text-gray-400">{t('warnings.selectAlert')}</p></div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news">
            <h3 className="text-2xl font-bold mb-4 flex items-center space-x-2 text-slate-900 dark:text-white"><Newspaper className="h-6 w-6 text-orange-600 dark:text-orange-400" /><span>{t('warnings.regionalNews')}</span></h3>
            <p className="text-slate-500 dark:text-gray-400 mb-6">{t('warnings.newsSubtitle')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isNewsLoading ? (
                <div className="col-span-full text-center text-slate-500 dark:text-gray-400 py-8"><Loader2 className="h-10 w-10 animate-spin text-orange-600 dark:text-orange-400 mx-auto mb-4" /><p>{t('warnings.loadingNews')}</p></div>
              ) : newsError ? (
                <div className="col-span-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2"><AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /><span className="text-red-600 dark:text-red-400 font-medium">{t('warnings.errorNews')}</span></div>
                  <p className="text-red-800 dark:text-red-300">{newsError}</p>
                </div>
              ) : newsReports.length === 0 ? (
                <div className="col-span-full text-center text-slate-500 dark:text-gray-400 py-8"><Info className="h-12 w-12 text-slate-400 dark:text-gray-400 mx-auto mb-4" /><p>{t('warnings.noNews')}</p></div>
              ) : (
                newsReports.map((report) => (
                  <motion.div key={report.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3"><h4 className="text-lg font-semibold text-slate-900 dark:text-white">{report.title}</h4><Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300">{report.source}</Badge></div>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mb-3"><Clock className="inline-block h-3 w-3 mr-1" /> {new Date(report.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID')}</p>
                    <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 mb-3"><MessageSquare className="h-5 w-5" /><span className="text-base font-medium">{t('warnings.geminiSummary')}</span></div>
                    <div className="bg-slate-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                      {geminiNewsSummary[report.id] ? (
                        <p className="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-line">{geminiNewsSummary[report.id]}</p>
                      ) : (
                        <div className="flex items-center text-slate-500 dark:text-gray-400 text-sm"><Loader2 className="h-4 w-4 animate-spin mr-2" /><span>{t('warnings.summarizing')}</span></div>
                      )}
                    </div>
                    {report.url && (<a href={report.url} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center text-sm">{t('warnings.readMore')} <ChevronRight className="h-4 w-4 ml-1" /></a>)}
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
