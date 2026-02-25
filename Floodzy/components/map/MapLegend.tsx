'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { List, X } from 'lucide-react';
import { FLOOD_RISK_COLORS } from '@/lib/constants';

const legendItems = [
  {
    color: FLOOD_RISK_COLORS.low,
    label: 'Risiko Rendah',
    description: 'Zona aman dari banjir',
  },
  {
    color: FLOOD_RISK_COLORS.medium,
    label: 'Risiko Sedang',
    description: 'Berpotensi banjir ringan',
  },
  {
    color: FLOOD_RISK_COLORS.high,
    label: 'Risiko Tinggi',
    description: 'Rawan banjir berat',
  },
  {
    color: FLOOD_RISK_COLORS.critical,
    label: 'Risiko Kritis',
    description: 'Zona bahaya ekstrim',
  },
];

const markerItems = [
  {
    icon: '🌊',
    label: 'Sensor Banjir',
  },
  {
    icon: '⛅',
    label: 'Stasiun Cuaca',
  },
  {
    icon: '🚨',
    label: 'Peringatan Aktif',
  },
];

export function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-[1000]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mb-2"
          >
            <Card className="p-4 max-w-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-slate-50 shadow-2xl">
              <div className="relative space-y-4">
                <h3 className="text-sm font-semibold">Legenda Peta</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} />
                </Button>

                {/* Flood Risk Zones */}
                <div className="space-y-2">
                  <h4 className="text-xs text-slate-800 dark:text-slate-200">Zona Risiko Banjir</h4>
                  <div className="space-y-1">
                    {legendItems.map((item) => (
                      <div key={item.label} className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-sm border border-slate-400 dark:border-slate-600"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{item.label}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map Markers */}
                <div className="space-y-2">
                  <h4 className="text-xs text-slate-800 dark:text-slate-200">Marker</h4>
                  <div className="space-y-1">
                    {markerItems.map((item) => (
                      <div key={item.label} className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center text-xs">
                          {item.icon}
                        </div>
                        <span className="text-xs">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Time */}
                <div className="pt-2 border-t border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Diperbarui: {new Date().toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="secondary"
          className="rounded-full h-12 w-12 shadow-lg flex items-center justify-center"
        >
          {isOpen ? <X size={20} /> : <List size={20} />}
        </Button>
      </motion.div>
    </div>
  );
}
