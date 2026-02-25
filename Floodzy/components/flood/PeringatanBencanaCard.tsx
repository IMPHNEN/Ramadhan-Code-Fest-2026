'use client';

import React, { useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bell, Info, Clock, Users, Eye } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getTimeAgo } from '@/lib/utils';
import type { FloodAlert as FloodAlertType } from '@/types';
import { useLanguage } from '@/src/context/LanguageContext';

// Import file CSS yang baru dibuat
import './PeringatanBencanaCard.css';

// --- Logika dan Utilitas untuk Animasi Kartu ---
const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
};
const clamp = (value: number, min = 0, max = 100) =>
  Math.min(Math.max(value, min), max);
const round = (value: number, precision = 3) =>
  parseFloat(value.toFixed(precision));
const adjust = (
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
) => round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// --- Fungsi untuk memilih ikon berdasarkan level peringatan ---
const getAlertIcon = (level: string) => {
  switch (level) {
    case 'danger':
      return <AlertTriangle className="w-full h-full" />;
    case 'warning':
      return <Bell className="w-full h-full" />; // Menggunakan Bell untuk warning
    default:
      return <Info className="w-full h-full" />;
  }
};

// --- Komponen Utama Kartu Peringatan ---
export const PeringatanBencanaCard = memo(( // ADDED: memo
  { alert, className }: { alert: FloodAlertType; className?: string }
) => {
  PeringatanBencanaCard.displayName = 'PeringatanBencanaCard'; // ADDED: display name
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const { t, lang } = useLanguage();

  // Memoized handlers untuk mengoptimalkan performa animasi
  const animationHandlers = useMemo(() => {
    let rafId: number | null = null;
    const updateCardTransform = (
      offsetX: number,
      offsetY: number,
      wrap: HTMLDivElement,
    ) => {
      const { clientWidth: width, clientHeight: height } = wrap;
      const percentX = clamp((100 / width) * offsetX);
      const percentY = clamp((100 / height) * offsetY);
      const properties = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--pointer-from-center': `${clamp(
          Math.hypot(percentY - 50, percentX - 50) / 50,
          0,
          1,
        )}`,
        '--rotate-x': `${round((percentX - 50) / 5)}deg`,
        '--rotate-y': `${round(-(percentY - 50) / 5)}deg`,
        '--card-opacity': `${clamp(
          Math.hypot(percentY - 50, percentX - 50) / 40,
          0,
          1,
        )}`,
      };
      Object.entries(properties).forEach(([p, v]) =>
        wrap.style.setProperty(p, v as string),
      );
    };

    const createSmoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      wrap: HTMLDivElement,
    ) => {
      const startTime = performance.now();
      const targetX = wrap.clientWidth / 2;
      const targetY = wrap.clientHeight / 2;
      const animationLoop = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = clamp(elapsed / duration);
        const easedProgress = easeInOutCubic(progress);
        updateCardTransform(
          adjust(easedProgress, 0, 1, startX, targetX),
          adjust(easedProgress, 0, 1, startY, targetY),
          wrap,
        );
        if (progress < 1) rafId = requestAnimationFrame(animationLoop);
      };
      rafId = requestAnimationFrame(animationLoop);
    };
    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    };
  }, []);

  // Event listeners untuk interaksi mouse/pointer
  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap || !animationHandlers) return;
      animationHandlers.updateCardTransform(event.offsetX, event.offsetY, wrap);
    },
    [animationHandlers],
  );

  const handlePointerEnter = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || !animationHandlers) return;
    animationHandlers.cancelAnimation();
    wrap.classList.add('active');
  }, [animationHandlers]);

  const handlePointerLeave = useCallback(
    (event: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap || !animationHandlers) return;
      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        wrap,
      );
      wrap.classList.remove('active');
    },
    [animationHandlers],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !animationHandlers) return;
    wrap.addEventListener('pointerenter', handlePointerEnter as EventListener);
    wrap.addEventListener('pointermove', handlePointerMove as EventListener);
    wrap.addEventListener('pointerleave', handlePointerLeave as EventListener);
    return () => {
      wrap.removeEventListener(
        'pointerenter',
        handlePointerEnter as EventListener,
      );
      wrap.removeEventListener(
        'pointermove',
        handlePointerMove as EventListener,
      );
      wrap.removeEventListener(
        'pointerleave',
        handlePointerLeave as EventListener,
      );
      animationHandlers.cancelAnimation();
    };
  }, [
    animationHandlers,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
  ]);

  return (
    <Link href="/peringatan" className="block">
      <div ref={wrapRef} className={cn('pc-card-wrapper', className)}>
        <section ref={cardRef} className="pc-card">
          <div className="pc-inside">
            <div className="pc-glare" />
            <div className="pc-alert-icon-content">
              <div className="alert-icon-container">
                {getAlertIcon(alert.level)}
              </div>
            </div>
            <div className="pc-content">
              <div className="pc-details">
                <h3>{lang === 'en' && alert.titleEn ? alert.titleEn : alert.title}</h3>
                <p>{(alert.level === 'danger' && lang === 'id') ? 'BAHAYA' : (alert.level === 'danger' && lang === 'en') ? 'DANGER' :
                  (alert.level === 'warning' && lang === 'id') ? 'PERINGATAN' : (alert.level === 'warning' && lang === 'en') ? 'WARNING' :
                    (alert.level === 'critical' && lang === 'id') ? 'KRITIKAL' : (alert.level === 'critical' && lang === 'en') ? 'CRITICAL' :
                      (alert.level === 'info' && lang === 'id') ? 'INFO' : 'INFO'}
                </p>
              </div>
            </div>
            <div className="pc-alert-info">
              <div className="pc-alert-details">
                <div>
                  <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{lang === 'en' && alert.messageEn ? alert.messageEn : alert.message}</span>
                </div>
                <div>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{getTimeAgo(alert.timestamp, lang)}</span>
                </div>
                {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                  <div>
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{t('common.affected')} {alert.affectedAreas.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Link>
  );
});