// components/contexts/AlertCountContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef, // Import useRef
} from 'react';

// Definisikan tipe data Alert (harus konsisten di seluruh proyek)
interface Alert {
  id: string;
  level: 'Rendah' | 'Sedang' | 'Tinggi';
  location: string;
  timestamp: string;
  reason: string;
  details?: string;
  affectedAreas?: string[];
  estimatedPopulation?: number;
  severity?: number;
}

// Definisikan tipe untuk nilai context
interface AlertCountContextType {
  alertCount: number; // Total alerts
  highAlertCount: number; // Alerts with level "Tinggi"
  loadingAlerts: boolean;
  errorAlerts: string | null;
}

// Buat Context dengan nilai default
const AlertCountContext = createContext<AlertCountContextType | undefined>(
  undefined,
);

// Hook kustom untuk menggunakan context
export function useAlertCount() {
  const context = useContext(AlertCountContext);
  if (context === undefined) {
    throw new Error('useAlertCount must be used within an AlertCountProvider');
  }
  return context;
}

// Provider untuk Context
interface AlertCountProviderProps {
  children: ReactNode;
}

export function AlertCountProvider({ children }: AlertCountProviderProps) {
  const [alertCount, setAlertCount] = useState<number>(0);
  const [highAlertCount, setHighAlertCount] = useState<number>(0);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(true);
  const [errorAlerts, setErrorAlerts] = useState<string | null>(null);
  const isInitialFetch = useRef(true); // Lacak fetch awal

  const fetchAlertsData = async () => {
    // Hanya set loading true pada fetch awal
    if (isInitialFetch.current) {
      setLoadingAlerts(true);
    }
    setErrorAlerts(null);
    try {
      const response = await fetch('/api/alerts-data');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts data.');
      }
      const data: Alert[] = await response.json();
      setAlertCount(data.length); // Update total count
      setHighAlertCount(
        data.filter((alert) => alert.level === 'Tinggi').length,
      ); // Hitung peringatan tingkat tinggi
    } catch (err: any) {
      console.error('Error fetching alerts for header/sidebar:', err);
      setErrorAlerts(err.message || 'Failed to load alerts.');
      setAlertCount(0); // Reset count on error
      setHighAlertCount(0);
    } finally {
      // Pastikan loading di-set false dan tandai fetch awal selesai
      if (isInitialFetch.current) {
        setLoadingAlerts(false);
        isInitialFetch.current = false;
      }
    }
  };

  useEffect(() => {
    fetchAlertsData(); // Fetch data pertama kali saat komponen dimuat

    const intervalId = setInterval(fetchAlertsData, 30000); // Polling setiap 30 detik

    return () => clearInterval(intervalId); // Bersihkan interval saat komponen di-unmount
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat mount

  const value = { alertCount, highAlertCount, loadingAlerts, errorAlerts };

  return (
    <AlertCountContext.Provider value={value}>
      {children}
    </AlertCountContext.Provider>
  );
}
