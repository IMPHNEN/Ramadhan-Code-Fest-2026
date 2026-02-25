// @ts-nocheck
import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import * as L from 'leaflet';
import { cn } from '@/lib/utils';
import { Wind, Gauge, MapPin, Info, ArrowUpRight } from 'lucide-react';

// --- MOCK DATA ---
export interface MockAQIPoint {
    id: string;
    name: string;
    lat: number;
    lon: number;
    aqi: number;
}

const MOCK_DATA: MockAQIPoint[] = [
    // JAVA
    { id: 'jkt', name: 'Jakarta Pusat', lat: -6.1751, lon: 106.8650, aqi: 165 },
    { id: 'jkt-s', name: 'Jakarta Selatan', lat: -6.2615, lon: 106.8106, aqi: 155 },
    { id: 'tgr', name: 'Tangerang', lat: -6.1732, lon: 106.6300, aqi: 160 },
    { id: 'bks', name: 'Bekasi', lat: -6.2383, lon: 106.9756, aqi: 158 },
    { id: 'bdg', name: 'Bandung', lat: -6.9175, lon: 107.6191, aqi: 110 },
    { id: 'smg', name: 'Semarang', lat: -7.0051, lon: 110.4381, aqi: 95 },
    { id: 'sby', name: 'Surabaya', lat: -7.2575, lon: 112.7521, aqi: 130 },
    { id: 'yog', name: 'Yogyakarta', lat: -7.7956, lon: 110.3695, aqi: 85 },
    { id: 'slo', name: 'Solo', lat: -7.5755, lon: 110.8243, aqi: 90 },

    // SUMATRA
    { id: 'mdn', name: 'Medan', lat: 3.5952, lon: 98.6722, aqi: 75 },
    { id: 'plm', name: 'Palembang', lat: -2.9909, lon: 104.7567, aqi: 88 },
    { id: 'pku', name: 'Pekanbaru', lat: 0.5071, lon: 101.4478, aqi: 65 },
    { id: 'bda', name: 'Banda Aceh', lat: 5.5483, lon: 95.3238, aqi: 45 },
    { id: 'pbg', name: 'Padang', lat: -0.9471, lon: 100.4172, aqi: 50 },
    { id: 'lmp', name: 'Bandar Lampung', lat: -5.3971, lon: 105.2668, aqi: 80 },

    // KALIMANTAN
    { id: 'ptk', name: 'Pontianak', lat: -0.0263, lon: 109.3425, aqi: 55 },
    { id: 'bjm', name: 'Banjarmasin', lat: -3.3194, lon: 114.5908, aqi: 60 },
    { id: 'bpn', name: 'Balikpapan', lat: -1.2379, lon: 116.8529, aqi: 35 },
    { id: 'smr', name: 'Samarinda', lat: -0.5015, lon: 117.1536, aqi: 45 },

    // SULAWESI & EAST
    { id: 'mks', name: 'Makassar', lat: -5.1477, lon: 119.4327, aqi: 40 },
    { id: 'mnd', name: 'Manado', lat: 1.4748, lon: 124.8428, aqi: 25 },
    { id: 'pal', name: 'Palu', lat: -0.9010, lon: 119.8396, aqi: 30 },
    { id: 'kdi', name: 'Kendari', lat: -3.9972, lon: 122.5121, aqi: 20 },
    { id: 'amb', name: 'Ambon', lat: -3.6539, lon: 128.1907, aqi: 15 },
    { id: 'jay', name: 'Jayapura', lat: -2.5489, lon: 140.7107, aqi: 10 },

    // BALI & NTB/NTT
    { id: 'dps', name: 'Denpasar', lat: -8.6705, lon: 115.2126, aqi: 55 },
    { id: 'mtr', name: 'Mataram', lat: -8.5833, lon: 116.1167, aqi: 40 },
    { id: 'kup', name: 'Kupang', lat: -10.1772, lon: 123.6070, aqi: 25 },
];

