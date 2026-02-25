'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import Image from 'next/image';

// State Management
import { useAppStore } from '@/lib/store';
import { useLanguage } from '@/src/context/LanguageContext';

// UI Components
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { toast } from 'sonner';

// Icons
import {
  MapPin,
  Bell,
  Users,
  Shield,
  Activity,
  Map,
  ArrowRight,
  AlertTriangle,
  CloudRain,
  Waves,
  Globe,
  Send,
  Bot,
  User,
  Droplets,
  Info,
  Clock,
  Zap,
  MessageSquare,
  X,
  Loader2,
  Eye,
  RotateCcw,
} from 'lucide-react';

// Hooks & Utils
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useDisasterData } from '@/hooks/useDisasterData';
import {
  DASHBOARD_STATS_MOCK,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  WEATHER_STATIONS_GLOBAL_MOCK,
} from '@/lib/constants';
import { cn, formatPopulation, getBaseUrl } from '@/lib/utils';

// App Components
import { RegionDropdown } from '@/components/region-selector/RegionDropdown';
import dynamic from 'next/dynamic';
import { PeringatanBencanaCard } from '@/components/flood/PeringatanBencanaCard';
import { WeatherSummaryCard } from '@/components/dashboard/WeatherSummaryCard';
import { AirQualityCard } from '@/components/dashboard/AirQualityCard';
import { LocationPromptCard } from '@/components/dashboard/LocationPromptCard';
import { InfrastructureStatusCard } from '@/components/dashboard/InfrastructureStatusCard';

// Types
import type { FloodAlert as FloodAlertType, WeatherStation } from '@/types';
import { SelectedLocation } from '@/types/location';
import { MapBounds } from '@/types';

const FloodMap = dynamic(
  () => import('@/components/map/FloodMap').then((mod) => mod.FloodMap),
  {
    ssr: false,
  },
);

const FloodReportChart = dynamic(
  () => import('@/components/data-sensor/FloodReportChart'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-3" />
        <p className="text-gray-400">Memuat grafik laporan...</p>
      </div>
    ),
  },
);

