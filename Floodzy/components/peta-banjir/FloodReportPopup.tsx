import React from 'react';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Waves,
  ArrowUp,
  ArrowDown,
  Minus,
  Siren,
  CalendarDays,
} from 'lucide-react';
import { Button } from '../ui/Button'; // Path disesuaikan ke standar shadcn
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { cn } from '@/lib/utils'; // Asumsi Anda memiliki utilitas cn dari shadcn

// Tipe data untuk properti komponen
interface FloodReportPopupProps {
  report: {
    id: string;
    locationName: string;
    waterLevel: number;
    timestamp: string;
    trend: 'rising' | 'falling' | 'stable';
    severity: 'low' | 'moderate' | 'high';
    imageUrl?: string;
    // FITUR BARU: Menambahkan data historis untuk grafik mini
    historicalData?: { time: string; level: number }[];
  };
  // FITUR BARU: Menambahkan handler untuk tombol "Lihat Detail"
  onViewDetailsClick?: (reportId: string) => void;
}

// --- REFRAKTOR PROFESIONAL: Konfigurasi Berbasis Data ---
// Ini lebih bersih daripada fungsi switch/case di dalam JSX

const SEVERITY_CONFIG = {
  low: {
    label: 'Rendah',
    className: 'bg-green-600 hover:bg-green-700 text-white',
    icon: Waves,
  },
  moderate: {
    label: 'Sedang',
    className: 'bg-orange-500 hover:bg-orange-600 text-white',
    icon: Waves,
  },
  high: {
    label: 'Tinggi',
    className: 'bg-red-600 hover:bg-red-700 text-white',
    icon: Siren,
  },
};

const TREND_CONFIG = {
  rising: {
    label: 'Naik',
    className: 'text-red-500',
    icon: ArrowUp,
  },
  falling: {
    label: 'Turun',
    className: 'text-green-500',
    icon: ArrowDown,
  },
  stable: {
    label: 'Stabil',
    className: 'text-gray-500',
    icon: Minus,
  },
};

// --- FITUR BARU: Komponen Grafik Mini ---
// Komponen internal untuk menjaga file tetap terstruktur
const MiniTrendChart: React.FC<{ data: { time: string; level: number }[] }> = ({
  data,
}) => (
  <div className="w-full h-20 my-2 -ml-2">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
      >
        <defs>
          {/* Gradasi untuk area di bawah garis */}
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        {/* Tooltip kustom saat hover di grafik */}
        <RechartsTooltip
          contentStyle={{
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
          }}
          labelFormatter={(label) => format(new Date(label), 'HH:mm')}
          formatter={(value: number) => [`${value} cm`, 'Ketinggian']}
        />
        <Area
          type="monotone"
          dataKey="level"
          stroke="#8884d8"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#chartGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// --- Komponen Utama ---
const FloodReportPopup: React.FC<FloodReportPopupProps> = ({
  report,
  onViewDetailsClick,
}) => {
  // Mendapatkan konfigurasi berdasarkan data laporan
  const severityInfo =
    SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.moderate;
  const trendInfo = TREND_CONFIG[report.trend] || TREND_CONFIG.stable;
  const parsedTimestamp = new Date(report.timestamp);

  return (
    <TooltipProvider>
      <div className="w-64 space-y-2">
        {/* Gambar Laporan */}
        {report.imageUrl && (
          <div className="overflow-hidden rounded-md">
            <Image
              src={report.imageUrl}
              alt={`Laporan banjir di ${report.locationName}`}
              width={600}
              height={400}
              className="w-full h-auto object-cover aspect-video transition-transform hover:scale-105"
              priority // Prioritaskan pemuatan gambar yang terlihat
            />
          </div>
        )}

        {/* Judul Lokasi */}
        <h3 className="font-bold text-base leading-tight">
          {report.locationName}
        </h3>

        {/* --- TAMPILAN MODERN: Menggunakan Badge & Tooltip --- */}

        {/* Detail Status (Ketinggian, Keparahan, Tren) */}
        <div className="flex flex-col space-y-2 text-sm">
          {/* Ketinggian & Keparahan */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-2xl text-primary">
              {report.waterLevel} cm
            </span>
            <Badge
              className={cn('pointer-events-none', severityInfo.className)}
            >
              <severityInfo.icon className="w-3 h-3 mr-1" />
              {severityInfo.label}
            </Badge>
          </div>

          {/* Tren */}
          <div className={cn('flex items-center', trendInfo.className)}>
            <trendInfo.icon className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">{trendInfo.label}</span>
          </div>
        </div>

        {/* --- FITUR CANGGIH: Grafik Tren Mini --- */}
        {report.historicalData && report.historicalData.length > 0 && (
          <MiniTrendChart data={report.historicalData} />
        )}

        {/* Stempel Waktu dengan Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground cursor-default">
              <CalendarDays className="w-3 h-3 mr-1.5" />
              <span>
                {formatDistanceToNow(parsedTimestamp, {
                  addSuffix: true,
                  locale: id,
                })}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {/* Tampilkan waktu pasti saat hover */}
            <p>
              {format(parsedTimestamp, "EEEE, dd MMMM yyyy 'pukul' HH:mm", {
                locale: id,
              })}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Tombol Aksi */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewDetailsClick?.(report.id)}
        >
          Lihat Detail Laporan
        </Button>
      </div>
    </TooltipProvider>
  );
};

export default FloodReportPopup;
