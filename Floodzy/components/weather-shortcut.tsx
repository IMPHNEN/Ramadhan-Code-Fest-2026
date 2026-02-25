'use client';
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  Loader2,
  Wind,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  RefreshCw,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';

export function WeatherPopupContent() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<any | null>(null);

  const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;

  const fetchWeatherData = () => {
    setIsLoading(true);
    setError(null);

    if (!OPENWEATHERMAP_API_KEY) {
      setError('OpenWeatherMap API key tidak ditemukan. Harap tambahkan NEXT_PUBLIC_OPENWEATHERMAP_API_KEY ke file .env Anda.');
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser ini.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=id`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setWeather(data);
        } catch (err: any) {
          setError('Gagal mengambil data cuaca dari server: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        console.error(geoError);
        setError(
          'Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.'
        );
        setIsLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchWeatherData();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'r') {
        fetchWeatherData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getWeatherIcon = (weatherId: number) => {
    const iconProps = {
      className:
        'w-20 h-20 drop-shadow-2xl transition-all duration-500 hover:scale-110',
    };
    if (weatherId >= 200 && weatherId < 300)
      return (
        <CloudLightning
          {...iconProps}
          className={`${iconProps.className} text-yellow-400 animate-pulse`}
        />
      );
    if (weatherId >= 300 && weatherId < 600)
      return (
        <CloudRain
          {...iconProps}
          className={`${iconProps.className} text-blue-400`}
        />
      );
    if (weatherId >= 600 && weatherId < 700)
      return (
        <CloudSnow
          {...iconProps}
          className={`${iconProps.className} text-blue-200`}
        />
      );
    if (weatherId >= 700 && weatherId < 800)
      return (
        <Cloud
          {...iconProps}
          className={`${iconProps.className} text-gray-400`}
        />
      );
    if (weatherId === 800)
      return (
        <Sun
          {...iconProps}
          className={`${iconProps.className} text-yellow-400 animate-spin`}
          style={{ animationDuration: '20s' }}
        />
      );
    return (
      <Cloud
        {...iconProps}
        className={`${iconProps.className} text-gray-300`}
      />
    );
  };

  const getBackgroundGradient = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300)
      return 'from-gray-700 via-gray-800 to-gray-900';
    if (weatherId >= 300 && weatherId < 600)
      return 'from-blue-400 via-blue-500 to-blue-600';
    if (weatherId >= 600 && weatherId < 700)
      return 'from-blue-200 via-blue-300 to-blue-400';
    if (weatherId >= 700 && weatherId < 800)
      return 'from-gray-400 via-gray-500 to-gray-600';
    if (weatherId === 800) return 'from-orange-300 via-yellow-300 to-amber-400';
    return 'from-blue-300 via-blue-400 to-blue-500';
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-6 animate-fadeIn">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="absolute inset-0 w-12 h-12 animate-ping rounded-full bg-primary/20"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-base font-medium text-foreground">
              {t('currentWeather.loading')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('currentWeather.loading')}
            </p>
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-6 text-center animate-fadeIn">
          <div className="relative">
            <AlertTriangle className="w-12 h-12 text-destructive animate-bounce" />
            <div className="absolute inset-0 w-12 h-12 animate-ping rounded-full bg-destructive/20"></div>
          </div>
          <div className="space-y-2 max-w-sm">
            <p className="text-base font-semibold text-destructive">
              {t('currentWeather.oops')}
            </p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchWeatherData}
            className="group hover:scale-105 transition-transform"
          >
            <RefreshCw className="w-3 h-3 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            {t('currentWeather.retry')}
          </Button>
        </div>
      );
    }
    if (weather) {
      return (
        <div className="w-full space-y-6 animate-fadeIn text-blue-200">
          {/* Header dengan gradient background */}
          <div
            className={`relative overflow-hidden rounded-2xl backdrop-blur-md bg-blue-900/30 border border-blue-700/40 p-4 shadow-lg`}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left text-blue-200">
                <h2 className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-lg tracking-tight">
                  {weather.name}
                </h2>
                <p className="text-sm md:text-base capitalize font-medium drop-shadow-md opacity-90">
                  {weather.weather[0].description}
                </p>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                {getWeatherIcon(weather.weather[0].id)}
              </div>
            </div>
          </div>
          {/* Temperature Display */}
          <div className="text-center py-4 backdrop-blur-md bg-blue-900/30 rounded-2xl shadow-lg border border-blue-700/40">
            <div className="inline-block">
              <span className="text-5xl md:text-6xl font-bold tracking-tighter bg-gradient-to-br from-blue-200 to-blue-500 bg-clip-text text-transparent">
                {weather.main.temp.toFixed(0)}
              </span>
              <span className="text-3xl md:text-4xl font-light align-top text-blue-200/80 ml-1">
                °C
              </span>
            </div>
            <p className="text-xs text-blue-200/70 mt-2 font-medium">
              {t('currentWeather.currentTemp')}
            </p>
          </div>
          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="backdrop-blur-md bg-blue-900/30 p-3 rounded-xl border border-blue-700/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-800/40 rounded-full group-hover:rotate-12 transition-transform">
                  <Thermometer className="w-5 h-5 text-blue-300" />
                </div>
                <p className="font-bold text-lg text-blue-200">
                  {weather.main.feels_like.toFixed(1)}°
                </p>
                <p className="text-xs font-medium text-blue-200/70 uppercase tracking-wide">
                  {t('currentWeather.feelsLike')}
                </p>
              </div>
            </div>
            <div className="backdrop-blur-md bg-blue-900/30 p-3 rounded-xl border border-blue-700/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-800/40 rounded-full group-hover:rotate-12 transition-transform">
                  <Wind className="w-5 h-5 text-blue-300" />
                </div>
                <p className="font-bold text-lg text-blue-200">{weather.wind.speed}</p>
                <p className="text-xs font-medium text-blue-200/70 uppercase tracking-wide">
                  m/s
                </p>
              </div>
            </div>
            <div className="backdrop-blur-md bg-blue-900/30 p-3 rounded-xl border border-blue-700/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-800/40 rounded-full group-hover:rotate-12 transition-transform">
                  <Droplets className="w-5 h-5 text-blue-300" />
                </div>
                <p className="font-bold text-lg text-blue-200">{weather.main.humidity}%</p>
                <p className="text-xs font-medium text-blue-200/70 uppercase tracking-wide">
                  {t('currentWeather.humidity')}
                </p>
              </div>
            </div>
            <div className="backdrop-blur-md bg-blue-900/30 p-3 rounded-xl border border-blue-700/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-blue-800/40 rounded-full group-hover:rotate-12 transition-transform">
                  <Gauge className="w-5 h-5 text-blue-300" />
                </div>
                <p className="font-bold text-lg text-blue-200">{weather.main.pressure}</p>
                <p className="text-xs font-medium text-blue-200/70 uppercase tracking-wide">
                  hPa
                </p>
              </div>
            </div>
          </div>
          {/* Refresh Hint */}
          <div className="flex items-center justify-center gap-2 text-xs text-blue-200/70 backdrop-blur-md bg-blue-900/30 px-3 py-2 rounded-full border border-blue-700/40 hover:bg-blue-900/40 transition-colors">
            <kbd className="px-2 py-1 text-xs font-semibold bg-blue-800/40 border border-blue-700/50 rounded-lg shadow-sm text-blue-200">
              R
            </kbd>
            <span className="font-medium">{t('currentWeather.reload')}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-2 md:p-4 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
      <Card className="w-full max-w-md backdrop-blur-xl bg-blue-950/30 border border-blue-800/40 shadow-lg transition-all duration-500">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-200 to-blue-500 bg-clip-text text-transparent">
            {t('currentWeather.title')}
          </CardTitle>
          <CardDescription className="text-sm text-blue-200/80">
            {t('currentWeather.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}