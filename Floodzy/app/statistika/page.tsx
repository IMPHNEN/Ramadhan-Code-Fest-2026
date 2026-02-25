// FILE: app/statistika/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Gauge,
  TrendingUp,
  Clock,
  Users,
  Shield,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle,
  History,
} from 'lucide-react';

import { useLanguage } from '@/src/context/LanguageContext';

import { Button } from '@/components/ui/Button';
import { HistoricalIncident, ChartDataPoint, StatCard } from './statistika.types';
import { generateChartData } from './statistika.utils';
import GeminiChatSection from './components/GeminiChatSection';
import StatistikOverview from './components/StatistikOverview';
import StatistikHistorical from './components/StatistikHistorical';

// Definisikan tipe ChatMessage di sini agar bisa diakses oleh state
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'info' | 'warning' | 'success';
}

export default function StatistikPage() {
  const { t } = useLanguage();
  // State utama
  const [activeTab, setActiveTab] = useState<'overview' | 'historical'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State data
  const [historicalIncidents, setHistoricalIncidents] = useState<HistoricalIncident[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // State filter & sort
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State Gemini
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch data insiden
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/statistika/incidents');
      if (!response.ok) throw new Error('Gagal mengambil data insiden');
      const data: HistoricalIncident[] = await response.json();
      setHistoricalIncidents(data);
      setChartData(generateChartData(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Update chart berdasarkan tanggal
  useEffect(() => {
    const filteredByDate = historicalIncidents.filter((incident) => {
      if (!startDate && !endDate) return true;
      const incidentDate = new Date(incident.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (start && incidentDate < start) return false;
      if (end && incidentDate > end) return false;
      return true;
    });
    setChartData(generateChartData(filteredByDate));
  }, [startDate, endDate, historicalIncidents]);

  // Stat cards
  const statCards: StatCard[] = [
    {
      title: t('statistika.overview.stats.totalIncidents'),
      value: historicalIncidents.length,
      change: 12,
      changeType: 'increase',
      icon: <Activity className="w-6 h-6" />,
      color: 'blue',
      trend: [],
      description: t('statistika.overview.stats.descTotalIncidents'),
    },
    {
      title: t('statistika.overview.stats.evacuees'),
      value: historicalIncidents
        .reduce((acc, curr) => acc + (curr.evacuees || 0), 0)
        .toLocaleString('id-ID'),
      change: 20,
      changeType: 'increase',
      icon: <Shield className="w-6 h-6" />,
      color: 'cyan',
      trend: [],
      description: t('statistika.overview.stats.descEvacuees'),
    },
  ];

  // Filter & sort
  const filteredIncidents = historicalIncidents
    .filter((incident) => filterType === 'all' || incident.type.toLowerCase() === filterType.toLowerCase())
    .filter(
      (incident) =>
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'severity') {
        return sortOrder === 'desc' ? b.severity - a.severity : a.severity - b.severity;
      } else {
        return sortOrder === 'desc' ? b.type.localeCompare(a.type) : a.type.localeCompare(b.type);
      }
    });

  // Gemini handler
  const handleGeminiAnalysis = useCallback(async (question: string) => {
    if (!question.trim()) {
      // Note: We can't easily use t() inside useCallback if we don't include it in deps,
      // but adding it to deps changes behavior. For now, hardcode or leave as is if t is stable.
      // Assuming t is stable or we can just ignore strict deps for this one-off string.
      // Better: use setGeminiResponse directly with translated string if we pass t in deps.
      // However, t comes from hook context.
      // Let's use internal logic or simple message.
      // Actually, let's skip translating this specific error for now to avoid logic mess, OR simpler:
      return;
    }
    setIsGeminiLoading(true);
    setGeminiResponse(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const historyForApi = newMessages
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: historyForApi.slice(0, -1) }), // Send history BEFORE the current question
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal terhubung ke Chatbot API');
      }

      const data = await response.json();

      if (data.action === 'REQUEST_LOCATION') {
        setMessages(prev => [...prev, {
          id: 'location-request',
          text: 'Untuk memberikan informasi yang akurat, saya memerlukan izin untuk mengakses lokasi Anda. Mohon setujui permintaan lokasi yang muncul di browser Anda.',
          isUser: false,
          timestamp: new Date(),
          type: 'info',
        }]);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setMessages(prev => [...prev, {
              id: 'location-success',
              text: `Lokasi Anda berhasil didapatkan (Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}). Menganalisis data...`,
              isUser: false,
              timestamp: new Date(),
              type: 'success',
            }]);

            // Construct the history for the second API call
            const historyWithFunctionCall = [
              ...historyForApi,
              { role: 'model', parts: [{ functionCall: data.originalCall }] }
            ];

            const functionResponse = {
              role: 'function',
              parts: [{
                functionResponse: {
                  name: 'requestUserLocation',
                  response: { success: true, latitude, longitude },
                },
              }],
            };

            const finalHistory = [...historyWithFunctionCall, functionResponse];

            // Make the second call to get the final answer
            const finalResponse = await fetch('/api/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question: '', history: finalHistory }), // No new question, just continuing the turn
            });

            if (!finalResponse.ok) {
              const errorData = await finalResponse.json();
              throw new Error(errorData.error || 'Gagal mendapatkan jawaban akhir dari AI.');
            }

            const finalData = await finalResponse.json();
            setGeminiResponse(finalData.answer);
            setIsGeminiLoading(false);
          },
          (error) => {
            setMessages(prev => [...prev, {
              id: 'location-error',
              text: 'Gagal mendapatkan lokasi. Saya tidak bisa memberikan informasi spesifik tanpa izin lokasi. Anda bisa mencoba bertanya dengan menyebutkan nama wilayah secara spesifik (contoh: "banjir di Tangerang").',
              isUser: false,
              timestamp: new Date(),
              type: 'warning',
            }]);
            setIsGeminiLoading(false);
          }
        );
      } else {
        setGeminiResponse(data.answer);
        setIsGeminiLoading(false);
      }
    } catch (err: any) {
      setGeminiResponse(`Terjadi kesalahan saat menganalisis: ${err.message}`);
      setIsGeminiLoading(false);
    }
  }, [messages]);

  // Render loading & error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900">
        <p className="text-red-500 font-semibold">Terjadi kesalahan: {error}</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">{t('statistika.title')}</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'outline'}>
              {t('statistika.tabs.overview')}
            </Button>
            <Button onClick={() => setActiveTab('historical')} variant={activeTab === 'historical' ? 'default' : 'outline'}>
              {t('statistika.tabs.historical')}
            </Button>
            <Button onClick={() => setShowFilters((prev) => !prev)} variant="outline">
              <Filter className="w-4 h-4 mr-1" /> {t('statistika.filters.button')}
            </Button>
          </div>
        </div>

        {/* Filters (toggle) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-6 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              {/* Filter Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">{t('statistika.filters.startDate')}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 dark:text-slate-400">{t('statistika.filters.endDate')}</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StatistikOverview statCards={statCards} chartData={chartData} />
            </motion.div>
          )}

          {activeTab === 'historical' && (
            <motion.div
              key="historical"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StatistikHistorical
                filteredIncidents={filteredIncidents}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Gemini Section */}
      <GeminiChatSection
        geminiQuestion={geminiQuestion}
        setGeminiQuestion={setGeminiQuestion}
        geminiResponse={geminiResponse}
        isGeminiLoading={isGeminiLoading}
        handleGeminiAnalysis={handleGeminiAnalysis}
      />
    </div>
  );
}
