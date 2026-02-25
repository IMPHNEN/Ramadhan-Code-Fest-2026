import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, Loader2, ChevronRight, CloudRain, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface TimelineScrubberProps {
    frames: { time: number; path: string; isPast?: boolean }[];
    currentIndex: number;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onScrub: (index: number) => void;
    isLoading?: boolean;
    className?: string;
    isExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;
}

export function TimelineScrubber({
    frames,
    currentIndex,
    isPlaying,
    onTogglePlay,
    onScrub,
    isLoading = false,
    className,
    isExpanded,
    onExpandedChange,
}: TimelineScrubberProps) {
    const [localIndex, setLocalIndex] = useState(currentIndex);
    const [isDragging, setIsDragging] = useState(false);
    const [internalExpanded, setInternalExpanded] = useState(false); // Default closed if uncontrolled

    const isExpandedFinal = isExpanded ?? internalExpanded;
    const handleExpandedChange = (val: boolean) => {
        if (onExpandedChange) {
            onExpandedChange(val);
        } else {
            setInternalExpanded(val);
        }
    };

    const lastUpdateRef = useRef<number>(0);
    const throttleRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isDragging) {
            setLocalIndex(currentIndex);
        }
    }, [currentIndex, isDragging]);

    const handleSliderChange = (values: number[]) => {
        const newValue = values[0];
        setLocalIndex(newValue);
        setIsDragging(true);

        const now = Date.now();
        if (now - lastUpdateRef.current > 32) {
            if (throttleRef.current) clearTimeout(throttleRef.current);
            onScrub(newValue);
            lastUpdateRef.current = now;
        } else {
            if (throttleRef.current) clearTimeout(throttleRef.current);
            throttleRef.current = setTimeout(() => {
                onScrub(newValue);
                lastUpdateRef.current = Date.now();
            }, 32);
        }
    };

    const handleSliderCommit = (values: number[]) => {
        setIsDragging(false);
        onScrub(values[0]);
    };

    const currentFrame = frames[localIndex];
    const isForecastFrame = currentFrame && !currentFrame.isPast;

    const formattedTime = useMemo(() => {
        if (!currentFrame) return '--:--';
        const date = new Date(currentFrame.time * 1000);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }, [currentFrame]);

    const nowIndex = useMemo(() => frames.findLastIndex(f => f.isPast !== false), [frames]);
    const progressPercent = frames.length > 1 ? (localIndex / (frames.length - 1)) * 100 : 0;
    const nowPercent = frames.length > 1 && nowIndex !== -1 ? (nowIndex / (frames.length - 1)) * 100 : 0;

    // --- MINIMIZED VIEW ---
    if (!isExpandedFinal) {
        return (
            <button
                onClick={() => handleExpandedChange(true)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg text-white hover:bg-slate-900/80 transition-all group",
                    className
                )}
            >
                <div className="p-0.5 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30">
                    <CloudRain size={12} />
                </div>
                <span className="text-[10px] font-medium tracking-wide opacity-90">Radar</span>
                <div className="w-px h-2.5 bg-white/10 mx-0.5" />
                <ChevronUp size={12} className="opacity-50 group-hover:opacity-100" />
            </button>
        )
    }

    // --- EXPANDED VIEW ---
    return (
        <div className={cn(
            "flex flex-col gap-1 p-1.5 rounded-[18px] bg-slate-900/90 backdrop-blur-xl border border-white/5 shadow-2xl text-white select-none transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in w-[280px] sm:w-[320px]",
            isForecastFrame ? "border-purple-500/20 shadow-purple-900/10" : "border-white/10",
            className
        )}>

            {/* Header Row: Label & Close */}
            <div className="flex items-center justify-between px-2 pt-0.5 pb-0.5">
                <div className="flex items-center gap-1.5">
                    <CloudRain size={10} className={cn("text-cyan-400", isForecastFrame && "text-purple-400")} />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {isForecastFrame ? 'Prediksi' : 'Observasi'}
                    </span>
                </div>
                <button
                    onClick={() => handleExpandedChange(false)}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                >
                    <ChevronDown size={10} />
                </button>
            </div>

            {/* Main Control Row */}
            <div className="flex items-center gap-2 px-1 pb-1">
                {/* Play Button */}
                <button
                    onClick={onTogglePlay}
                    disabled={isLoading || frames.length === 0}
                    className={cn(
                        "flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-all focus:outline-none",
                        isPlaying
                            ? "bg-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.4)] hover:bg-cyan-400"
                            : "bg-white/10 text-white hover:bg-white/20"
                    )}
                >
                    {isLoading ? (
                        <Loader2 size={10} className="animate-spin" />
                    ) : isPlaying ? (
                        <Pause size={10} className="fill-current" />
                    ) : (
                        <Play size={10} className="fill-current ml-0.5" />
                    )}
                </button>

                {/* Timeline Track */}
                <div className="relative flex-1 h-4 flex items-center cursor-pointer group">
                    {/* Background Track */}
                    <div className="absolute left-0 right-0 h-1 rounded-full overflow-hidden bg-slate-700/50">
                        {/* Gradient Fill */}
                        <div
                            className="absolute inset-0 w-full h-full opacity-60"
                            style={{
                                background: `linear-gradient(to right, 
                            rgba(6, 182, 212, 0.8) 0%, 
                            rgba(6, 182, 212, 0.8) ${nowPercent}%, 
                            rgba(168, 85, 247, 0.8) ${nowPercent}%, 
                            rgba(168, 85, 247, 0.8) 100%)`
                            }}
                        />
                        <div className="absolute top-0 bottom-0 right-0 bg-slate-800/80 transition-all ease-linear duration-75" style={{ left: `${progressPercent}%` }} />
                    </div>

                    {/* NOW Marker */}
                    {nowIndex !== -1 && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-2 bg-white/80 rounded-full z-10"
                            style={{ left: `${nowPercent}%` }}
                        />
                    )}

                    {/* Slider Thumb */}
                    <div
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-sm pointer-events-none transition-all duration-75 ease-linear z-20",
                            isForecastFrame ? "bg-purple-500" : "bg-cyan-500"
                        )}
                        style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                    />

                    <Slider
                        defaultValue={[0]}
                        value={[localIndex]}
                        min={0}
                        max={frames.length - 1}
                        step={1}
                        onValueChange={handleSliderChange}
                        onValueCommit={handleSliderCommit}
                        className="absolute inset-0 opacity-0 cursor-pointer z-30 h-full py-2"
                    />
                </div>

                {/* Time Display */}
                <div className="flex flex-col items-end min-w-[36px] cursor-default">
                    <div className="text-xs font-bold font-mono leading-none tracking-tight text-white mb-0.5">
                        {formattedTime}
                    </div>
                    <div className="text-[8px] font-bold text-slate-500">WIB</div>
                </div>
            </div>
        </div>
    );
}
