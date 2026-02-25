import { WaterLevelPost, PumpData } from '@/lib/api';
import { FloodAlert } from '@/types';

// Helper data and functions
const waterLevelNames = [
  'Bendung Katulampa', 'Pos Depok', 'Pintu Air Manggarai', 'Pos Krukut Hulu',
  'Pintu Air Karet', 'Pos Angke Hulu', 'Pos Cipinang Hulu', 'Pintu Air Pulo Gadung'
];
const pumpNames = [
  'Pompa Ancol', 'Pompa Pluit', 'Pompa Cideng', 'Pompa Teluk Gong',
  'Pompa Waduk Melati', 'Pompa Pasar Ikan', 'Pompa Muara Angke', 'Pompa Sunter'
];
const locations = ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Selatan', 'Jakarta Timur', 'Depok', 'Bogor', 'Tangerang', 'Bekasi'];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomFloat = (min: number, max: number, decimals: number) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

// Exportable mock data generation functions

export function generateMockWaterLevels(count: number): WaterLevelPost[] {
  const data: WaterLevelPost[] = [];
  const statuses = ['Normal', 'Siaga 3', 'Siaga 2', 'Bahaya'];
  for (let i = 0; i < count; i++) {
    const status = getRandomElement(statuses);
    let water_level;
    switch (status) {
      case 'Bahaya': water_level = getRandomFloat(2.5, 4.0, 2); break;
      case 'Siaga 2': water_level = getRandomFloat(2.0, 2.49, 2); break;
      case 'Siaga 3': water_level = getRandomFloat(1.5, 1.99, 2); break;
      default: water_level = getRandomFloat(0.5, 1.49, 2);
    }
    data.push({
      id: String(i + 1),
      name: `${getRandomElement(waterLevelNames)} #${i + 1}`,
      lat: getRandomFloat(-6.1, -6.3, 4),
      lon: getRandomFloat(106.7, 106.9, 4),
      water_level: water_level,
      unit: 'm',
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toISOString(),
      status: status,
    });
  }
  return data;
}

export function generateMockPumpStatus(count: number): PumpData[] {
  const data: PumpData[] = [];
  const conditions = ['Aktif', 'Aktif', 'Aktif', 'Offline', 'Maintenance']; // More likely to be active
  for (let i = 0; i < count; i++) {
    data.push({
      id: String(i + 1),
      nama_infrastruktur: `${getRandomElement(pumpNames)} #${i + 1}`,
      jenis_infrastruktur: 'Rumah Pompa',
      tipe_hidrologi: getRandomElement(['Sungai', 'Danau', 'Laut', 'Drainase']),
      kondisi_bangunan: getRandomElement(conditions),
      latitude: getRandomFloat(-6.1, -6.3, 4),
      longitude: getRandomFloat(106.7, 106.9, 4),
      lokasi: getRandomElement(locations),
      status_pompa: [], // Keep it simple for now
      updated_at: Date.now() - Math.random() * 1000 * 60 * 120,
    });
  }
  return data;
}

export function generateMockAlerts(): FloodAlert[] {
  const alertTitles = [
    'Pintu Air Manggarai Status Bahaya',
    'Pompa Pluit Mengalami Gangguan',
    'Pos Depok Status Siaga 3',
    'Bendung Katulampa Siaga 2',
    'Angin Kencang di Pesisir Utara',
    'Gempa M 4.5 Guncang Banten'
  ];
  const alertMessages = [
    'Ketinggian air telah melampaui batas bahaya. Warga di sekitar bantaran sungai diharap waspada.',
    'Satu dari tiga pompa di Pluit sedang dalam perbaikan. Potensi genangan di area sekitar.',
    'Terjadi kenaikan debit air di Pos Pantau Depok. Waspada potensi banjir kiriman.',
    'Debit air meningkat tajam akibat hujan di hulu. Banjir kiriman diperkirakan tiba dalam 6 jam.',
    'Kecepatan angin mencapai 40 km/jam. Nelayan diharap tidak melaut.',
    'Pusat gempa di laut, tidak berpotensi tsunami namun dirasakan di beberapa wilayah.'
  ];
  const alertTitlesEn: Record<string, string> = {
    'Pintu Air Manggarai Status Bahaya': 'Manggarai Water Gate Danger Status',
    'Pompa Pluit Mengalami Gangguan': 'Pluit Pump Malfunction',
    'Pos Depok Status Siaga 3': 'Depok Post Alert Level 3',
    'Bendung Katulampa Siaga 2': 'Katulampa Weir Alert Level 2',
    'Angin Kencang di Pesisir Utara': 'Strong Winds on North Coast',
    'Gempa M 4.5 Guncang Banten': 'M 4.5 Earthquake Shakes Banten'
  };

  const alertMessagesEn: Record<string, string> = {
    'Ketinggian air telah melampaui batas bahaya. Warga di sekitar bantaran sungai diharap waspada.': 'Water level has exceeded danger limits. Residents along the riverbank are advised to be vigilant.',
    'Satu dari tiga pompa di Pluit sedang dalam perbaikan. Potensi genangan di area sekitar.': 'One of three pumps in Pluit is under maintenance. Potential inundation in surrounding areas.',
    'Terjadi kenaikan debit air di Pos Pantau Depok. Waspada potensi banjir kiriman.': 'Increased water discharge at Depok Monitoring Post. Watch out for potential potential flood shipments.',
    'Debit air meningkat tajam akibat hujan di hulu. Banjir kiriman diperkirakan tiba dalam 6 jam.': 'Water discharge increased sharply due to rain upstream. Flood shipment expected to arrive in 6 hours.',
    'Kecepatan angin mencapai 40 km/jam. Nelayan diharap tidak melaut.': 'Wind speed reached 40 km/h. Fishermen are advised not to go to sea.',
    'Pusat gempa di laut, tidak berpotensi tsunami namun dirasakan di beberapa wilayah.': 'Earthquake epicenter at sea, no tsunami potential but felt in several areas.'
  };

  const levels = ['danger', 'warning', 'info'];

  const count = 3; // Generate exactly 3 alerts
  const alerts: FloodAlert[] = [];
  const usedTitles = new Set();

  // Ensure we don't get stuck in an infinite loop if count > available titles
  const uniqueTitles = Array.from(new Set(alertTitles));

  for (let i = 0; i < count; i++) {
    let title = getRandomElement(uniqueTitles);
    while (usedTitles.has(title)) {
      title = getRandomElement(uniqueTitles);
    }
    usedTitles.add(title);

    const message = getRandomElement(alertMessages);

    alerts.push({
      id: (i + 1).toString() + Date.now(), // More unique ID
      regionId: 'jakarta',
      level: getRandomElement(levels) as 'danger' | 'warning' | 'info',
      title: title,
      titleEn: alertTitlesEn[title] || title,
      message: message,
      messageEn: alertMessagesEn[message] || message,
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 5).toISOString(), // More recent
      isActive: true,
      affectedAreas: [getRandomElement(locations)],
      actions: ['Pantau informasi secara berkala'],
      coordinates: [getRandomFloat(-6.1, -6.3, 4), getRandomFloat(106.7, 106.9, 4)],
    });
  }
  return alerts;
}