export function DashboardClientPage({ initialData }) {
  const { selectedLocation, mapBounds, setSelectedLocation, setMapBounds } =
    useAppStore();
  const { t } = useLanguage();

  const [weatherSummary, setWeatherSummary] = useState(
    initialData.weatherSummary || null,
  );
  const [airQuality, setAirQuality] = useState(initialData.airQuality || null);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');

  const {
    weatherData,
    isLoading: isLoadingWeather,
    error: weatherError,
    fetchWeather,
  } = useWeatherData();
  const {
    disasterProneAreas,
    isLoading: isLoadingDisaster,
    error: disasterError,
    fetchDisasterAreas,
  } = useDisasterData();

  const [isLoadingWidgets, setIsLoadingWidgets] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isMapDrawerOpen, setMapDrawerOpen] = useState(false);
  const [isDashboardMapFullscreen, setIsDashboardMapFullscreen] =
    useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const mobileMapRef = useRef<any | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDashboardMapFullscreen) {
        setIsDashboardMapFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDashboardMapFullscreen]);

  React.useEffect(() => {
    if (isMapDrawerOpen) {
      // Wait for the drawer animation to finish before resizing the map
      const timer = setTimeout(() => {
        if (mobileMapRef.current) {
          mobileMapRef.current.invalidateSize();
        }
      }, 300); // Corresponds to the drawer animation duration

      return () => clearTimeout(timer);
    }
  }, [isMapDrawerOpen]);

  React.useEffect(() => {
    if (isDashboardMapFullscreen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isDashboardMapFullscreen]);

  useEffect(() => {
    const fetchDashboardWidgets = async () => {
      if (
        selectedLocation &&
        selectedLocation.latitude != null &&
        selectedLocation.longitude != null
      ) {
        setIsLoadingWidgets(true);
        try {
          const response = await fetch(
            `${getBaseUrl()}/api/dashboard-widgets?lat=${selectedLocation.latitude}&lon=${selectedLocation.longitude}&locationName=${encodeURIComponent(selectedLocation.districtName || '')}`,
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setWeatherSummary(data.weatherSummary);
          setAirQuality(data.airQuality);
        } catch (error) {
          console.error('Error fetching dashboard widgets data:', error);
          setWeatherSummary(null);
          setAirQuality(null);
        } finally {
          setIsLoadingWidgets(false);
        }
      } else {
        setWeatherSummary(null);
        setAirQuality(null);
      }
    };

    fetchDashboardWidgets();
    if (
      selectedLocation &&
      selectedLocation.latitude != null &&
      selectedLocation.longitude != null
    ) {
      fetchWeather(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation, fetchWeather]);

  const handleRegionSelect = useCallback(
    (location) => {
      setSelectedLocation(location);
      if (location && location.latitude != null && location.longitude != null) {
        const { latitude, longitude } = location;
        fetchWeather(latitude, longitude);
        const buffer = 0.05;

        const south = latitude - buffer;
        const west = longitude - buffer;
        const north = latitude + buffer;
        const east = longitude + buffer;

        const newMapBounds: MapBounds = {
          center: [latitude, longitude],
          zoom: 12,
          bounds: [
            [south, west],
            [north, east],
          ],
        };
        setMapBounds(newMapBounds);
        fetchDisasterAreas({ south, west, north, east });
      } else {
        setMapBounds(null);
        fetchDisasterAreas({
          south: DEFAULT_MAP_CENTER[0] - 0.1,
          west: DEFAULT_MAP_CENTER[1] - 0.1,
          north: DEFAULT_MAP_CENTER[0] + 0.1,
          east: DEFAULT_MAP_CENTER[1] + 0.1,
        });
      }
    },
    [fetchWeather, setSelectedLocation, setMapBounds, fetchDisasterAreas],
  );

  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      fetchWeather(lat, lon);
      // Temporary location object for visual feedback
      const customLocation: any = {
        id: 'custom-map-click',
        provinceCode: '',
        regencyCode: '',
        districtCode: '',
        villageCode: '',
        provinceName: '',
        regencyName: '',
        districtName: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`,
        villageName: '',
        latitude: lat,
        longitude: lon,
      };
      setSelectedLocation(customLocation);
    },
    [fetchWeather, setSelectedLocation],
  );

  const refreshDisasterData = useCallback(() => {
    if (mapBounds && mapBounds.bounds) {
      fetchDisasterAreas({
        south: mapBounds.bounds[0][0],
        west: mapBounds.bounds[0][1],
        north: mapBounds.bounds[1][0],
        east: mapBounds.bounds[1][1],
      });
      toast.success('Data bencana diperbarui!');
    } else {
      toast.error('Tidak dapat memperbarui data: Peta belum dimuat.');
    }
  }, [mapBounds, fetchDisasterAreas]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleMapBoundsChange = useCallback(
    (bounds) => {
      setMapBounds(bounds);
    },
    [setMapBounds],
  );

  const heroCards = useMemo(
    () => [
      {
        title: t('landing.totalRegions'),
        description: t('landing.descTotalRegions'),
        count: initialData.stats.totalRegions,
        icon: MapPin,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
      },
      {
        title: t('landing.activeAlerts'),
        description: t('landing.descActiveAlerts'),
        count: initialData.stats.activeAlerts,
        icon: Bell,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
      },
      {
        title: t('landing.floodZones'),
        description: t('landing.descFloodZones'),
        count: initialData.stats.floodZones,
        icon: Shield,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
      },
      {
        title: t('landing.peopleAtRisk'),
        description: t('landing.descPeopleAtRisk'),
        count: formatPopulation(initialData.stats.peopleAtRisk),
        icon: Users,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
      },
    ],
    [initialData.stats, t],
  );

  const sendChatMessage = async (message: string) => {
    if (!message.trim() && chatHistory.length === 0) return;

    setIsChatLoading(true);
    setChatError(null);

    const newHistory = [
      ...chatHistory,
      { role: 'user', parts: [{ text: message }] },
    ];
    setChatHistory(newHistory);
    setChatInput('');

    let needsLocation = false;
    try {
      let currentHistory = newHistory;

      const body = {
        question: message,
        history: chatHistory,
        location:
          selectedLocation &&
            selectedLocation.latitude &&
            selectedLocation.longitude
            ? selectedLocation
            : null,
      };

      // First API call
      const response = await fetch(`${getBaseUrl()}/api/chatbot`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan respon dari server.');
      }

      const data = await response.json();

      // Check if the bot needs location
      if (data.action === 'REQUEST_LOCATION') {
        needsLocation = true;
        // Add a message to the user that we need their location
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'model',
            parts: [
              {
                text: 'Tentu, untuk itu saya memerlukan lokasi Anda. Mohon izinkan akses lokasi.',
              },
            ],
          },
        ]);

        // Get location
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Add a system message with the location
            const locationPart = {
              functionResponse: {
                name: 'userLocation',
                response: { latitude, longitude },
              },
            };
            const historyWithLocation = [
              ...currentHistory,
              { role: 'function', parts: [locationPart] },
            ];

            setChatHistory(historyWithLocation);

            // Second API call with location
            const responseWithLocation = await fetch(
              `${getBaseUrl()}/api/chatbot`,
              {
                method: 'POST',
                body: JSON.stringify({ history: historyWithLocation }),
              },
            );

            if (!responseWithLocation.ok) {
              throw new Error(
                'Gagal mendapatkan respon setelah mengirim lokasi.',
              );
            }

            const dataWithLocation = await responseWithLocation.json();
            setChatHistory((prev) => [
              ...prev,
              { role: 'model', parts: [{ text: dataWithLocation.answer }] },
            ]);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setChatHistory((prev) => [
              ...prev,
              {
                role: 'model',
                parts: [
                  {
                    text: 'Maaf, saya tidak bisa mendapatkan lokasi Anda. Pastikan Anda telah memberikan izin.',
                  },
                ],
              },
            ]);
            setIsChatLoading(false);
          },
        );
      } else if (data.answer) {
        setChatHistory((prev) => [
          ...prev,
          { role: 'model', parts: [{ text: data.answer }] },
        ]);
      } else if (data.notification) {
        toast[data.notification.type || 'info'](data.notification.message, {
          duration: data.notification.duration || 5000,
        });
        // If there's a notification, we might not get an answer, so stop loading.
        setIsChatLoading(false);
      }
    } catch (error: any) {
      setChatError(error.message);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'model',
          parts: [{ text: 'Maaf, terjadi kesalahan. Coba lagi nanti.' }],
        },
      ]);
    } finally {
      // Only set loading to false if we are not waiting for geolocation
      if (!needsLocation) {
        setIsChatLoading(false);
      }
    }
  };
  const toggleChatbot = () => setIsChatbotOpen((prev) => !prev);

  return (
    <div className="bg-background">
      <main className="flex-1">
        <section className="relative overflow-hidden text-white">
          <div className="absolute inset-0">
            <Image
              src="/assets/banjirmobile.png"
              alt="Latar belakang banjir"
              fill
              priority
              quality={80}
              className="object-cover md:hidden"
            />
            <Image
              src="/assets/banjir.png"
              alt="Latar belakang banjir"
              fill
              priority
              quality={80}
              className="object-cover hidden md:block"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent z-10" />
            {/* Additional Light Mode Overlay for readability if image is dark */}
            <div className="absolute inset-0 bg-white/10 dark:bg-transparent mix-blend-overlay z-10" />
          </div>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 md:py-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-secondary" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                  Flood<span className="text-secondary">zie</span>
                </h1>
              </div>

              <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mt-4">
                {t('landing.heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 max-w-xs sm:max-w-md mx-auto">
                <Link href="#pilih-lokasi">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {t('landing.selectLocation')}
                  </Button>
                </Link>
                <Link href="/peringatan">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white border-white/50 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <Bell className="mr-2 h-5 w-5" />
                    {t('landing.latestAlerts')}
                  </Button>
                </Link>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16 items-start">
              {heroCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white hover:bg-white/10 transition-colors h-full">
                    <CardContent className="p-4 flex flex-col h-full">
                      <div className="flex-shrink-0 mb-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg inline-block',
                            card.bgColor,
                          )}
                        >
                          <card.icon className={cn('h-6 w-6', card.color)} />
                        </div>
                      </div>
                      <div className="mt-auto">
                        <p className="text-3xl font-bold">{card.count}</p>
                        <h3 className="text-sm font-semibold mt-1">
                          {card.title}
                        </h3>
                        <p className="text-xs text-white/70 mt-1">
                          {card.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pilih-lokasi"
          className="container mx-auto px-4 py-8 space-y-4"
        >
          <RegionDropdown
            onSelectDistrict={handleRegionSelect}
            selectedLocation={selectedLocation}
            currentWeatherData={weatherData}
            loadingWeather={isLoadingWeather}
            weatherError={weatherError}
            onMapClick={handleMapClick}
            activeFloodCount={initialData.realTimeAlerts?.filter((alert: any) => {
              if (!selectedLocation || !selectedLocation.districtName) return false;
              const searchName = selectedLocation.districtName.toLowerCase();

              // Check matches in location string, affectedAreas array, or regionId
              const locationMatch = alert.location?.toLowerCase().includes(searchName);
              const areaMatch = alert.affectedAreas?.some((area: string) => area.toLowerCase().includes(searchName));
              const regionMatch = alert.regionId === searchName.replace(/\s+/g, '-');

              return locationMatch || areaMatch || regionMatch;
            }).length || 0}
          />
        </section>

        <section className="container mx-auto px-4 py-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardStats {...initialData} />
          </motion.div>

          <div
            id="peta-banjir"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {isMobile ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-8 w-8 text-primary" />
                      <span className="text-2xl text-slate-900 dark:text-white">{t('landing.interactiveMap')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {t('landing.mapDescription')}
                    </p>
                    <Button size="lg" onClick={() => setMapDrawerOpen(true)}>
                      <Eye className="mr-2 h-5 w-5" />
                      {t('landing.openMap')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {t('dashboard.floodMapTitle')} -{' '}
                        {selectedLocation?.districtName || 'Indonesia'}
                      </span>
                      <Badge variant="success" className="ml-auto">
                        Live
                      </Badge>
                      <Button
                        onClick={refreshDisasterData}
                        variant="outline"
                        size="sm"
                        className="ml-2"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t('landing.updateData')}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-72 lg:h-[600px] w-full rounded-b-lg relative overflow-hidden">
                      <FloodMap
                        center={mapBounds?.center || DEFAULT_MAP_CENTER}
                        zoom={mapBounds?.zoom || DEFAULT_MAP_ZOOM}
                        className="h-full w-full"
                        floodProneData={disasterProneAreas}
                        loadingFloodData={isLoadingDisaster}
                        floodDataError={disasterError}
                        onMapBoundsChange={handleMapBoundsChange}
                        selectedLocation={selectedLocation}
                        globalWeatherStations={
                          WEATHER_STATIONS_GLOBAL_MOCK as WeatherStation[]
                        }
                        isFullscreen={isDashboardMapFullscreen}
                        onFullscreenToggle={() =>
                          setIsDashboardMapFullscreen(true)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="lg:col-span-1 flex flex-col gap-8">
              {!selectedLocation ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex-1"
                >
                  <LocationPromptCard />
                </motion.div>
              ) : isLoadingWidgets ? (
                <Card className="flex h-full min-h-[150px] flex-col items-center justify-center p-6 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mb-3" />
                  <p className="text-slate-900 dark:text-white">{t('landing.loadingWeather')}</p>
                </Card>
              ) : weatherSummary || airQuality ? (
                <>
                  {weatherSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex-1"
                    >
                      <WeatherSummaryCard weatherSummary={weatherSummary} />
                    </motion.div>
                  )}
                  {airQuality && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="flex-1"
                    >
                      <AirQualityCard airQuality={airQuality} />
                    </motion.div>
                  )}
                </>
              ) : (
                <Card className="flex h-full min-h-[150px] flex-col items-center justify-center text-center p-6 bg-white/80 dark:bg-slate-900/80 border-slate-200/50 dark:border-slate-800/50">
                  <Info className="h-8 w-8 text-yellow-500 dark:text-yellow-400 mb-3" />
                  <h4 className="text-slate-900 dark:text-white font-semibold mb-1">
                    {t('landing.dataUnavailable')}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t('landing.unavailableDesc')}
                  </p>
                </Card>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <InfrastructureStatusCard
              waterLevelPosts={initialData.waterLevelPosts}
              pumpStatusData={initialData.pumpStatusData}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-warning" />
                    <span>{t('landing.latestDisasterAlerts')}</span>
                  </CardTitle>
                  <Link href="/peringatan">
                    <Button variant="outline" size="sm">
                      <span>{t('landing.viewDetail')}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex justify-center">
                  {initialData.realTimeAlerts &&
                    initialData.realTimeAlerts.length > 0 ? (
                    initialData.realTimeAlerts.map((alert: any) => (
                      <PeringatanBencanaCard key={alert.id} alert={alert} />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-muted-foreground p-4">
                      Tidak ada peringatan bencana saat ini.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </main>
      <Drawer open={isMapDrawerOpen} onOpenChange={setMapDrawerOpen}>
        <DrawerContent className="h-screen">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Peta Interaktif</DrawerTitle>
                <DrawerDescription>
                  Gunakan dua jari untuk navigasi.
                </DrawerDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshDisasterData}
                disabled={isLoadingDisaster}
                className="h-8"
              >
                <RotateCcw
                  className={`h-3.5 w-3.5 mr-2 ${isLoadingDisaster ? 'animate-spin' : ''}`}
                />
                {isLoadingDisaster ? 'Memuat...' : 'Perbarui'}
              </Button>
            </div>
          </DrawerHeader>
          <div className="flex-1 p-0 overflow-hidden" data-vaul-no-drag="true">
            <FloodMap
              center={mapBounds?.center || DEFAULT_MAP_CENTER}
              zoom={mapBounds?.zoom || DEFAULT_MAP_ZOOM}
              className="h-full w-full"
              floodProneData={disasterProneAreas}
              loadingFloodData={isLoadingDisaster}
              floodDataError={disasterError}
              onMapBoundsChange={handleMapBoundsChange}
              selectedLocation={selectedLocation}
              globalWeatherStations={
                WEATHER_STATIONS_GLOBAL_MOCK as WeatherStation[]
              }
              onMapLoad={(map) => {
                mobileMapRef.current = map;
              }}
              isFullscreen={false}
              onFullscreenToggle={() => { }}
              showFullscreenButton={false}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <AnimatePresence>
        {isDashboardMapFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background p-4"
          >
            <Card className="h-full w-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  Peta Banjir Interaktif
                  <Button
                    onClick={() => setIsDashboardMapFullscreen(false)}
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Tutup Peta</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 h-0">
                <FloodMap
                  center={mapBounds?.center || DEFAULT_MAP_CENTER}
                  zoom={mapBounds?.zoom || DEFAULT_MAP_ZOOM}
                  className="h-full w-full"
                  floodProneData={disasterProneAreas}
                  loadingFloodData={isLoadingDisaster}
                  floodDataError={disasterError}
                  onMapBoundsChange={handleMapBoundsChange}
                  selectedLocation={selectedLocation}
                  globalWeatherStations={
                    WEATHER_STATIONS_GLOBAL_MOCK as WeatherStation[]
                  }
                  isFullscreen={isDashboardMapFullscreen}
                  onFullscreenToggle={() => setIsDashboardMapFullscreen(false)}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
