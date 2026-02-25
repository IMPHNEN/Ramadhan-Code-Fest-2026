'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Navigation, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import FloodReportCard from '@/components/peta-banjir/FloodReportCard';
import { getHaversineDistance } from '@/lib/mapUtils';
import { Button } from '@/components/ui/Button';

// Dinamis impor PetaBanjirClient untuk menghindari masalah SSR dengan Leaflet
const PetaBanjirClient = dynamic(
  () => import('@/components/peta-banjir/PetaBanjirClient'),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-muted animate-pulse" />,
  },
);
// Dynamic imports for new controls
const MapSearchControl = dynamic(
  () => import('@/components/peta-banjir/MapSearchControl'),
  { ssr: false },
);
const MapActionsControl = dynamic(
  () => import('@/components/peta-banjir/MapActionsControl'),
  { ssr: false },
);

// Tipe data harus cocok dengan yang ada di PetaBanjirClient
interface FloodReport {
  id: string;
  position: [number, number];
  timestamp: string;
  waterLevel: number;
  locationName: string;
  trend: 'rising' | 'falling' | 'stable';
  severity: 'low' | 'moderate' | 'high';
  imageUrl?: string;
  isVerified?: boolean; // Added for filter logic
}

interface EvacuationPoint {
  id: string;
  name: string;
  position: [number, number];
}

interface FilterState {
  severity: ('low' | 'moderate' | 'high')[];
  timeRange: '24h' | '3d' | 'all';
  status: 'all' | 'verified';
}

// Mock data dipindahkan ke sini karena kita butuh akses di client component
const mockFloodReports: FloodReport[] = [
  {
    id: 'report-1',
    position: [-6.2088, 106.8456],
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    waterLevel: 50,
    locationName: 'Jl. Thamrin, Jakarta Pusat',
    trend: 'rising',
    severity: 'moderate',
    imageUrl:
      'https://placehold.co/600x400/FF9800/FFFFFF/png?text=Banjir+Sedang',
    isVerified: true,
  },
  {
    id: 'report-2',
    position: [-6.2188, 106.8556],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    waterLevel: 120,
    locationName: 'Kelapa Gading, Jakarta Utara',
    trend: 'rising',
    severity: 'high',
    imageUrl:
      'https://placehold.co/600x400/F44336/FFFFFF/png?text=Banjir+Tinggi',
    isVerified: false,
  },
  {
    id: 'report-3',
    position: [-6.1988, 106.8256],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    waterLevel: 20,
    locationName: 'Kebayoran Baru, Jakarta Selatan',
    trend: 'stable',
    severity: 'low',
    isVerified: true,
  },
  {
    id: 'report-4',
    position: [-6.2288, 106.8656],
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    waterLevel: 70,
    locationName: 'Tanah Abang, Jakarta Pusat',
    trend: 'falling',
    severity: 'high',
    imageUrl:
      'https://placehold.co/600x400/F44336/FFFFFF/png?text=Banjir+Tinggi',
    isVerified: true,
  },
  {
    id: 'report-5',
    position: [-6.1888, 106.8356],
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    waterLevel: 35,
    locationName: 'Cilandak, Jakarta Selatan',
    trend: 'stable',
    severity: 'moderate',
    isVerified: false,
  },
];

const mockEvacuationPoints: EvacuationPoint[] = [
  { id: 'evac-1', name: 'Posko Evakuasi Utama', position: [-6.1754, 106.8272] },
  { id: 'evac-2', name: 'Gedung Serbaguna', position: [-6.2488, 106.8856] },
];

