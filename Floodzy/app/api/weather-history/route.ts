import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const start = searchParams.get('start'); // Unix timestamp
  const end = searchParams.get('end');   // Unix timestamp

  if (!lat || !lon || !start || !end) {
    return NextResponse.json({ error: 'Missing latitude, longitude, start, or end parameters' }, { status: 400 });
  }

  const OPENWEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json({ error: 'OpenWeatherMap API key not configured' }, { status: 500 });
  }

  try {
    // OpenWeatherMap One Call API 3.0 for historical data
    // Note: This API requires a paid subscription for historical data beyond 5 days.
    // For free tier, you might need to use different endpoints or consider limitations.
    const url = `https://api.openweathermap.org/data/3.0/onecall/history?lat=${lat}&lon=${lon}&type=hour&dt=${start}&appid=${OPENWEATHER_API_KEY}`;
    
    // The 'end' parameter is not directly supported in the free tier history API for a range.
    // You might need to make multiple requests for each day/hour or use a different API if available.
    // For this example, we'll just fetch for the 'start' timestamp.

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('OpenWeatherMap API error:', data);
      return NextResponse.json({ error: data.message || 'Failed to fetch weather data' }, { status: response.status });
    }

    // Process the data to extract rainfall information
    // The structure of the response depends on the OpenWeatherMap API version and endpoint.
    // For One Call API, rainfall is typically in `hourly[i].rain['1h']`
    const rainfallData = data.hourly?.map((hour: any) => ({
      timestamp: hour.dt,
      rain: hour.rain?.['1h'] || 0, // Rainfall in mm for the last hour
    })) || [];

    return NextResponse.json(rainfallData);
  } catch (error) {
    console.error('Error in /api/weather-history:', error);
    return NextResponse.json({ error: `Internal server error: ${(error as Error).message}` }, { status: 500 });
  }
}