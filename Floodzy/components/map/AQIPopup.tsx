import React from 'react';
import { Loader2, Wind, MapPin, AlertTriangle } from 'lucide-react';

interface AQIPopupProps {
    data: any;
    loading: boolean;
    onClose: () => void;
}

export function AQIPopup({ data, loading, onClose }: AQIPopupProps) {
    if (loading) {
        return (
            <div className="p-4 min-w-[200px] flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-cyan-500" size={24} />
                <span className="text-xs text-slate-500 font-medium">Memuat data kualitas udara...</span>
            </div>
        );
    }

    if (!data || data.status !== 'ok') {
        return (
            <div className="p-4 min-w-[200px] flex flex-col items-center justify-center gap-2 text-red-500">
                <AlertTriangle size={24} />
                <span className="text-xs font-medium">Data tidak tersedia</span>
            </div>
        );
    }

    const aqi = data.data.aqi;
    let statusColor = 'text-green-500';
    let statusBg = 'bg-green-500/10 border-green-500/20';
    let statusLabel = 'Baik';

    if (aqi > 50) { statusColor = 'text-yellow-500'; statusBg = 'bg-yellow-500/10 border-yellow-500/20'; statusLabel = 'Sedang'; }
    if (aqi > 100) { statusColor = 'text-orange-500'; statusBg = 'bg-orange-500/10 border-orange-500/20'; statusLabel = 'Tidak Sehat (Sensitif)'; }
    if (aqi > 150) { statusColor = 'text-red-500'; statusBg = 'bg-red-500/10 border-red-500/20'; statusLabel = 'Tidak Sehat'; }
    if (aqi > 200) { statusColor = 'text-purple-500'; statusBg = 'bg-purple-500/10 border-purple-500/20'; statusLabel = 'Sangat Tidak Sehat'; }
    if (aqi > 300) { statusColor = 'text-rose-900'; statusBg = 'bg-rose-900/10 border-rose-900/20'; statusLabel = 'Berbahaya'; }

    return (
        <div className="p-1 min-w-[220px]">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-0.5">Indeks Kualitas Udara</h4>
                    <div className={`flex items-baseline gap-1 ${statusColor}`}>
                        <span className="text-3xl font-bold leading-none">{aqi}</span>
                        <span className="text-sm font-bold">US AQI</span>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${statusBg} ${statusColor}`}>
                    {statusLabel}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin size={12} />
                    <span className="text-xs font-medium line-clamp-1">{data.data.city.name}</span>
                </div>

                {data.data.iaqi && data.data.iaqi.pm25 && (
                    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs">
                        <span className="text-slate-500 font-medium">PM 2.5</span>
                        <span className="font-mono font-bold">{data.data.iaqi.pm25.v} µg/m³</span>
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 text-center">
                    Sumber: {data.data.attributions?.[0]?.name || 'WAQI API'}
                </p>
            </div>
        </div>
    );
}
