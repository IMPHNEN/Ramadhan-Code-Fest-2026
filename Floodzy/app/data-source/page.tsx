import Link from 'next/link';

export const metadata = {
    title: 'Sumber Data & Teknologi | Floodzy',
    description: 'Transparansi sumber data sensor IoT dan API Floodzy.',
};

export default function DataSourcePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6 font-display">Sumber Data & Teknologi</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-cyan-500">📡</span> Sensor IoT Independen
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Floodzy mengoperasikan jaringan sensor ultrasonik mandiri yang dipasang di titik-titik rawan banjir (Komunitas & Mitra).
                            Data dikirim setiap 60 detik via LoRaWAN/GSM.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm font-mono">
                            Update Frequency: Realtime (&lt; 1 min)
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-cyan-500">☁️</span> BMKG & Satelit
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Data cuaca makro, peringatan dini gempa, dan citra satelit diperoleh melalui integrasi API publik BMKG dan OpenWeatherMap.
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm font-mono">
                            Update Frequency: 15-60 min
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="mb-4">Ingin berkontribusi data atau pasang sensor?</p>
                    <Link href="/contact" className="text-cyan-500 font-bold hover:underline">
                        Hubungi Tim Teknis &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
