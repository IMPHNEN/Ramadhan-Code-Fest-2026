// File: lib/api.ts
import { createClient } from './supabase/server';
// ===============================================
// KUMPULAN INTERFACE (TIPE DATA)
// ===============================================

export interface RegionData {
  province_code?: number;
  province_name?: string;
  city_code?: number;
  city_name?: string;
  sub_district_code?: number;
  sub_district_name?: string;
  village_code?: number;
  village_name?: string;
  village_postal_codes?: string;
  sub_district_latitude?: number;
  sub_district_longitude?: number;
  sub_district_geometry?: string;
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags: { [key: string]: string };
  nodes?: number[];
  members?: Array<{ type: string; ref: number; role: string }>;
  geometry?: Array<{ lat: number; lon: number }>;
}

export interface OverpassResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

export interface OpenWeatherMapCurrentResponse {
  name: string; // Add the missing name property
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number; // m/s
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  rain?: {
    '1h'?: number; // Rain volume for the last 1 hour, mm
  };
  dt: number;
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

export interface CombinedWeatherData {
  current: OpenWeatherMapCurrentResponse;
  daily: any[]; // Assuming daily is an array of forecast data, adjust if a specific interface exists
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  icon: string;
  uvIndex?: number;
  rain1h?: number;
  dt?: number;
}

export interface WaterLevelPost {
  id: string;
  name: string;
  lat: number;
  lon: number;
  water_level?: number;
  unit?: string;
  timestamp?: string;
  status?: string;
}

export interface PumpData {
  id: string;
  nama_infrastruktur: string;
  latitude: number;
  longitude: number;
  kondisi_bangunan: string;
  tipe_hidrologi: string;
  jenis_infrastruktur?: string;
  provinsi?: string;
  kota_kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  lokasi?: string;
  kapasitas_liter_per_detik?: number;
  status_pompa?: any[];
  updated_at?: number;
}

export interface BmkgGempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
}

export interface PetabencanaReport {
  _id: string;
  appid: string;
  cat: string;
  detail: {
    en: string;
    id: string;
  };
  event_type: string;
  geom: {
    coordinates: [number, number];
    type: 'Point';
  };
  image?: string;
  source: string;
  status: string;
  timestamp: number;
  url: string;
  severity?: number;
}

export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export interface FetchPetabencanaReportsArgs {
  hazardType: string;
  timeframe: string;
}

export interface FetchWeatherDataArgs {
  lat?: number;
  lon?: number;
  locationName?: string;
}

export interface GeocodeLocationArgs {
  query: string;
}

export interface DisplayNotificationArgs {
  message: string;
  type?: string;
  duration?: number;
}

// ===============================================
// KUMPULAN FUNGSI API
// ===============================================

export async function getRegionDataServer(
  type: string,
  parentCode?: string | number | null,
): Promise<RegionData[]> {
  const supabase = createClient(); // Initialize the client here
  // Guard: hard-fail if supabase is not available (i.e., called from client)
  if (typeof window !== 'undefined' || !supabase) {
    const errorMessage = `ERROR: getRegionDataServer called from client-side or supabase not initialized. Module: lib/api.ts, Runtime: ${typeof window !== 'undefined' ? 'client' : 'unknown'}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  console.log(
    `getRegionData called with type='${type}' and parentCode='${parentCode}'`,
  );

  if (!type) {
    throw new Error('Missing required parameter: type');
  }

  let tableName: string;
  let selectColumns: string;
  let whereColumn: string | null = null;

  switch (type) {
    case 'provinces':
      tableName = 'provinces';
      selectColumns =
        'province_code, province_name, province_latitude, province_longitude';
      break;
    case 'regencies':
      tableName = 'regencies';
      selectColumns = 'city_code, city_name, city_latitude, city_longitude';
      whereColumn = 'city_province_code';
      break;
    case 'districts':
      tableName = 'districts';
      selectColumns =
        'sub_district_code, sub_district_name, sub_district_latitude, sub_district_longitude, sub_district_geometry';
      whereColumn = 'sub_district_city_code';
      break;
    case 'villages':
      tableName = 'villages';
      selectColumns =
        'village_code, village_name, village_postal_codes, village_latitude, village_longitude, village_geometry';
      whereColumn = 'village_sub_district_code';
      break;
    default:
      throw new Error(`Invalid region type: '${type}'`);
  }

  if (
    (type === 'regencies' || type === 'districts' || type === 'villages') &&
    (parentCode === undefined || parentCode === null || String(parentCode).toLowerCase() === 'undefined')
  ) {
    const errorMessage = `ERROR: Missing parent_code for type: ${type}. Received: ${parentCode}. This function should not be called with undefined/null parentCode for this type.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  let query = supabase.from(tableName).select(selectColumns);

  const sortColumn =
    selectColumns.split(',')[1]?.trim() ||
    selectColumns.split(',')[0]?.trim();
  if (sortColumn) {
    query = query.order(sortColumn, { ascending: true });
  }

  if (whereColumn && parentCode) {
    query = query.eq(whereColumn, parentCode);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching data from Supabase:', error.message);
    throw new Error(error.message);
  }

  return (data as RegionData[]) || [];
}


export async function fetchRegionsServer(
  type: 'provinces' | 'regencies' | 'districts' | 'villages',
  parentCode?: number | string,
): Promise<RegionData[]> {
  try {
    const data = await getRegionDataServer(type, parentCode);
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchRegionsServer: ${error.message}`);
    throw error;
  }
}