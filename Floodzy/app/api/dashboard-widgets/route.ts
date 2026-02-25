import { NextResponse } from 'next/server';

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key
const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHERMAP_GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const locationName = searchParams.get('locationName'); // To display in UI

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
  }

  let weatherSummary = {};
  let airQuality = {};

  try {
    // Fetch current weather
    const weatherResponse = await fetch(`${OPENWEATHERMAP_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`, { next: { revalidate: 0 } });
    const weatherData = await weatherResponse.json();

    if (weatherResponse.ok) {
      weatherSummary = {
        location: locationName || weatherData.name,
        current: {
          temperature: Math.round(weatherData.main.temp),
          condition: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon // OpenWeatherMap icon code
        },
        // OpenWeatherMap's free tier doesn't provide hourly forecast directly in this endpoint.
        // For a simple forecast, we can use the 5-day / 3-hour forecast endpoint, but that adds complexity.
        // For now, we'll keep the forecast static or derive a very simple one.
        forecast: [
          { time: "13:00", temperature: Math.round(weatherData.main.temp + 2), condition: "Cerah" }, // Mocked for now
          { time: "16:00", temperature: Math.round(weatherData.main.temp - 1), condition: "Hujan Ringan" }, // Mocked for now
          { time: "19:00", temperature: Math.round(weatherData.main.temp - 3), condition: "Berawan" } // Mocked for now
        ]
      };
    } else {
      console.error('OpenWeatherMap weather error:', weatherData);
    }

    // Fetch air pollution data
    const airPollutionResponse = await fetch(`${OPENWEATHERMAP_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}`, { next: { revalidate: 0 } });
    const airPollutionData = await airPollutionResponse.json();

    if (airPollutionResponse.ok && airPollutionData.list && airPollutionData.list.length > 0) {
      const aqi = airPollutionData.list[0].main.aqi;
      const pm2_5 = airPollutionData.list[0].components.pm2_5;

      let level = "Tidak Diketahui";
      let recommendation = "Informasi kualitas udara tidak tersedia.";

      // AQI levels based on common standards (e.g., US EPA)
      if (aqi === 1) { level = "Baik"; recommendation = "Nikmati aktivitas di luar ruangan."; }
      else if (aqi === 2) { level = "Sedang"; recommendation = "Kurangi aktivitas berat di luar ruangan jika Anda sensitif."; }
      else if (aqi === 3) { level = "Tidak Sehat bagi Kelompok Sensitif"; recommendation = "Kelompok sensitif harus mengurangi aktivitas di luar ruangan."; }
      else if (aqi === 4) { level = "Tidak Sehat"; recommendation = "Semua orang harus mengurangi aktivitas di luar ruangan."; }
      else if (aqi === 5) { level = "Sangat Tidak Sehat"; recommendation = "Hindari semua aktivitas di luar ruangan."; }

      airQuality = {
        aqi: aqi,
        level: level,
        pollutant: `PM2.5 (${pm2_5} µg/m³)` || "PM2.5", // Display PM2.5 value
        recommendation: recommendation
      };
    } else {
      console.error('OpenWeatherMap air pollution error:', airPollutionData);
    }

  } catch (error) {
    console.error('Error fetching data from OpenWeatherMap:', error);
    return NextResponse.json({ error: 'Failed to fetch weather or air quality data.' }, { status: 500 });
  }

  return NextResponse.json({ weatherSummary, airQuality });
}
