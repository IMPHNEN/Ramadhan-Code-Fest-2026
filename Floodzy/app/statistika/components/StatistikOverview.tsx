import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Activity,
  Lightbulb,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Target,
  AlertCircle,
  Users,
  Globe,
  TrendingDown,
  Sparkles,
  Zap,
  Shield,
  Brain,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/src/context/LanguageContext';

// Asumsi tipe data ini ada di file terpisah
interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  color: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

interface ChartDataPoint {
  name: string;
  incidents: number;
  severity: number;
}


// Asumsi utilitas ini ada di file terpisah
const colorClasses = {
  cyan: { bg: 'from-cyan-400/30 to-cyan-600/30', text: 'text-cyan-600 dark:text-cyan-200' },
  blue: { bg: 'from-blue-400/30 to-blue-600/30', text: 'text-blue-600 dark:text-blue-200' },
  red: { bg: 'from-red-400/30 to-red-600/30', text: 'text-red-600 dark:text-red-200' },
  orange: { bg: 'from-orange-400/30 to-orange-600/30', text: 'text-orange-600 dark:text-orange-200' },
  green: { bg: 'from-green-400/30 to-green-600/30', text: 'text-green-600 dark:text-green-200' },
  purple: { bg: 'from-purple-400/30 to-purple-600/30', text: 'text-purple-600 dark:text-purple-200' },
};

const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
  if (changeType === 'increase') return 'text-green-400';
  if (changeType === 'decrease') return 'text-red-400';
  if (changeType === 'neutral') return 'text-slate-400';
  return 'text-slate-400';
};

const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
  if (changeType === 'increase') return <TrendingUp className="w-4 h-4" />;
  if (changeType === 'decrease') return <TrendingDown className="w-4 h-4" />;
  if (changeType === 'neutral') return null;
  return null;
};


// Pie data moved inside component for translation

interface StatistikOverviewProps {
  // Prop statCards tetap ada, meskipun kita menggunakan data mock untuk demonstrasi
  statCards: StatCard[];
  chartData: ChartDataPoint[];
}

