export interface Region {
  id: string;
  name: string;
  code: string;
  level: 'province' | 'city' | 'district' | 'village';
  parentId?: string;
  coordinates: [number, number];
  bounds: [[number, number], [number, number]];
  population?: number;
  area?: number;
}

export interface WeatherData {
  id: string;
  regionId: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
  description: string;
  icon: string;
  timestamp: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  icon: string;
  precipitation: number;
  windSpeed: number;
}

export interface FloodZone {
  id: string;
  regionId: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number][];
  area: number;
  population: number;
  lastUpdate: string;
  description?: string;
  evacuationRoutes?: EvacuationRoute[];
}

export interface EvacuationRoute {
  id: string;
  name: string;
  coordinates: [number, number][];
  capacity: number;
  estimatedTime: number;
  status: 'active' | 'blocked' | 'maintenance';
}

export interface FloodAlert {
  id: string;
  regionId: string;
  level: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  titleEn?: string; // English translation
  message: string;
  messageEn?: string; // English translation
  timestamp: string;
  isActive: boolean;
  affectedAreas: string[];
  actions: string[];
  estimatedDuration?: number;
  coordinates?: [number, number];
  polygonCoordinates?: [number, number][][];
}

export interface FloodStatistics {
  regionId: string;
  totalAlerts: number;
  activeAlerts: number;
  floodProneAreas: number;
  peopleAtRisk: number;
  lastFloodEvent?: {
    date: string;
    severity: string;
    affectedAreas: number;
  };
}

export interface MapBounds {
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
}

export interface SelectedLocation {
  provinceName: string;
  districtName: string;
  latitude: number;
  longitude: number;
}

export interface ThemeConfig {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface NotificationConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DashboardStats {
  totalRegions: number;
  activeAlerts: number;
  floodZones: number;
  peopleAtRisk: number;
  weatherStations: number;
  lastUpdate: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface MapMarker {
  id: string;
  position: [number, number];
  type: 'weather' | 'flood' | 'evacuation' | 'warning';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  icon?: string;
  popup?: React.ReactNode;
}

export interface EvacuationLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  capacity_current: number;
  capacity_total: number;
  facilities?: string[];
  contact_person?: string;
  contact_phone?: string;
  operational_hours?: string;
  notes?: string;
  last_updated?: string;
  // NEW FIELDS
  operational_status: "Buka" | "Penuh" | "Tutup Sementara" | "Buka dan Menerima Pengungsi";
  essential_services: {
    clean_water: "Tersedia" | "Terbatas" | "Tidak Tersedia";
    electricity: "Tersedia" | "Terbatas" | "Tidak Tersedia";
    medical_support: "Tersedia 24 Jam" | "Tersedia" | "Tidak Tersedia";
  };
  verified_by?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavigationItem[];
}

export interface WeatherStation {
  id: string;
  name: string;
  coordinates: [number, number];
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  description?: string;
  timestamp?: string;
}