export const getAQIAnalytics = (aqi: number) => {
    // Estimate PM2.5 roughly from AQI
    const pm25 = Math.round(aqi * 0.4);

    if (aqi <= 50) return {
        label: 'Baik',
        status: 'good',
        description: 'Kualitas udara ideal.',
        // #22C55E with opacity
        colors: {
            bg: 'bg-[#22C55E]/80',
            solid: 'bg-[#22C55E]',
            text: 'text-[#22C55E]',
            border: 'border-[#22C55E]/30',
            glow: 'shadow-[#22C55E]/40'
        },
        pm25
    };
    if (aqi <= 100) return {
        label: 'Sedang',
        status: 'moderate',
        description: 'Dapat diterima sensitif.',
        // #EAB308
        colors: {
            bg: 'bg-[#EAB308]/80',
            solid: 'bg-[#EAB308]',
            text: 'text-[#EAB308]',
            border: 'border-[#EAB308]/30',
            glow: 'shadow-[#EAB308]/40'
        },
        pm25
    };
    if (aqi <= 150) return {
        label: 'Buruk',
        status: 'unhealthy',
        description: 'Kurangi aktivitas luar.',
        // #F97316
        colors: {
            bg: 'bg-[#F97316]/85',
            solid: 'bg-[#F97316]',
            text: 'text-[#F97316]',
            border: 'border-[#F97316]/30',
            glow: 'shadow-[#F97316]/40'
        },
        pm25
    };
    return {
        label: 'Bahaya',
        status: 'hazardous',
        description: 'Hindari keluar ruangan.',
        // #EF4444
        colors: {
            bg: 'bg-[#EF4444]/90',
            solid: 'bg-[#EF4444]',
            text: 'text-[#EF4444]',
            border: 'border-[#EF4444]/30',
            glow: 'shadow-[#EF4444]/40'
        },
        pm25
    };
};