export default function PetaBanjirPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    mockFloodReports.length > 0 ? mockFloodReports[0].id : null,
  );
  const [api, setApi] = useState<CarouselApi>();
  const [isCarouselOpen, setIsCarouselOpen] = useState(true);
  const [isBrowserFullScreen, setIsBrowserFullScreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    severity: [],
    timeRange: 'all',
    status: 'all',
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  ); // New state
  const [evacuationRoute, setEvacuationRoute] = useState<{
    start: [number, number];
    end: [number, number];
  } | null>(null); // New state
  const [isRouting, setIsRouting] = useState(false); // New state
  const [isReporting, setIsReporting] = useState(false); // Added
  const [shouldOpenReportModal, setShouldOpenReportModal] = useState(false);

  const evacuationPoints = mockEvacuationPoints;

  const handleFullScreenToggle = () => {
    if (mapContainerRef.current) {
      if (!document.fullscreenElement) {
        mapContainerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
            err,
          );
        });
      } else {
        document.exitFullscreen();
      }
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  };

  const filteredReports = useMemo(() => {
    let tempReports = mockFloodReports;

    // Apply search query
    if (searchQuery) {
      tempReports = tempReports.filter((report) =>
        report.locationName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply severity filter
    if (filters.severity.length > 0) {
      tempReports = tempReports.filter((report) =>
        filters.severity.includes(report.severity),
      );
    }

    // Apply time range filter
    const now = new Date();
    if (filters.timeRange === '24h') {
      tempReports = tempReports.filter(
        (report) =>
          now.getTime() - new Date(report.timestamp).getTime() <
          24 * 60 * 60 * 1000,
      );
    } else if (filters.timeRange === '3d') {
      tempReports = tempReports.filter(
        (report) =>
          now.getTime() - new Date(report.timestamp).getTime() <
          3 * 24 * 60 * 60 * 1000,
      );
    }

    // Apply status filter
    if (filters.status === 'verified') {
      tempReports = tempReports.filter((report) => report.isVerified);
    }

    return tempReports;
  }, [searchQuery, filters]);

  useEffect(() => {
    // If a report was selected, ensure it's still in the filtered list
    if (
      selectedReportId &&
      !filteredReports.some((r) => r.id === selectedReportId)
    ) {
      setSelectedReportId(null); // Clear selection if filtered out
    }
    // If no report is selected, but there are filtered reports, select the first one
    if (!selectedReportId && filteredReports.length > 0) {
      setSelectedReportId(filteredReports[0].id);
    }
    // If carousel API exists and there's a selected report, scroll to it
    if (api && selectedReportId) {
      const idx = filteredReports.findIndex((r) => r.id === selectedReportId);
      if (idx !== -1) {
        api.scrollTo(idx);
      }
    }

    if (!api) return;

    const onSelect = () => {
      if (filteredReports.length > 0) {
        const selectedId = filteredReports[api.selectedScrollSnap()].id;
        setSelectedReportId(selectedId);
      }
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api, filteredReports, selectedReportId]);

  const handleMapClick = (coords: [number, number]) => {
    console.log('Map clicked at:', coords);
  };

  const handleCardClick = (reportId: string, index: number) => {
    setSelectedReportId(reportId);
    if (api) {
      const currentReportIndex = filteredReports.findIndex(
        (r) => r.id === reportId,
      );
      if (currentReportIndex !== -1) {
        api.scrollTo(currentReportIndex);
      }
    }
  };

  const handleFindEvacuationRoute = () => {
    setIsRouting(true);
    setEvacuationRoute(null); // Hapus rute lama
    setUserLocation(null); // Hapus lokasi lama

    if (!navigator.geolocation) {
      console.error('Geolocation tidak didukung oleh browser Anda.');
      // TODO: Tampilkan toast error
      setIsRouting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos: [number, number] = [latitude, longitude];
        setUserLocation(userPos);

        // Cari posko evakuasi terdekat
        let nearestPoint = null;
        let minDistance = Infinity;

        mockEvacuationPoints.forEach((point) => {
          const distance = getHaversineDistance(userPos, point.position);
          if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = point;
          }
        });

        if (nearestPoint) {
          // Set rute untuk di-render oleh PetaBanjirClient
          setEvacuationRoute({
            start: userPos,
            end: nearestPoint.position,
          });
          console.log(
            `Rute evakuasi terdekat ditemukan: ${nearestPoint.name} (${minDistance.toFixed(2)} km)`,
          );
        } else {
          console.error('Tidak ada titik evakuasi ditemukan.');
          // TODO: Tampilkan toast error
        }
        setIsRouting(false);
      },
      (error) => {
        console.error('Gagal mendapatkan lokasi:', error);
        // TODO: Tampilkan toast error (misal: "Izin lokasi ditolak")
        setIsRouting(false);
      },
    );
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsBrowserFullScreen(!!document.fullscreenElement);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className={clsx(
        'w-full h-screen relative',
        isBrowserFullScreen && 'overflow-hidden',
      )}
    >
      <div className={clsx('fixed inset-0 z-0')}>
        <PetaBanjirClient
          reports={filteredReports}
          evacuationPoints={evacuationPoints}
          onMapClick={handleMapClick}
          selectedReportId={selectedReportId}
          onToggleFullScreen={handleFullScreenToggle}
          isBrowserFullScreen={isBrowserFullScreen}
          userLocation={userLocation} // New prop
          evacuationRoute={evacuationRoute}
          isReporting={isReporting} // Pass isReporting
          setIsReporting={setIsReporting} // Pass setIsReporting
          shouldOpenReportModal={shouldOpenReportModal} // New prop
          setShouldOpenReportModal={setShouldOpenReportModal} // New prop
        >
          {/* Search Control */}
          <div className="absolute top-[1rem] left-[calc(50%+0.5rem)] -translate-x-1/2 z-[1001] w-[75vw] max-w-sm px-4 md:w-full md:max-w-md">
            <MapSearchControl onSearch={setSearchQuery} />
          </div>

          {/* Combined Map Actions Control */}
          <MapActionsControl
            onApplyFilters={setFilters}
            initialFilters={filters}
            handleFindEvacuationRoute={handleFindEvacuationRoute}
            isRouting={isRouting}
            onReportStart={() => {
              setIsReporting(true);
              setShouldOpenReportModal(true);
            }}
            isReporting={isReporting}
          />
        </PetaBanjirClient>
      </div>

      <div
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-10 pointer-events-none',
          'bg-gradient-to-t from-background via-background/80 to-transparent',
          'transition-all duration-300 ease-in-out',
          isCarouselOpen ? 'h-auto' : 'h-12',
          isBrowserFullScreen && 'hidden',
        )
        }
      >
        <button
          onClick={() => setIsCarouselOpen(!isCarouselOpen)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-card p-1 rounded-full border shadow-md md:hidden pointer-events-auto"
          aria-label="Toggle report panel"
        >
          {isCarouselOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        <div
          className={clsx(
            'w-full transition-opacity duration-100 pointer-events-auto',
            isCarouselOpen ? 'opacity-100' : 'opacity-0 invisible',
          )}
        >
          <Carousel
            setApi={setApi}
            opts={{ align: 'start', loop: filteredReports.length > 3 }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {filteredReports.map((report, index) => (
                <CarouselItem
                  key={report.id}
                  className="basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="p-1">
                    <FloodReportCard
                      id={report.id}
                      locationName={report.locationName}
                      waterLevel={report.waterLevel}
                      timestamp={report.timestamp}
                      trend={report.trend}
                      severity={report.severity}
                      isSelected={selectedReportId === report.id}
                      onClick={() => handleCardClick(report.id, index)}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </div>
  );
}
