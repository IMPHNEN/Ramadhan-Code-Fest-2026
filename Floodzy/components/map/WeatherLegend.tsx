import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WeatherLegendProps {
    mode: 'radar' | 'aqi';
}

export function WeatherLegend({ mode }: WeatherLegendProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden text-white w-full max-w-[200px] sm:max-w-[240px]">
            <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Info size={14} className="text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        {mode === 'radar' ? 'Intensitas Hujan' : 'Kualitas Udara'}
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>

            {isExpanded && (
                <div className="p-3 space-y-3">
                    {mode === 'radar' ? (
                        <>
                            {/* Radar Gradient */}
                            <div className="space-y-1">
                                <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-200 via-blue-500 via-yellow-400 to-red-600"></div>
                                <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                                    <span>Ringan</span>
                                    <span>Sedang</span>
                                    <span>Lebat</span>
                                    <span>Ekstrim</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* AQI Gradient */}
                            <div className="space-y-1">
                                <div className="h-2 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-400 via-orange-500 via-red-500 to-purple-600"></div>
                                <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                                    <span>Baik</span>
                                    <span>Sedang</span>
                                    <span>Buruk</span>
                                    <span>Bahaya</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
