import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Status Banjir Jakarta Realtime & Lokasi Rawan | Floodzy',
    description: 'Peta banjir realtime Jakarta. Cek status pintu air Manggarai, titik rawan Ciliwung, kondisi pompa air, dan info banjir rob Jakarta Utara.',
};

export default function JakartaPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/edukasi" className="text-cyan-500 hover:text-cyan-400 mb-6 inline-block font-mono text-sm">
                    &larr; KEMBALI KE PUSAT EDUKASI
                </Link>

                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-4 font-display">Status Banjir Jakarta Realtime</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 font-mono">
                        <span>Kategori: Local Insight</span>
                        <span>•</span>
                        <span>Update: Hari Ini</span>
                    </div>

                    <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-8">
                        Jakarta adalah medan pertempuran hidrologi. Mengetahui titik lemah kota ini adalah kunci untuk bertahan dari musim hujan tahunan.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Sungai Ciliwung: Urat Nadi Banjir</h2>
                    <p>
                        Ciliwung membelah Jakarta dari Selatan ke Utara. Status Pintu Air <strong>Katulampa (Bogor)</strong>, <strong>Depok</strong>, dan <strong>Manggarai</strong> adalah trinitas suci pemantauan banjir kiriman.
                        <br />
                        <em>Rumus: Jika Katulampa SIAGA 1, air sampai di Manggarai dalam ±9-12 jam.</em>
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Titik Rawan & Genangan Rutin</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Jakarta Selatan:</strong> Kemang, Petogogan (Cekungan rendah, luapan Krukut).</li>
                        <li><strong>Jakarta Timur:</strong> Kampung Melayu, Bidara Cina (Bantaran Ciliwung).</li>
                        <li><strong>Jakarta Utara:</strong> Pluit, Muara Baru (Banjir Rob & Penurunan Tanah).</li>
                        <li><strong>Jakarta Barat:</strong> Green Garden, Rawa Buaya (Sistem drainase overload).</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Peran Rumah Pompa</h2>
                    <p>
                        Banyak area di Jakarta Utara permukaannya sudah di bawah laut/sungai. Air tidak bisa mengalir keluar secara alami. Rumah Pompa (Waduk Pluit, Ancol) bekerja 24 jam membuang air ke laut. Jika pompa mati, banjir tak terhindarkan.
                    </p>
                    <div className="my-4">
                        <Link href="/dashboard" className="text-cyan-500 hover:underline font-bold">
                            &rarr; Cek Status Operasional Pompa di Peta Floodzy
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">4. Solusi: Sumur Resapan & Naturalisasi?</h2>
                    <p>
                        Selain kanal banjir raksasa (BKT/BKB), solusi mikro seperti sumur resapan sedang digalakkan. Namun, solusi terbaik bagi warga adalah <strong>Kewaspadaan Berbasis Data</strong>.
                    </p>

                    <div className="mt-12 p-6 border border-slate-200 dark:border-slate-800 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Apakah Rumah Anda Aman?</h3>
                        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                            Gunakan fitur simulasi banjir di Floodzy untuk melihat radius genangan di area spesifik Anda.
                        </p>
                        <Link href="/dashboard" className="w-full block text-center bg-slate-900 dark:bg-slate-800 text-white py-3 rounded font-bold hover:bg-slate-800 transition">
                            Cek Radius Banjir
                        </Link>
                    </div>
                </article>
            </div>
        </div>
    );
}
