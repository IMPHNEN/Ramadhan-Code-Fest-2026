'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
// Impor usePathname
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SplashScreen } from './SplashScreen';
import { Button } from '@/components/ui/Button'; // Import Button
import { WeatherPopupContent } from '@/components/weather-shortcut'; // Import WeatherPopupContent

interface SidebarContextType {
  isCollapsed: boolean;
  isDesktop: boolean;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false); // Default 'false' (terbuka)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isWeatherPopupOpen, setIsWeatherPopupOpen] = useState(false); // State for weather popup

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) {
      setShowSplash(false);
      return;
    }

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 6000);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // --- LOGIKA DIPERBAIKI DI SINI ---
  useEffect(() => {
    if (isDesktop) {
      // Di Desktop: Selalu paksa sidebar terbuka dan expanded
      setIsSidebarOpen(true);
      setIsCollapsed(false);
    } else {
      // Di Mobile: Selalu paksa sidebar tertutup, TAPI TETAP EXPANDED
      setIsSidebarOpen(false);
      setIsCollapsed(false); // <-- INI PERUBAHANNYA (dari true ke false)
    }
  }, [isDesktop]);

  const toggleMobileSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCollapsedState = () => {
    setIsCollapsed(!isCollapsed);
    // Di mobile, jika user menutup (collapse), kita juga tutup overlay-nya
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  };

  // Logika 'isMapPage'
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isContactPage = pathname === '/contact';
  const isMapPage = pathname === '/peta-banjir';

  if (isLandingPage || isContactPage) {
    return <>{children}</>;
  }

  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={toggleCollapsedState} // Menggunakan fungsi toggle yang sudah diperbarui
        onOpenWeatherPopup={() => setIsWeatherPopupOpen(true)}
      />

      <SidebarContext.Provider value={{ isCollapsed, isDesktop }}>
        <div
          className={`flex flex-col flex-1 transition-all duration-300
           ${isDesktop ? (isCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'}
          `}
        >
          <Header
            onMenuToggle={toggleMobileSidebar}
            isMenuOpen={isSidebarOpen}
          />
          {/* <main> sekarang kondisional */}
          <main
            className={
              isMapPage
                ? 'flex-1 overflow-auto h-full w-full' // <-- Style untuk Peta (fullscreen)
                : 'flex-1 p-4' // <-- Style untuk Dashboard dll (normal)
            }
          >
            {children}
          </main>

          {/* Popup Cuaca */}
          {isWeatherPopupOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
              <div className="bg-transparent p-0 rounded-none shadow-none max-w-md w-full relative">
                {/* Close button, positioned relative to the card */}
                <button
                  onClick={() => setIsWeatherPopupOpen(false)}
                  className="absolute top-2 right-2 h-10 w-10 rounded-full bg-blue-800/50 border border-blue-700/60 text-blue-100 hover:bg-blue-700/60 flex items-center justify-center text-2xl font-bold shadow-lg z-10"
                >
                  &times;
                </button>
                <WeatherPopupContent />
              </div>
            </div>
          )}
        </div>
      </SidebarContext.Provider>
    </div>
  );
}
