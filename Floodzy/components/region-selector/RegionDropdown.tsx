// src/components/region-selector/RegionDropdown.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRegionData } from '@/hooks/useRegionData';
import {
  Frown, MapPin, Building2, Globe, Map, CheckCircle, Loader2, ChevronDown,
  Search, ArrowRight, Maximize2, Cloud, Droplets, Info, Wind, Eye, RotateCcw, CloudRain, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useLanguage } from '@/src/context/LanguageContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Removed unused imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CombinedWeatherData } from '@/lib/api';
// import { WeatherMapIframe } from '@/components/weather/WeatherMapIframe'; // Replaced
import { SelectedLocation } from '@/types/location';
import dynamic from 'next/dynamic';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';


const WeatherInsightMap = dynamic(
  () => import('@/components/map/WeatherInsightMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    ),
  },
);
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface RegionSelectFieldProps {
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  placeholder: string;
  loading: boolean;
  disabled: boolean;
  data: any[];
  icon: React.ReactNode;
  valueKey: string;
  nameKey: string;
  currentDisplayName: string | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function RegionSelectField({
  selectedValue,
  onValueChange,
  placeholder,
  loading,
  disabled,
  data,
  icon,
  valueKey,
  nameKey,
  currentDisplayName,
  isOpen,
  onOpenChange,
}: RegionSelectFieldProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { t } = useLanguage();

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const RegionList = (
    <>
      <Command className="bg-transparent">
        <div className="px-3 py-2 border-b border-slate-100 dark:border-gray-700">
          <CommandInput
            placeholder={`${t('common.searchPlaceholder')}`}
            className="h-9 border-0 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-0"
            autoFocus={isDesktop}
          />
        </div>

        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-gray-400">
            <Map className="h-10 w-10 mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium">{placeholder} tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain</p>
          </div>
        </CommandEmpty>

        <CommandList className={isDesktop ? "max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700" : "max-h-[60vh] overflow-y-auto"}>
          <CommandGroup>
            {loading ? (
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-500 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Memuat data...</span>
                </div>
              </div>
            ) : (
              data.map((item) => (
                <CommandItem
                  key={item[valueKey]}
                  value={item[nameKey]}
                  onSelect={(currentValue) => {
                    const selected = data.find(
                      (i) => i[nameKey].toLowerCase() === currentValue.toLowerCase()
                    );
                    if (selected) {
                      onValueChange(String(selected[valueKey]));
                      setOpen(false);
                    }
                  }}
                  className={`
                    cursor-pointer text-sm py-3 px-3 mx-1 my-1 rounded-md transition-all
                    flex items-center justify-between
                    ${selectedValue === String(item[valueKey])
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 pl-2 font-medium shadow-sm'
                      : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }
                    active:scale-[0.98] active:bg-slate-100 dark:active:bg-slate-800
                  `}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Show selected dot if not active, or just rely on the border/bg */}
                    <span className="truncate">{item[nameKey]}</span>
                  </div>
                  {selectedValue === String(item[valueKey]) && (
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
  );

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen(!open)}
      className={`
        w-full h-11 px-4
        bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white rounded-lg
        hover:bg-slate-50 dark:hover:bg-gray-750 hover:border-slate-300 dark:hover:border-gray-600
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        justify-between
      `}
    >
      <div className="flex items-center gap-2 truncate">
        {icon}
        <span className={`truncate ${currentDisplayName ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400'}`}>
          {currentDisplayName || `${t('landing.selectLocation')} ${placeholder}`}
        </span>
      </div>
      <ChevronDown
        className={`h-4 w-4 text-slate-400 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
      />
    </Button>
  );

  if (isDesktop) {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-gray-300">
          {/* Label removed here as it is inside the button or above? Keeping simple. */}
          {placeholder}
          {loading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 dark:text-blue-400 ml-1" />
          )}
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-xl"
            align="start"
          >
            {RegionList}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-gray-300">
        {placeholder}
        {loading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500 dark:text-blue-400 ml-1" />
        )}
      </label>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-800 max-h-[85vh]">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 dark:bg-gray-700 mt-4 mb-2" />
          <DrawerHeader>
            <DrawerTitle className="text-center font-semibold text-slate-900 dark:text-white">
              Pilih {placeholder}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-2 pb-8">
            {RegionList}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

interface RegionDropdownProps {
  onSelectDistrict: (location: SelectedLocation) => void;
  selectedLocation: SelectedLocation | null;
  currentWeatherData?: CombinedWeatherData | null;
  loadingWeather?: boolean;
  weatherError?: string | null;
  onMapClick?: (lat: number, lon: number) => void;
  activeFloodCount?: number;
}

export function RegionDropdown({
  onSelectDistrict,
  selectedLocation,
  currentWeatherData,
  loadingWeather,
  weatherError,
  onMapClick,
  activeFloodCount = 0,
}: RegionDropdownProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeField, setActiveField] = useState<'province' | 'regency' | 'district' | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    string | null
  >(null);

  const isMobile = useMediaQuery('(max-width: 768px)');

  // Auto-open map on desktop/large screens
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (isDesktop) {
        setIsMapOpen(true);
      }
    }
  }, []);
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string | null>(
    null,
  );
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    string | null
  >(null);

  const [displayProvinceName, setDisplayProvinceName] = useState<string | null>(
    null,
  );
  const [displayRegencyName, setDisplayRegencyName] = useState<string | null>(
    null,
  );
  const [displayDistrictName, setDisplayDistrictName] = useState<string | null>(
    null,
  );
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [weatherMapMode, setWeatherMapMode] = useState<'radar' | 'aqi'>('radar');

  const {
    data: provinces,
    loading: loadingProvinces,
    error: errorProvinces,
  } = useRegionData({ type: 'provinces' });

  const {
    data: regencies,
    loading: loadingRegencies,
    error: errorRegencies,
  } = useRegionData({
    type: 'regencies',
    parentCode: selectedProvinceCode,
    enabled: !!selectedProvinceCode,
  });

  const {
    data: districts,
    loading: loadingDistricts,
    error: errorDistricts,
  } = useRegionData({
    type: 'districts',
    parentCode: selectedRegencyCode,
    enabled: !!selectedRegencyCode,
  });

  useEffect(() => {
    if (selectedLocation) {
      setSelectedProvinceCode(selectedLocation.provinceCode);
      setSelectedRegencyCode(selectedLocation.regencyCode);
      setSelectedDistrictCode(selectedLocation.districtCode);
      setDisplayDistrictName(selectedLocation.districtName);
    } else {
      setSelectedProvinceCode(null);
      setDisplayProvinceName(null);
      setSelectedRegencyCode(null);
      setDisplayRegencyName(null);
      setSelectedDistrictCode(null);
      setDisplayDistrictName(null);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedProvinceCode && provinces.length > 0) {
      const provinceName =
        provinces.find((p) => String(p.province_code) === selectedProvinceCode)
          ?.province_name || null;
      setDisplayProvinceName(provinceName);
    }
  }, [selectedProvinceCode, provinces]);

  useEffect(() => {
    if (selectedRegencyCode && regencies.length > 0) {
      const regencyName =
        regencies.find((r) => String(r.city_code) === selectedRegencyCode)
          ?.city_name || null;
      setDisplayRegencyName(regencyName);
    }
  }, [selectedRegencyCode, regencies]);

  useEffect(() => {
    if (selectedDistrictCode && districts.length > 0) {
      const districtName =
        districts.find(
          (d) => String(d.sub_district_code) === selectedDistrictCode,
        )?.sub_district_name || null;
      setDisplayDistrictName(districtName);
    }
  }, [selectedDistrictCode, districts]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvinceCode(value);
    const name =
      provinces.find((p) => String(p.province_code) === value)?.province_name ||
      null;
    setDisplayProvinceName(name);

    setSelectedRegencyCode(null);
    setDisplayRegencyName(null);
    setSelectedDistrictCode(null);
    setDisplayDistrictName(null);
    setActiveField('regency');
  };

  const handleRegencyChange = (value: string) => {
    setSelectedRegencyCode(value);
    const name =
      regencies.find((r) => String(r.city_code) === value)?.city_name || null;
    setDisplayRegencyName(name);

    setSelectedDistrictCode(null);
    setDisplayDistrictName(null);
    setActiveField('district');
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);
    setActiveField(null);

    if (!selectedProvinceCode || !selectedRegencyCode) {
      setDisplayDistrictName(null);
      return;
    }

    const selectedDistrict = districts.find(
      (d) => d.sub_district_code === Number(value),
    );

    if (selectedDistrict) {
      const name = selectedDistrict.sub_district_name || null;
      setDisplayDistrictName(name);

      const lat = selectedDistrict.sub_district_latitude;
      const lng = selectedDistrict.sub_district_longitude;

      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
        console.warn(
          `Invalid coordinates for district ${name}: lat=${lat}, lng=${lng}`,
        );
      }

      const locationData = {
        districtCode: String(selectedDistrict.sub_district_code),
        districtName: selectedDistrict.sub_district_name || '',
        regencyCode: selectedRegencyCode,
        regencyName: displayRegencyName || '',
        provinceCode: selectedProvinceCode,
        provinceName: displayProvinceName || '',
        latitude: lat,
        longitude: lng,
        geometry: selectedDistrict.sub_district_geometry,
      };

      if (onSelectDistrict) {
        onSelectDistrict(locationData);
      }
    } else {
      setDisplayDistrictName(null);
    }
  };

  const renderError = (errorMessage: string) => (
    <Alert
      variant="destructive"
      className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
    >
      <Frown className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
      <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
    </Alert>
  );

  const isComplete =
    selectedDistrictCode &&
    displayProvinceName &&
    displayRegencyName &&
    displayDistrictName;

  return (
    <div className="w-full">
      {/* 
        Responsive Container Strategy:
        Mobile: Acts as a single Card (bg-card, border, shadow, rounded).
        Desktop (lg): Resets to transparent/grid, allowing children to be independent cards.
      */}
      <div className="
        bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-sm rounded-xl overflow-hidden
        lg:bg-transparent lg:dark:bg-transparent lg:border-none lg:shadow-none lg:overflow-visible
        lg:grid lg:grid-cols-2 lg:gap-6
      ">

        {/* =======================
            SECTION 1: FORM
           ======================= */}
        <div className="
          flex flex-col
          lg:bg-white lg:dark:bg-gray-800 lg:border lg:border-slate-200 lg:dark:border-gray-700 lg:shadow-sm lg:rounded-xl
        ">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {t('regionSelector.title')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('regionSelector.subtitle')}
                  </p>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${selectedProvinceCode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${selectedRegencyCode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${selectedDistrictCode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-gray-600'}`}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Error Messages */}
            {errorProvinces && renderError(errorProvinces)}
            {errorRegencies && renderError(errorRegencies)}
            {errorDistricts && renderError(errorDistricts)}

            {/* Form Fields */}
            <div className="space-y-4">
              <RegionSelectField
                selectedValue={selectedProvinceCode}
                onValueChange={handleProvinceChange}
                placeholder={t('regionSelector.province')}
                loading={loadingProvinces}
                disabled={loadingProvinces}
                data={provinces}
                icon={<Globe className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                valueKey="province_code"
                nameKey="province_name"
                currentDisplayName={displayProvinceName}
                isOpen={activeField === 'province'}
                onOpenChange={(open) => setActiveField(open ? 'province' : null)}
              />

              <RegionSelectField
                selectedValue={selectedRegencyCode}
                onValueChange={handleRegencyChange}
                placeholder={t('regionSelector.city')}
                loading={loadingRegencies}
                disabled={!selectedProvinceCode || loadingRegencies}
                data={regencies}
                icon={<Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                valueKey="city_code"
                nameKey="city_name"
                currentDisplayName={displayRegencyName}
                isOpen={activeField === 'regency'}
                onOpenChange={(open) => setActiveField(open ? 'regency' : null)}
              />

              <RegionSelectField
                selectedValue={selectedDistrictCode}
                onValueChange={handleDistrictChange}
                placeholder={t('regionSelector.district')}
                loading={loadingDistricts}
                disabled={!selectedRegencyCode || loadingDistricts}
                data={districts}
                icon={<MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />}
                valueKey="sub_district_code"
                nameKey="sub_district_name"
                currentDisplayName={displayDistrictName}
                isOpen={activeField === 'district'}
                onOpenChange={(open) => setActiveField(open ? 'district' : null)}
              />
            </div>

            {/* Success Summary */}
            {isComplete && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {t('regionSelector.successTitle')}
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-green-200/50 dark:border-green-800/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">{t('regionSelector.province')}</span>
                    <span className="text-sm sm:text-sm text-slate-900 dark:text-white font-bold text-left sm:text-right break-words w-full sm:w-auto">
                      {displayProvinceName}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 border-b border-green-200/50 dark:border-green-800/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">{t('regionSelector.city')}</span>
                    <span className="text-sm sm:text-sm text-slate-900 dark:text-white font-bold text-left sm:text-right break-words w-full sm:w-auto">
                      {displayRegencyName}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">{t('regionSelector.district')}</span>
                    <span className="text-sm sm:text-sm text-slate-900 dark:text-white font-bold text-left sm:text-right break-words w-full sm:w-auto">
                      {displayDistrictName}
                    </span>
                  </div>
                </div>
                <Link href="/#peta-banjir" passHref legacyBehavior>
                  <Button
                    className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <span className="flex items-center justify-center">
                      {t('regionSelector.viewFloodMap')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* =======================
            DIVIDER (Mobile Only)
           ======================= */}
        <div className="h-px bg-slate-200 dark:bg-gray-700 w-full lg:hidden" />

        {/* =======================
            SECTION 2: MAP
           ======================= */}
        <div className="
          flex flex-col
          lg:bg-white lg:dark:bg-gray-800 lg:border lg:border-slate-200 lg:dark:border-gray-700 lg:shadow-sm lg:rounded-xl
        ">
          {/* Header */}
          <div className="p-4 pt-4 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Map className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold leading-none tracking-tight">
                    {t('weatherInsight.title')}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedLocation?.districtName
                      ? t('weatherInsight.subtitle')
                      : t('weatherInsight.subtitle')}
                  </p>
                </div>
              </div>

              {/* Mode Switcher - Full width on mobile */}
              <ToggleGroup
                type="single"
                value={weatherMapMode}
                onValueChange={(val) => { if (val) setWeatherMapMode(val as 'radar' | 'aqi') }}
                className="bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg border border-slate-200 dark:border-slate-600 w-full sm:w-auto flex justify-between sm:justify-end"
              >
                <ToggleGroupItem value="radar" aria-label="Rain Radar" className="flex-1 sm:flex-none h-8 px-3 text-xs data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                  <CloudRain size={14} className="mr-1.5" />
                  Radar
                </ToggleGroupItem>
                <ToggleGroupItem value="aqi" aria-label="Air Quality" className="flex-1 sm:flex-none h-8 px-3 text-xs data-[state=on]:bg-green-500 data-[state=on]:text-white">
                  <Wind size={14} className="mr-1.5" />
                  AQI
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Content */}
          <div className="p-2 pt-0 h-full relative">
            <div className={`
              h-[400px] lg:h-[500px] relative rounded-md overflow-hidden group 
              ${!isMapOpen ? 'bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700' : ''}
            `}>
              {!isMapOpen ? (
                <div className="text-center p-6 max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white dark:ring-slate-900">
                    <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Visualisasi Cuaca & Banjir
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    Lihat peta interaktif untuk memantau radar hujan, status banjir, dan kualitas udara di wilayah terpilih secara real-time.
                  </p>

                  <Button
                    onClick={() => {
                      if (isMobile) {
                        setIsMapFullscreen(true);
                      } else {
                        setIsMapOpen(true);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 w-full sm:w-auto min-w-[140px]"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('landing.openMap')}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Fullscreen Toggle Button */}
                  {selectedLocation && typeof selectedLocation.latitude === 'number' && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 z-10 h-8 w-8 bg-white/90 dark:bg-slate-800/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setIsMapFullscreen(true)}
                    >
                      <Maximize2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                    </Button>
                  )}

                  <WeatherInsightMap
                    center={
                      selectedLocation && typeof selectedLocation.latitude === 'number'
                        ? [selectedLocation.latitude, selectedLocation.longitude]
                        : [-6.2088, 106.8456] // Default Jakarta
                    }
                    zoom={10}
                    activeMode={weatherMapMode}
                    className="h-full w-full"
                    selectedLocationName={selectedLocation?.districtName}
                    weatherData={currentWeatherData}
                    onMapClick={onMapClick}
                    activeFloodCount={activeFloodCount}
                  />
                </>
              )}
            </div>

            {/* Fullscreen Map Modal (Desktop)/Drawer (Mobile) */}
            {isMobile ? (
              <Drawer open={isMapFullscreen} onOpenChange={setIsMapFullscreen}>
                <DrawerContent className="h-[100dvh] bg-slate-900 border-none">
                  <DrawerHeader className="absolute top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <DrawerTitle className="text-white text-base font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-400" />
                          Monitoring Cuaca
                        </DrawerTitle>
                        <DrawerDescription className="text-slate-400 text-xs">
                          {displayDistrictName || 'Visualisasi Cuaca Real-time'}
                        </DrawerDescription>
                      </div>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                          <X className="h-5 w-5" />
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>
                  <div className="flex-1 w-full h-full pt-[60px]" data-vaul-no-drag="true"> {/* Add padding top for header */}
                    <WeatherInsightMap
                      center={
                        selectedLocation && typeof selectedLocation.latitude === 'number'
                          ? [selectedLocation.latitude, selectedLocation.longitude]
                          : [-6.2088, 106.8456]
                      }
                      zoom={10}
                      activeMode={weatherMapMode}
                      className="h-full w-full"
                      onMapClick={onMapClick}
                      activeFloodCount={activeFloodCount}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog open={isMapFullscreen} onOpenChange={setIsMapFullscreen}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-slate-900 border-none">
                  <div className="relative w-full h-full">
                    <div className="absolute top-4 left-4 z-50 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 pointer-events-none">
                      <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        {displayDistrictName || 'Peta Cuaca'}
                      </h3>
                    </div>
                    <WeatherInsightMap
                      center={
                        selectedLocation && typeof selectedLocation.latitude === 'number'
                          ? [selectedLocation.latitude, selectedLocation.longitude]
                          : [-6.2088, 106.8456]
                      }
                      zoom={10}
                      activeMode={weatherMapMode}
                      className="h-full w-full"
                      onMapClick={onMapClick}
                      activeFloodCount={activeFloodCount}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
