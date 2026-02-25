'use client';

import React from 'react';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';
import { CombinedWeatherData, OpenWeatherMapCurrentResponse } from '@/lib/api';
import { useTheme } from 'next-themes';

interface WeatherMapIframeProps {
  selectedLocationCoords?: { lat: number; lng: number; name: string } | null;
  currentWeatherData?: CombinedWeatherData | null; // Use CombinedWeatherData
  loadingWeather?: boolean;
  weatherError?: string | null;
  height?: string;
}

export function WeatherMapIframe({
  selectedLocationCoords,
  currentWeatherData,
  loadingWeather,
  weatherError,
  height = '100%',
}: WeatherMapIframeProps) {
  // Gunakan hook useTheme untuk mendeteksi tema
  const { theme } = useTheme();

  /**
   * [OPTIMISASI]
   * Menggunakan React.useMemo untuk memoize (mengingat) hasil HTML.
   * Kode di dalamnya hanya akan dijalankan kembali jika salah satu dari
   * dependensi [selectedLocationCoords, currentWeatherData, dll.] berubah.
   * Ini secara signifikan meningkatkan performa dengan menghindari render ulang yang tidak perlu.
   */
  const dataUrl = React.useMemo(() => {
    // --- Variabel Dasar ---
    const lat = selectedLocationCoords?.lat || DEFAULT_MAP_CENTER[0];
    const lng = selectedLocationCoords?.lng || DEFAULT_MAP_CENTER[1];
    const zoom = selectedLocationCoords ? 12 : 5;
    const locationName = selectedLocationCoords?.name || 'Peta Indonesia';
    const hasValidCoords =
      selectedLocationCoords?.lat != null &&
      selectedLocationCoords?.lng != null;

    // Tentukan URL Tile Layer berdasarkan tema
    const isDark = theme === 'dark';
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const mapBackground = isDark ? '#334155' : '#aad3df';
    const bodyBackground = isDark ? '#1e293b' : '#ffffff';


    // --- Logika Konten Overlay Cuaca ---
    let weatherContentHtml = '';
    if (!hasValidCoords && selectedLocationCoords?.name) {
      weatherContentHtml = `<div class="weather-overlay"><div class="status-overlay"><span>Koordinat tidak ditemukan untuk ${locationName}.</span></div></div>`;
    } else if (loadingWeather) {
      weatherContentHtml = `<div class="weather-overlay"><div class="status-overlay loading"><div class="animate-spin"></div><span>Memuat cuaca...</span></div></div>`;
    } else if (weatherError) {
      weatherContentHtml = `<div class="weather-overlay"><div class="status-overlay error"><span>Error: ${weatherError}</span></div></div>`;
    } else if (currentWeatherData?.current) {
      // ... (Logic for emojis/colors same as before)
      const { weather, main } = currentWeatherData.current;
      const description = weather[0].description;
      const temperature = main.temp;
      const displayTemperature = `${Math.round(temperature)}°C`;

      let emoji = '☁️', bgColor = '#64748B', textColor = 'white';
      if (weather[0].icon?.startsWith('01')) { emoji = weather[0].icon === '01d' ? '☀️' : '🌙'; bgColor = weather[0].icon === '01d' ? '#FBBF24' : '#4F46E5'; textColor = 'black'; }
      else if (weather[0].icon?.startsWith('02')) { emoji = '🌤️'; bgColor = '#7DD3FC'; textColor = 'black'; }
      else if (weather[0].icon?.startsWith('03') || weather[0].icon?.startsWith('04')) { emoji = '☁️'; bgColor = '#94A3B8'; }
      else if (weather[0].icon?.startsWith('09') || weather[0].icon?.startsWith('10')) { emoji = '🌧️'; bgColor = '#3B82F6'; }
      else if (weather[0].icon?.startsWith('11')) { emoji = '⛈️'; bgColor = '#8B5CF6'; }
      else if (weather[0].icon?.startsWith('13')) { emoji = '🌨️'; bgColor = '#A5F3FC'; textColor = 'black'; }
      else if (weather[0].icon?.startsWith('50')) { emoji = '🌫️'; bgColor = '#D1D5DB'; textColor = 'black'; }

      weatherContentHtml = `
          <div class="weather-overlay">
            <div class="main-info">
              <div class="emoji-bg" style="background-color:${bgColor}; color:${textColor};">${emoji}</div>
              <div class="temp-group">
                <div class="temp">${displayTemperature}</div>
                <div class="desc">${description}</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="location-info">
              <div class="location-name">${locationName}</div>
              <div class="time-badge">Sekarang</div>
            </div>
          </div>
         `;
    } else {
      // No Data / Idle: Show NOTHING (Map only)
      weatherContentHtml = '';
    }

    // --- Template HTML Lengkap untuk Iframe ---
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <title>Peta Cuaca</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          /* CSS Reset & Body */
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bodyBackground}; overflow: hidden; }
          #map { height: 100%; width: 100%; background: ${mapBackground}; }
          .leaflet-control-zoom { border: 1px solid rgba(255,255,255,0.2) !important; }
          .leaflet-control-zoom a { background-color: rgba(0,0,0,0.7) !important; color: white !important; }
          .leaflet-control-zoom a:hover { background-color: rgba(0,0,0,0.9) !important; }
          .leaflet-bar { box-shadow: none !important; }

          /* Overlay Cuaca (Pill Shape) */
          .weather-overlay { 
            position: absolute; 
            top: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            z-index: 1000; 
            background: rgba(28, 37, 51, 0.9); 
            backdrop-filter: blur(12px); 
            -webkit-backdrop-filter: blur(12px); 
            color: white; 
            padding: 8px 24px; 
            border-radius: 50px; 
            border: 1px solid rgba(255, 255, 255, 0.15); 
            display: flex; 
            align-items: center; 
            gap: 16px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            white-space: nowrap;
          }
          .main-info { display: flex; align-items: center; gap: 12px; }
          .emoji-bg { 
            font-size: 28px; 
            width: auto; 
            height: auto; 
            background: transparent !important; /* Override background */
            display: flex; 
            align-items: center; 
            justify-content: center; 
          }
          .temp-group { display: flex; flex-direction: column; align-items: flex-start; }
          .temp { font-size: 24px; font-weight: 700; color: white; line-height: 1; }
          .desc { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-top: 2px; }
          
          .divider { width: 1px; height: 32px; background: rgba(255,255,255,0.15); }

          .location-info { text-align: left; }
          .location-name { font-size: 14px; font-weight: 600; color: white; }
          .time-badge { 
             font-size: 10px; 
             color: #60a5fa; 
             font-weight: 600; 
             background: rgba(59, 130, 246, 0.15); 
             padding: 2px 6px; 
             border-radius: 4px; 
             display: inline-block;
             margin-top: 2px;
          }

          .status-overlay { width: 100%; text-align: center; color: #cbd5e1; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .status-overlay.error { color: #f87171; }
          
          /* Tombol Kontrol Layer */
          .weather-controls { position: absolute; bottom: 10px; right: 10px; z-index: 1000; display: flex; flex-direction: column; gap: 6px; }
          .weather-control-btn { background: rgba(28, 37, 51, 0.8); color: white; border: 1px solid rgba(255, 255, 255, 0.1); padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px; }
          .weather-control-btn:hover { background: rgba(0,0,0,0.9); border-color: rgba(255, 255, 255, 0.3); }
          .weather-control-btn.active { background: #3b82f6; border-color: #3b82f6; }
          
          /* Animasi & Ikon */
          .animate-spin { animation: spin 1s linear infinite; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }


          /* Unified Layer Control Styles */
          .weather-controls { position: absolute; bottom: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; pointer-events: none; }
          .weather-controls > * { pointer-events: auto; }
          
          .layer-btn {
            background: rgba(28, 37, 51, 0.9);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px 16px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            transition: all 0.2s;
          }
          .layer-btn:hover { transform: translateY(-2px); background: rgba(28, 37, 51, 1); }

          .layer-menu {
            background: rgba(28, 37, 51, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 140px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
            margin-bottom: 5px;
          }
          .layer-menu.open { opacity: 1; visibility: visible; transform: translateY(0); }

          .menu-header { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding: 4px 8px 8px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 4px; }

          .menu-item { background: transparent; border: none; color: white; padding: 8px 12px; border-radius: 8px; font-size: 13px; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.2s; }
          .menu-item:hover { background: rgba(255, 255, 255, 0.1); }
          .menu-item.active { background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-weight: 500; }
          .menu-item span { width: 20px; text-align: center; }

          /* Mobile Responsiveness */
          @media (max-width: 600px) {
            /* Overlay adjustments */
            .weather-overlay {
              top: 12px;
              padding: 6px 16px;
              gap: 12px;
            }
            .emoji-bg { font-size: 20px; }
            .temp { font-size: 18px; }
            .location-name { font-size: 12px; }
            .desc, .time-badge { font-size: 9px; }

            /* Controls adjustments */
            .weather-controls { bottom: 12px; right: 12px; }
            
            .layer-btn {
              padding: 8px 12px;
              font-size: 12px;
            }
            
            .layer-menu {
              width: 120px;
              padding: 6px;
            }
            
            .menu-item {
              padding: 6px 10px;
              font-size: 11px;
              gap: 8px;
            }
            
            .menu-header {
              font-size: 10px;
              padding: 4px 6px 6px;
            }

            /* Hide location info and divider on mobile to prevent clutter/overlap */
            .location-info, .divider {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        ${weatherContentHtml}

          <!-- Unified Layer Control -->
          <div class="weather-controls">
            <div id="layer-menu" class="layer-menu">
               <div class="menu-header">Layer Cuaca</div>
               <button class="menu-item active" onclick="toggleLayer('clouds', this)"><span>☁️</span> Awan</button>
               <button class="menu-item" onclick="toggleLayer('precip', this)"><span>🌧️</span> Hujan</button>
               <button class="menu-item" onclick="toggleLayer('temp', this)"><span>🌡️</span> Suhu</button>
               <button class="menu-item" onclick="toggleLayer('pressure', this)"><span>📊</span> Tekanan</button>
               <button class="menu-item" onclick="toggleLayer('wind', this)"><span>💨</span> Angin</button>
            </div>
            <button id="layer-btn" class="layer-btn" onclick="toggleMenu()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span>Layer</span>
            </button>
          </div>

          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <script>
            const map = L.map('map', { center: [${lat}, ${lng}], zoom: ${zoom}, zoomControl: false, attributionControl: false });
            L.tileLayer('${tileUrl}', { attribution: '© OpenStreetMap, © CartoDB', maxZoom: 19 }).addTo(map);
            L.control.zoom({ position: 'bottomleft' }).addTo(map);

            const layers = {
              clouds: L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}', { opacity: 0.8 }),
              precip: L.tileLayer('https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}', { opacity: 0.8 }),
              temp: L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}', { opacity: 0.6 }),
              pressure: L.tileLayer('https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}', { opacity: 0.6 }),
              wind: L.tileLayer('https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}', { opacity: 0.6 })
            };

            let activeLayerName = 'clouds';
            layers.clouds.addTo(map);

            function toggleMenu() { document.getElementById('layer-menu').classList.toggle('open'); }
            
            document.addEventListener('click', (e) => {
              const menu = document.getElementById('layer-menu');
              const btn = document.getElementById('layer-btn');
              if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.remove('open');
            });

            function toggleLayer(name, btn) {
              if (activeLayerName && layers[activeLayerName]) map.removeLayer(layers[activeLayerName]);
              if (layers[name]) { layers[name].addTo(map); activeLayerName = name; }
              document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
              btn.classList.add('active');
              toggleMenu();
            }

            const hasLocation = ${hasValidCoords};
            if (hasLocation) {
               const customIcon = L.divIcon({ className: 'custom-pin', html: '<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
               L.marker([${lat}, ${lng}], { icon: customIcon }).addTo(map);
            }
          </script>
            

      </body>
      </html>
    `;
    // Meng-encode seluruh HTML menjadi format data URL
    return `data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`;
  }, [
    selectedLocationCoords,
    currentWeatherData,
    loadingWeather,
    weatherError,
    theme, // Add theme dependency
  ]);

  return (
    <div
      className="w-full h-full rounded-lg border border-slate-700/50 relative overflow-hidden bg-slate-800 shadow-lg"
      style={{ height: height }}
    >
      <iframe
        /**
         * [OPTIMISASI]
         * Menggunakan dataUrl sebagai `key` memastikan bahwa iframe akan
         * benar-benar di-render ulang oleh React hanya saat kontennya berubah.
         */
        key={dataUrl}
        src={dataUrl}
        className="w-full h-full border-0"
        title="Peta Cuaca Interaktif"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