const createAQIIcon = (aqi: number) => {
    const { colors } = getAQIAnalytics(aqi);
    const shouldPulse = aqi > 100;

    // "Soft Circle" design with white outline and glass feel
    return (L as any).divIcon({
        className: 'custom-aqi-marker',
        html: `
            <div class="relative flex items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-110">
                ${shouldPulse ? `<div class="absolute -inset-3 rounded-full ${colors.solid} opacity-20 animate-pulse"></div>` : ''}
                <div class="absolute -inset-0.5 rounded-full bg-white opacity-20 group-hover:opacity-40 blur-sm transition-opacity"></div>
                <div class="relative flex flex-col items-center justify-center w-9 h-9 rounded-full ${colors.bg} backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.15)] border-[1.5px] border-white/80 ${colors.glow} ring-1 ring-black/5">
                    <span class="text-[10px] font-black text-white leading-none">${aqi}</span>
                </div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });
};

// --- HERO COMPONENT: AQI DETAIL CARD (Liquid Glass Style) ---
export function AQIDetailCard({ point, onClose }: { point: MockAQIPoint; onClose?: () => void }) {
    const analytics = getAQIAnalytics(point.aqi);

    return (
        <div className="relative w-[240px] overflow-hidden rounded-2xl font-sans group">
            {/* Liquid Glass Base - Darkened for Contrast */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" />

            {/* Floodzy Gradient Tint (Subtle Overlay) */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-50 pointer-events-none" />

            {/* Refraction Highlight (Edge) */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.12), transparent 40%)',
                    borderRadius: 'inherit'
                }}
            />

            <div className="relative p-4 z-10">
                {/* Header: Location */}
                <div className="flex flex-col mb-3">
                    <h3 className="text-lg font-bold text-white tracking-tight drop-shadow-md truncate">{point.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] uppercase font-medium text-cyan-100/70 tracking-wider">Jawa, ID</span>
                        <span className="text-[9px] px-1.5 py-px rounded-full bg-cyan-500/20 border border-cyan-400/20 text-cyan-200 font-mono shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                            LIVE
                        </span>
                    </div>
                </div>

                {/* Main Hero: Compact Big AQI */}
                <div className="flex items-end justify-between mb-5">
                    <div className="flex flex-col">
                        <span className="text-5xl font-thin text-white tracking-tighter leading-none filter drop-shadow-lg">
                            {point.aqi}
                            <span className="text-lg font-light text-white/50 align-top ml-0.5">°</span>
                        </span>
                        <span className="text-[10px] font-medium text-cyan-100/60 mt-1 tracking-widest uppercase">
                            US AQI
                        </span>
                    </div>

                    <div className="flex flex-col items-end text-right">
                        <div className={`mb-2 p-2 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-lg backdrop-blur-md ${analytics.colors.glow}`}>
                            <ArrowUpRight size={16} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className={`text-base font-bold ${analytics.colors.text} filter drop-shadow-md tracking-tight`}>
                            {analytics.label}
                        </h2>
                    </div>
                </div>

                {/* Stacked Glass Details Lists (Compact) */}
                <div className="flex flex-col gap-2">

                    {/* Item 1: PM 2.5 */}
                    <div className="group/item relative flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center gap-2.5 relative z-10">
                            <Gauge size={14} className="text-cyan-200/80 drop-shadow" />
                            <span className="text-xs text-slate-200 font-medium">PM 2.5</span>
                        </div>
                        <div className="flex items-baseline gap-0.5 relative z-10">
                            <span className="text-sm font-bold text-white drop-shadow-md">{analytics.pm25}</span>
                            <span className="text-[9px] text-white/60">µg</span>
                        </div>
                        {/* Progress Bar Line */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-white/5 w-full rounded-b-xl overflow-hidden">
                            <div
                                className={`h-full ${analytics.colors.solid} shadow-[0_0_8px_currentColor]`}
                                style={{ width: `${Math.min(analytics.pm25, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Item 2: Wind */}
                    <div className="group/item relative flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center gap-2.5 relative z-10">
                            <Wind size={14} className="text-cyan-200/80 drop-shadow" />
                            <span className="text-xs text-slate-200 font-medium">Angin</span>
                        </div>
                        <div className="flex items-baseline gap-0.5 relative z-10">
                            <span className="text-sm font-bold text-white drop-shadow-md">5.4</span>
                            <span className="text-[9px] text-white/60">km/h</span>
                        </div>
                    </div>

                    {/* Item 3: Status */}
                    <div className="group/item relative flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5">
                        <div className="flex items-center gap-2.5 relative z-10">
                            <Info size={14} className="text-cyan-200/80 drop-shadow" />
                            <span className="text-xs text-slate-200 font-medium">Info</span>
                        </div>
                        <span className="text-[10px] font-medium text-white/90 text-right leading-tight max-w-[100px]">
                            {analytics.description}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- MAIN LAYER COMPONENT ---
interface MockAQILayerProps {
    visible: boolean;
    onPointSelect?: (point: MockAQIPoint) => void;
}

export function MockAQILayer({ visible, onPointSelect }: MockAQILayerProps) {
    if (!visible) return null;

    return (
        <>
            {MOCK_DATA.map((point) => (
                // @ts-ignore
                <Marker
                    key={point.id}
                    position={[point.lat, point.lon] as [number, number]}
                    icon={createAQIIcon(point.aqi)}
                    eventHandlers={{
                        click: (e) => {
                            if (onPointSelect) {
                                L.DomEvent.stopPropagation(e); // Prevent map click
                                onPointSelect(point);
                            }
                        },
                        mouseover: (e) => e.target.openTooltip(),
                        mouseout: (e) => e.target.closeTooltip()
                    }}
                >
                    <Tooltip
                        direction="bottom"
                        offset={[0, 20]}
                        opacity={1}
                        className="bg-transparent border-none shadow-none !p-0"
                    >
                        <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 shadow-xl tracking-wide">
                            {point.name}
                        </div>
                    </Tooltip>
                </Marker>
            ))}
        </>
    );
}
