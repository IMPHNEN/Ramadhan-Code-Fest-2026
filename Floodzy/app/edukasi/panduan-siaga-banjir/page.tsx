import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Panduan Siaga & Mitigasi Banjir: Evakuasi, Checklist, & Tips | Floodzy',
    description: 'Panduan lengkap siaga banjir. Checklist evakuasi keluarga, cara menyelamatkan dokumen, perbedaan banjir vs rob, dan langkah mitigasi bencana.',
};

export default function MitigationPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/edukasi" className="text-cyan-500 hover:text-cyan-400 mb-6 inline-block font-mono text-sm">
                    &larr; KEMBALI KE PUSAT EDUKASI
                </Link>

                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-4 font-display">Panduan Siaga & Mitigasi Banjir</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 font-mono">
                        <span>Kategori: Safety</span>
                        <span>•</span>
                        <span>Waktu Baca: 7 Menit</span>
                    </div>

                    <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-8">
                        Banjir sering datang mendadak. Kesiapan Anda dalam 10 menit pertama bisa menyelamatkan nyawa dan harta benda. Ini adalah panduan bertahan hidup versi Floodzy.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Apa yang Harus Dilakukan SEBELUM Banjir?</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Siapkan "Tas Siaga Bencana" (Go-Bag):</strong> Berisi dokumen penting (bungkus plastik), senter, baterai cadangan, P3K, makanan kering, dan air minum.</li>
                        <li><strong>Kenali Rute Evakuasi:</strong> Tentukan titik kumpul keluarga jika terpisah.</li>
                        <li><strong>Pantau Aplikasi Floodzy:</strong> Aktifkan notifikasi untuk mendapatkan peringatan dini 1-3 jam sebelum air sampai.</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Checklist "Evakuasi 3 Menit"</h2>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 my-4">
                        <p className="font-bold">Saat sirine berbunyi atau Status Siaga 1:</p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Matikan aliran listrik dari MCB utama (Paling Kritis!).</li>
                            <li>Amankan dokumen penting ke tempat tinggi/lantai 2.</li>
                            <li>Tutup lubang saluran pembuangan/toilet agar air tidak membalik.</li>
                            <li>Kunci rumah dan segera menuju titik evakuasi.</li>
                        </ol>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Memahami Jenis Banjir</h2>
                    <h3 className="text-xl font-bold mt-4 mb-2">Banjir Kiriman vs Banjir Lokal</h3>
                    <p>
                        <strong>Banjir Kiriman:</strong> Terjadi karena hujan deras di hulu (Bogor/Puncak). Air butuh waktu 6-9 jam sampai Jakarta. Bisa diprediksi dengan akurat.
                        <br />
                        <strong>Banjir Lokal:</strong> Hujan deras di lokasi Anda + drainase buruk. Air naik cepat dalam hitungan menit.
                    </p>

                    <h3 className="text-xl font-bold mt-4 mb-2">Banjir Rob</h3>
                    <p>
                        Naiknya permukaan air laut ke daratan akibat pasang surut. Biasanya terjadi di pesisir Jakarta Utara (Pluit, Muara Karang). Tidak tergantung hujan.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Pasca Banjir</h2>
                    <p>
                        Jangan langsung menyalakan listrik. Periksa instalasi kabel. Bersihkan lumpur secepatnya sebelum mengeras. Waspadai penyakit kulit (kutu air) dan Leptospirosis.
                    </p>

                    <div className="mt-12 p-6 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg text-center">
                        <h3 className="text-lg font-bold mb-2">Cek Status Siaga Bencana Sekarang</h3>
                        <p className="mb-4">Jangan menunggu air masuk rumah.</p>
                        <Link href="/dashboard" className="inline-block bg-cyan-600 text-white px-6 py-2 rounded-full font-bold hover:bg-cyan-700 transition">
                            Buka Dashboard Realtime
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
}
