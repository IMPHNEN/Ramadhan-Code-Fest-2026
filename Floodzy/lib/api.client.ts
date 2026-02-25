// File: lib/api.client.ts
import { safeFetch, UserFriendlyError } from './error-utils';
import { getBaseUrl } from './utils';
import {
  RegionData,
  OverpassResponse,
  WeatherData,
  WaterLevelPost,
  PumpData,
  BmkgGempaData,
  PetabencanaReport,
  NominatimResult,
  FetchPetabencanaReportsArgs,
  FetchWeatherDataArgs,
  GeocodeLocationArgs,
  DisplayNotificationArgs,
  OpenWeatherMapCurrentResponse,
  CombinedWeatherData,
} from './api'; // Import necessary types from lib/api.ts



export async function fetchRegionsClient(
  type: 'provinces' | 'regencies' | 'districts' | 'villages',
  parentCode?: number | string,
): Promise<RegionData[]> {
  const baseUrl = getBaseUrl();
  const apiUrl = `${baseUrl}/api/regions?type=${type}${parentCode ? `&parentCode=${parentCode}` : ''}`;

  try {
    const data: RegionData[] = await safeFetch(apiUrl, undefined, 'Gagal mengambil data wilayah. Silakan coba lagi.');
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchRegionsClient: ${error.message}`);
    throw error;
  }
}

export async function fetchDisasterProneData(
  south: number,
  west: number,
  north: number,
  east: number,
): Promise<OverpassResponse> {
  const query = `
[out:json][timeout:25];
(
  node[\"flood_prone\"=\"yes\"](${south},${west},${north},${east});
  way[\"flood_prone\"=\"yes\"](${south},${west},${north},${east});
  relation[\"flood_prone\"=\"yes\"](${south},${west},${north},${east});
  node[\"hazard\"=\"flood\"](${south},${west},${north},${east});
  way[\"hazard\"=\"flood\"](${south},${west},${north},${east});
  relation[\"hazard\"=\"flood\"](${south},${west},${north},${east});
  node[\"natural\"=\"landslide\"](${south},${west},${north},${east});
  way[\"natural\"=\"landslide\"](${south},${west},${north},${east});
  relation[\"natural\"=\"landslide\"](${south},${west},${north},${east});
  node[\"hazard\"=\"landslide\"](${south},${west},${north},${east});
  way[\"hazard\"=\"landslide\"](${south},${west},${north},${east});
  relation[\"hazard\"=\"landslide\"](${south},${west},${north},${east});
  node[\"waterway\"~\"^(river|stream|canal|drain|ditch)$\"](${south},${west},${north},${east});
  way[\"waterway\"~\"^(river|stream|canal|drain|ditch)$\"](${south},${west},${north},${east});
  relation[\"waterway\"~\"^(river|stream|canal|drain|ditch)$\"](${south},${west},${north},${east});
  node[\"natural\"=\"water\"](${south},${west},${north},${east});
  way[\"natural\"=\"water\"](${south},${west},${north},${east});
  relation[\"natural\"=\"water\"](${south},${west},${north},${east});
  node[\"man_made\"=\"dyke\"](${south},${west},${north},${east});
  way[\"man_made\"=\"dyke\"](${south},${west},${north},${east});
  relation[\"man_made\"=\"dyke\"](${south},${west},${north},${east});
  node[\"landuse\"=\"basin\"](${south},${west},${north},${east});
  way[\"landuse\"=\"basin\"](${south},${west},${north},${east});
  relation[\"landuse\"=\"basin\"](${south},${west},${north},${east});
  node[\"natural\"=\"wetland\"](${south},${west},${north},${east});
  way[\"natural\"=\"wetland\"](${south},${west},${north},${east});
  relation[\"natural\"=\"wetland\"](${south},${west},${north},${east});
);
out body geom;
`.trim();

  console.log('Overpass API Query:', query);

  try {
    const data: OverpassResponse = await safeFetch(
      'https://overpass-api.de/api/interpreter',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        next: { revalidate: 3600 }, // Revalidate every 1 hour
      },
      'Gagal mengambil data area rawan bencana. Silakan coba lagi.'
    );
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchDisasterProneData: ${error.message}`);
    throw error;
  }
}

export async function fetchWeatherData(
  lat: number,
  lon: number,
  apiKey: string,
): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`;
  try {
    const data: WeatherData = await safeFetch(url, undefined, 'Gagal mengambil data cuaca. Silakan coba lagi.');
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchWeatherData: ${error.message}`);
    throw error;
  }
}

export async function fetchWaterLevelData(
  districtName?: string,
): Promise<WaterLevelPost[]> {
  const baseUrl = getBaseUrl(); // ADDED
  let apiUrl = `${baseUrl}/api/water-level-proxy`; // MODIFIED
  const trimmedDistrictName = districtName?.trim();
  if (trimmedDistrictName) {
    apiUrl += `?districtName=${encodeURIComponent(trimmedDistrictName)}`;
  }
  try {
    const data: WaterLevelPost[] = await safeFetch(apiUrl, undefined, 'Gagal mengambil data tinggi air. Silakan coba lagi.');
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchWaterLevelData: ${error.message}`);
    throw error;
  }
}

export async function fetchPumpStatusData(
  districtName?: string,
): Promise<PumpData[]> {
  const baseUrl = getBaseUrl(); // ADDED
  let apiUrl = `${baseUrl}/api/pump-status-proxy`; // MODIFIED
  const trimmedDistrictName = districtName?.trim();
  if (trimmedDistrictName) {
    apiUrl += `?districtName=${encodeURIComponent(trimmedDistrictName)}`;
  }
  try {
    const data: PumpData[] = await safeFetch(apiUrl, undefined, 'Gagal mengambil data status pompa. Silakan coba lagi.');
    return data;
  } catch (error: any) {
    console.error(`API Error in fetchPumpStatusData: ${error.message}`);
    throw error;
  }
}

export async function fetchBmkgLatestQuake(): Promise<BmkgGempaData> {
  const url = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
  try {
    const data: BmkgGempaData = await safeFetch(url, { next: { revalidate: 60 } }, 'Gagal mengambil data gempa BMKG. Silakan coba lagi.');
    if (data && (data as any).Infogempa && (data as any).Infogempa.gempa) {
      return (data as any).Infogempa.gempa;
    }
    throw new UserFriendlyError('Format data gempa BMKG tidak valid.', new Error('Invalid BMKG earthquake data format.'));
  } catch (error: any) {
    console.error(`API Error in fetchBmkgLatestQuake: ${error.message}`);
    throw error;
  }
}

export async function fetchPetabencanaReports(
  hazardType: string = 'flood',
  timeframe: string = '1h',
): Promise<PetabencanaReport[]> {
  const baseUrl = getBaseUrl(); // MODIFIED to use getBaseUrl
  const apiUrl = `${baseUrl}/api/petabencana-proxy-new?hazardType=${hazardType}&timeframe=${timeframe}`;
  try {
    const responseData = await safeFetch<any>(apiUrl, { next: { revalidate: 60 } }, 'Gagal mengambil laporan PetaBencana.id. Silakan coba lagi.');

    // Access the features array from the result object
    const features = responseData?.result?.features;

    if (!Array.isArray(features)) {
      console.warn('PetaBencana.id proxy returned data without a features array or an empty features array:', responseData);
      return [];
    }
    return features;
  } catch (error: any) {
    console.error(`API Error in fetchPetabencanaReports: ${error.message}`);
    throw error;
  }
}

export async function geocodeLocation(
  query: string,
): Promise<NominatimResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query,
  )}&format=json&limit=1&countrycodes=id`;
  console.log(`[Geocoding API] Fetching from URL: ${url}`);

  try {
    const data: NominatimResult[] = await safeFetch(
      url,
      {
        headers: {
          'User-Agent': 'FloodzyApp/1.0 (devarahmat12334@gmail.com)', // Ganti dengan email Anda
        },
      },
      'Gagal mengidentifikasi lokasi. Silakan coba lagi.'
    );
    console.log(`[Geocoding API] Received data for '${query}':`, data);
    return data;
  } catch (error: any) {
    console.error(`API Error in geocodeLocation: ${error.message}`);
    throw error;
  }
}
