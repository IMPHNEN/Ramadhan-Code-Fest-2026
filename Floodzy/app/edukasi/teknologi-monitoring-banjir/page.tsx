import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Teknologi & Cara Baca Data Banjir: IoT, Sensor, & BPBD | Floodzy',
    description: 'Memahami cara kerja sensor IoT ketinggian air, perbedaan data Floodzy vs BPBD, dan cara membaca grafik level siaga banjir.',
};

export default function TechnologyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/edukasi" className="text-cyan-500 hover:text-cyan-400 mb-6 inline-block font-mono text-sm">
                    &larr; KEMBALI KE PUSAT EDUKASI
                </Link>

                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-4 font-display">Teknologi & Cara Baca Data Banjir</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 font-mono">
                        <span>Kategori: Tech</span>
                        <span>•</span>
                        <span>Waktu Baca: 6 Menit</span>
                    </div>

                    <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-8">
                        Data bukan sekadar angka. Di Floodzy, data diterjemahkan menjadi sinyal keselamatan. Mari membedah teknologi di balik peringatan dini banjir modern.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Bagaimana Sensor IoT Bekerja?</h2>
                    <p>
                        Floodzy menggunakan sensor ultrasonik yang dipasang di bawah jembatan atau pintu air. Sensor ini menembakkan gelombang suara ke permukaan air dan mengukur waktu pantulannya.
                        <br />
                        <strong>Keunggulan:</strong> Tidak tersentuh air (non-contact), jadi aman dari sampah hanyut. Data dikirim setiap 60 detik (Realtime) via jaringan LoRaWAN atau GSM.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Cara Membaca Status Pintu Air</h2>
                    <p>Pintu air memiliki 4 status siaga baku:</p>
                    <ul className="list-none space-y-3 pl-0">
                        <li className="flex items-center gap-4">
                            <span className="w-4 h-4 rounded-full bg-green-500 block"></span>
                            <span><strong>Normal (Siaga 4):</strong> Aman. Tidak ada potensi banjir.</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="w-4 h-4 rounded-full bg-yellow-400 block"></span>
                            <span><strong>Waspada (Siaga 3):</strong> Air mulai naik, warga bantaran sungai harus hati-hati.</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="w-4 h-4 rounded-full bg-orange-500 block"></span>
                            <span><strong>Kritis (Siaga 2):</strong> Persiapan evakuasi. Genangan mungkin mulai terjadi.</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <span className="w-4 h-4 rounded-full bg-red-600 block shadow-lg shadow-red-500/50 animate-pulse"></span>
                            <span><strong>Bencana (Siaga 1):</strong> Banjir besar pasti terjadi dalam hitungan menit/jam. <strong>EVAKUASI SEKARANG.</strong></span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. BPBD vs Floodzy: Apa Bedanya?</h2>
                    <p>
                        <strong>BPBD (Pemerintah):</strong> Data resmi, akurat, namun pelaporan seringkali manual/periodik (setiap jam).
                        <br />
                        <strong>Floodzy (Crowd & IoT):</strong> Data realtime (per menit), mencakup sensor mandiri warga, dan prediksi AI. Kami melengkapi data pemerintah dengan kecepatan.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Kenapa Latency Mematikan?</h2>
                    <p>
                        Dalam banjir bandang, air bisa naik 1 meter dalam 10 menit. Jika sistem pelaporan delay 30 menit, peringatan datang terlambat. Arsitektur Floodzy didesain untuk "Zero Latency" dari deteksi sensor hingga notifikasi di HP Anda.
                    </p>

                    <div className="bg-slate-900 text-white p-6 rounded-lg my-8 font-mono text-sm border border-slate-700">
                        <div>&gt;&gt; SYSTEM_STATUS: ONLINE</div>
                        <div className="text-green-400">&gt;&gt; SENSORS_ACTIVE: 98%</div>
                        <div className="text-cyan-400">&gt;&gt; PREDICTION_MODEL: RUNNING</div>
                    </div>
                </article>
            </div>
        </div>
    );
}
