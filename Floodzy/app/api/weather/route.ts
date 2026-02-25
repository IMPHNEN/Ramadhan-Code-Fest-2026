
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const lang = searchParams.get('lang') || 'id';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'OpenWeatherMap API Key not found' }, { status: 500 });
  }

  const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
  const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  const airPollutionUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';

  const commonParams = {
    lat,
    lon,
    appid: API_KEY,
    units: 'metric',
    lang: lang,
  };

  try {
    const [weatherResponse, forecastResponse, airPollutionResponse] = await Promise.all([
      axios.get(weatherUrl, { params: commonParams }),
      axios.get(forecastUrl, { params: commonParams }),
      axios.get(airPollutionUrl, { params: commonParams }),
    ]);

    const dailyForecasts = forecastResponse.data.list.filter(
      (forecast: any) => forecast.dt_txt.includes('12:00:00'),
    );

    let airQualityData = null;
    if (airPollutionResponse.data && airPollutionResponse.data.list && airPollutionResponse.data.list.length > 0) {
      const aqi = airPollutionResponse.data.list[0].main.aqi;
      const pm2_5 = airPollutionResponse.data.list[0].components.pm2_5;

      let level = "unavailable";
      let recommendation = "unavailableRec";

      if (aqi === 1) { level = "good"; recommendation = "goodRec"; }
      else if (aqi === 2) { level = "moderate"; recommendation = "moderateRec"; }
      else if (aqi === 3) { level = "unhealthy"; recommendation = "unhealthySensitiveRec"; } // Note: "unhealthySensitive" key in i18n
      else if (aqi === 4) { level = "unhealthy"; recommendation = "unhealthyRec"; }
      else if (aqi === 5) { level = "veryUnhealthy"; recommendation = "veryUnhealthyRec"; }

      // Additional check for hazardous if aqi > 5 (rare but good to handle)
      if (aqi > 5) { level = "hazardous"; recommendation = "hazardousRec"; }

      airQualityData = {
        aqi: aqi,
        level: level,
        pollutant: `PM2.5 (${pm2_5} µg/m³)` || "PM2.5",
        recommendation: recommendation
      };
    }

    const formattedData = {
      current: weatherResponse.data,
      daily: dailyForecasts,
      airQuality: airQualityData,
    };

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error('Error fetching weather data in API route:', error);
    const errorMessage =
      error.response?.data?.message ||
      'Gagal mengambil data cuaca. Coba lagi nanti.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