export default function StatistikOverview({ statCards, chartData }: StatistikOverviewProps) {
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportReport, setExportReport] = useState<string | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Data pie chart moved here for translation
  const pieData = [
    { name: t('statistika.types.banjir') || 'Banjir', value: 35, color: '#06B6D4' },
    { name: t('statistika.types.gempa') || 'Gempa', value: 25, color: '#EF4444' },
    { name: t('statistika.types.tanah longsor') || 'Longsor', value: 20, color: '#F59E0B' },
    { name: t('statistika.types.tsunami') || 'Tsunami', value: 10, color: '#10B981' },
    { name: t('statistika.types.lainnya') || 'Lainnya', value: 10, color: '#8B5CF6' },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- PENAMBAHAN KARTU STATISTIK ---
  // Data ini ditambahkan untuk mendemonstrasikan 6 kartu.
  // Idealnya, data ini datang dari parent component melalui props `statCards`.
  const fullStatCards: StatCard[] = [
    {
      title: t('statistika.overview.stats.totalIncidents'),
      value: '10',
      description: t('statistika.overview.stats.descTotalIncidents'),
      icon: <Activity className="w-6 h-6" />,
      color: 'cyan',
      change: 12,
      changeType: 'increase',
    },
    {
      title: t('statistika.overview.stats.evacuees'),
      value: '10.470',
      description: t('statistika.overview.stats.descEvacuees'),
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      change: 20,
      changeType: 'increase',
    },
    {
      title: t('statistika.overview.stats.casualties'),
      value: '89',
      description: t('statistika.overview.stats.descCasualties'),
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'red',
      change: 5,
      changeType: 'increase',
    },
    {
      title: t('statistika.overview.stats.damagedInfra'),
      value: '1.204',
      description: t('statistika.overview.stats.descDamagedInfra'),
      icon: <Zap className="w-6 h-6" />,
      color: 'orange',
      change: 8,
      changeType: 'decrease',
    },
    {
      title: t('statistika.overview.stats.affectedAreas'),
      value: '78',
      description: t('statistika.overview.stats.descAffectedAreas'),
      icon: <Globe className="w-6 h-6" />,
      color: 'green',
      change: 3,
      changeType: 'increase',
    },
    {
      title: t('statistika.overview.stats.preparedness'),
      value: '85%',
      description: t('statistika.overview.stats.descPreparedness'),
      icon: <Shield className="w-6 h-6" />,
      color: 'purple',
      change: 2,
      changeType: 'increase',
    },
  ];


  const handleDetailedAnalysis = async () => {
    setGeminiError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const prompt = `Berikan analisis detail mengenai data statistik bencana berikut. Prioritaskan **keringkasan, kejelasan, dan keterbacaan**. Format output menggunakan Markdown yang **sangat rapi dan mudah dicerna**. Ikuti panduan ketat berikut:

* **Gunakan heading (##, ###) yang jelas** untuk setiap bagian utama dan sub-bagian.
* **Gunakan bullet points (-) atau numbering (1., 2.) secara ekstensif** untuk daftar poin-poin penting.
* **Tambahkan highlight visual (misalnya, **bold**, *italic*) secara strategis** untuk menekankan kata kunci dan poin utama.
* **Gunakan tabel untuk menyajikan angka atau distribusi data secara ringkas.** Pastikan tabel mudah dibaca.
* **Pecah teks panjang menjadi paragraf-paragraf yang sangat singkat (maksimal 2-3 kalimat per paragraf).** Hindari kalimat majemuk yang panjang.
* **Fokus pada insight yang paling relevan dan rekomendasi yang paling actionable.**

Data Statistik:

## Ringkasan Statistik Utama
| Statistik | Nilai | Deskripsi |
|---|---|---|
${fullStatCards.map(card => `| ${card.title} | ${card.value} | ${card.description} |`).join('\n')}

## Tren Insiden Bulanan
| Bulan | Jumlah Insiden | Tingkat Keparahan Rata-rata |
|---|---|---|
${chartData.map(data => `| ${data.name} | ${data.incidents} | ${data.severity} |`).join('\n')}

## Distribusi Jenis Bencana
| Jenis Bencana | Persentase |
|---|---|
${pieData.map(item => `| ${item.name} | ${item.value}% |`).join('\n')}

Berdasarkan data di atas, berikan analisis komprehensif yang mencakup:
* **Tren utama** yang teridentifikasi dari data bulanan.
* **Anomali atau pola menarik** dalam distribusi jenis bencana.
* **Area berisiko** yang mungkin tersirat dari data.
* **Rekomendasi umum** untuk mitigasi dan peningkatan kesiapsiagaan.
Pastikan setiap bagian analisis disajikan dalam paragraf singkat dan poin-poin yang jelas.
`;
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mendapatkan analisis detail dari AI');
      }

      const data = await response.json();
      setAnalysisResult(data.response);
    } catch (err: any) {
      setGeminiError(`Error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportReport = async () => {
    setGeminiError(null);
    setIsExporting(true);
    setExportReport(null);

    try {
      const prompt = `Buat laporan ringkas dalam format Markdown berdasarkan data statistik bencana berikut:\n\n` +
        `## Ringkasan Statistik Utama\n${fullStatCards.map(card => `- **${card.title}**: ${card.value} (${card.description})`).join('\n')}\n\n` +
        `## Tren Insiden Bulanan\n${chartData.map(data => `- **${data.name}**: Jumlah Insiden: ${data.incidents}, Tingkat Keparahan Rata-rata: ${data.severity}`).join('\n')}\n\n` +
        `## Distribusi Jenis Bencana\n${pieData.map(item => `- **${item.name}**: ${item.value}% dari total insiden`).join('\n')}\n\n` +
        `Sertakan bagian untuk 'Kesimpulan' dan 'Rekomendasi' berdasarkan data ini.`;

      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat laporan AI');
      }

      const data = await response.json();
      setExportReport(data.response);

      // Trigger download
      const blob = new Blob([data.response], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Laporan_Analisis_Bencana_AI.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      setGeminiError(`Error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <BarChart3 className="w-7 h-7 mr-3 text-cyan-600 dark:text-cyan-400" />
            {t('statistika.overview.title')}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{t('statistika.overview.realTime')}</span>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400">{t('statistika.overview.subtitle')}</p>
      </motion.div>

      {/* Stats Grid - Enhanced with 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {fullStatCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
          >
            <Card className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 hover:border-cyan-500/40 transition-all duration-500 rounded-2xl group hover:shadow-2xl hover:shadow-cyan-500/10 hover:scale-[1.02] relative overflow-hidden h-full">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardContent className="p-6 relative flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[card.color]?.bg || ''} transition-all duration-300 group-hover:scale-110 shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`${colorClasses[card.color]?.text || ''}`}>{card.icon}</div>
                    </motion.div>
                    <motion.div
                      className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${getChangeColor(card.changeType)} bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {getChangeIcon(card.changeType)}
                      <span>{Math.abs(card.change)}%</span>
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">{card.title}</h3>
                    <motion.div
                      className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-100 transition-colors"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    >
                      {card.value}
                    </motion.div>
                    <p className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">{card.description}</p>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Trend Chart - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-4"
        >
          <Card className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden group hover:border-cyan-500/30 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/5 border-b border-slate-200 dark:border-slate-700/50 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="text-slate-800 dark:text-white flex items-center relative z-10">
                <div className="p-2 rounded-lg bg-cyan-500/20 mr-3">
                  <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">{t('statistika.overview.charts.trendTitle')}</div>
                  <div className="text-xs text-cyan-600 dark:text-cyan-300 font-normal">{t('statistika.overview.charts.trendSubtitle')}</div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-auto sm:h-[350px]">
              {isClient && (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6} />
                        <stop offset="50%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorSeverity" x1="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                        <stop offset="50%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={{ stroke: '#475569' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={{ stroke: '#475569' }}
                      axisLine={{ stroke: '#475569' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      }}
                      labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                      itemStyle={{ color: '#CBD5E1' }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      stroke="#06B6D4"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIncidents)"
                      name={t('statistika.overview.charts.incidents')}
                    />
                    <Area
                      type="monotone"
                      dataKey="severity"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSeverity)"
                      name={t('statistika.overview.charts.severity')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/5 border-b border-slate-200 dark:border-slate-700/50 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardTitle className="text-slate-800 dark:text-white flex items-center relative z-10">
                <div className="p-2 rounded-lg bg-purple-500/20 mr-3">
                  <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">{t('statistika.overview.charts.distributionTitle')}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300 font-normal">{t('statistika.overview.charts.distributionSubtitle')}</div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Live</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-auto sm:h-[350px] p-6 relative">
              {/* Legend */}
              <div className="absolute top-4 right-4 space-y-2">
                {pieData.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                  </motion.div>
                ))}
              </div>
              {isClient && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="55%"
                      labelLine={false}
                      outerRadius={110}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={true}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="#1e293b"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      }}
                      itemStyle={{ color: '#CBD5E1' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights Section - Completely Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Card className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-b border-slate-200 dark:border-slate-700/50 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardTitle className="text-slate-800 dark:text-white flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-amber-500/20 mr-3">
                  <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">{t('statistika.overview.aiInsights.title')}</div>
                  <div className="text-xs text-amber-600 dark:text-amber-300 font-normal">{t('statistika.overview.aiInsights.subtitle')}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-pulse" />
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{t('statistika.overview.aiInsights.poweredBy')}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-6">
                {/* Insight Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="group/insight bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-700/30 hover:border-cyan-400/50 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white group-hover/insight:text-cyan-600 dark:group-hover/insight:text-cyan-100 transition-colors">{t('statistika.overview.aiInsights.cards.trend.title')}</h4>
                        <div className="flex items-center space-x-1 text-red-500 dark:text-red-400">
                          <ArrowUpRight className="w-4 h-4" />
                          <span className="text-xs font-semibold">+15%</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('statistika.overview.aiInsights.cards.trend.desc')}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-300 text-xs rounded-full">{t('statistika.overview.aiInsights.cards.trend.tag')}</span>
                        <Target className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="group/insight bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-700/30 hover:border-emerald-400/50 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white group-hover/insight:text-emerald-600 dark:group-hover/insight:text-emerald-100 transition-colors">{t('statistika.overview.aiInsights.cards.risk.title')}</h4>
                        <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                          <Shield className="w-4 h-4" />
                          <span className="text-xs font-semibold">3 Zona</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('statistika.overview.aiInsights.cards.risk.desc')}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">{t('statistika.overview.aiInsights.cards.risk.tag')}</span>
                        <Globe className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="group/insight bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-700/30 hover:border-rose-400/50 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white group-hover/insight:text-rose-600 dark:group-hover/insight:text-rose-100 transition-colors">{t('statistika.overview.aiInsights.cards.education.title')}</h4>
                        <div className="flex items-center space-x-1 text-rose-500 dark:text-rose-400">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-xs font-semibold">-8%</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('statistika.overview.aiInsights.cards.education.desc')}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs rounded-full">{t('statistika.overview.aiInsights.cards.education.tag')}</span>
                        <Users className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="group/insight bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-700/30 hover:border-amber-400/50 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white group-hover/insight:text-amber-600 dark:group-hover/insight:text-amber-100 transition-colors">{t('statistika.overview.aiInsights.cards.integration.title')}</h4>
                        <div className="flex items-center space-x-1 text-amber-500 dark:text-amber-400">
                          <Activity className="w-4 h-4" />
                          <span className="text-xs font-semibold">85%</span>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('statistika.overview.aiInsights.cards.integration.desc')}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs rounded-full">{t('statistika.overview.aiInsights.cards.integration.tag')}</span>
                        <Brain className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/30"
            >
              <button
                onClick={handleDetailedAnalysis}
                disabled={isAnalyzing || isExporting}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Target className="w-5 h-5" />
                )}
                <span>{isAnalyzing ? t('statistika.overview.aiInsights.buttons.analyzing') : t('statistika.overview.aiInsights.buttons.analyze')}</span>
              </button>
              <button
                onClick={handleExportReport}
                disabled={isAnalyzing || isExporting}
                className="flex-1 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-600/50 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Brain className="w-5 h-5" />
                )}
                <span>{isExporting ? t('statistika.overview.aiInsights.buttons.exporting') : t('statistika.overview.aiInsights.buttons.export')}</span>
              </button>
            </motion.div>

            {/* Analysis Result Display */}
            {(analysisResult || geminiError) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 p-6 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                  <Lightbulb className="w-6 h-6 mr-3 text-amber-500 dark:text-amber-400" />
                  {t('statistika.overview.aiInsights.resultTitle')}
                </h3>
                {geminiError ? (
                  <p className="text-red-400 font-medium">{geminiError}</p>
                ) : (
                  <div className="prose prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}