import { fetchBmkgLatestQuake } from '@/lib/api.client';

// SOLUSI: Tambahkan baris ini untuk mengaktifkan ISR (revalidasi setiap 5 menit)
export const revalidate = 300;
import { BmkgGempaData } from '@/lib/api';
import { DashboardClientPage } from '@/components/layout/DashboardClientPage';
import Footer from '@/components/layout/Footer';
import { generateMockWaterLevels, generateMockPumpStatus, generateMockAlerts } from '@/lib/mock-data';

export default async function DashboardPage() {
    // Fetch other data as usual
    let latestQuake: BmkgGempaData | null = null;
    let quakeError: string | null = null;
    try {
        latestQuake = await fetchBmkgLatestQuake();
    } catch (error: any) {
        quakeError = error.message;
        console.error('Error fetching BMKG quake data:', error);
    }

    // === LANGKAH 1: Gunakan fungsi mockup untuk menghasilkan data awal ===
    // Note: In a real app, this data would come from a database or a live API.
    const waterLevelPosts = generateMockWaterLevels(100);
    const pumpStatusData = generateMockPumpStatus(100);
    // Use the updated constant alerts for "realtime" feel + some random ones if needed
    // We prioritize the constants as they have the specific user-requested data
    const { FLOOD_MOCK_ALERTS } = await import('@/lib/constants');
    const realTimeAlerts = [...FLOOD_MOCK_ALERTS];

    // === LANGKAH 2: Kalkulasi Statistik Dinamis & Inovatif ===

    // Total Wilayah: Hitung jumlah kota/kabupaten unik dari semua infrastruktur
    const allLocations = [...waterLevelPosts.map(p => p.name), ...pumpStatusData.map(p => p.lokasi)];
    const uniqueRegions = new Set(allLocations.map(loc => loc?.split(',')[0].trim())).size;

    // Peringatan Aktif: Jumlah peringatan real-time yang sedang berlangsung
    const activeAlertsCount = realTimeAlerts.length;

    // Zona Banjir: Jumlah pos air yang statusnya tidak 'Normal'
    const floodZoneCount = waterLevelPosts.filter(p => p.status !== 'Normal').length;

    // Orang Berisiko (Inovasi): Estimasi jumlah orang yang terdampak dari semua peringatan aktif
    const peopleAtRisk = realTimeAlerts.reduce((total, alert) => {
        // In a real app, population data would come from a GIS database.
        const mockPopulationInArea = Math.floor(Math.random() * (5000 - 500 + 1) + 500);
        return total + mockPopulationInArea;
    }, 0);

    // === LANGKAH 3: Siapkan Objek Statistik untuk Dikirim ke Client ===
    const dashboardStats = {
        totalRegions: uniqueRegions,
        activeAlerts: activeAlertsCount,
        floodZones: floodZoneCount,
        peopleAtRisk: peopleAtRisk,
    };

    // Siapkan data akhir untuk dikirim ke komponen client
    const initialData = {
        stats: dashboardStats,
        waterLevelPosts,
        pumpStatusData,
        waterLevelError: null, // Not applicable for mock data
        pumpStatusError: null, // Not applicable for mock data
        latestQuake,
        quakeError,
        realTimeAlerts,
    };

    return (
        <>
            <DashboardClientPage initialData={initialData} />
            <Footer />
        </>
    );
}
