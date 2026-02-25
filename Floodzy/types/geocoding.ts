export interface GeocodingResponse {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface ReverseGeocodingResponse {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
