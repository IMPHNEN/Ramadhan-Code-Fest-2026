import Link from 'next/link';

export const metadata = {
    title: 'Kenapa Jakarta Sering Banjir? Analisis Hidrologi & Solusi | Floodzy Edukasi',
    description: 'Memahami penyebab banjir Jakarta dari perspektif hidrologi, penurunan tanah, dan curah hujan ekstrem. Pelajari cara membaca peringatan dini.',
};

export default function ArticlePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Link href="/edukasi" className="text-cyan-500 hover:text-cyan-400 mb-6 inline-block font-mono text-sm">
                    &larr; KEMBALI KE PUSAT EDUKASI
                </Link>

                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1 className="text-4xl font-bold mb-4 font-display">Kenapa Jakarta Sering Banjir?</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 font-mono">
                        <span>Oleh: Rahmat Yudi Burhanudin</span>
                        <span>•</span>
                        <span>Analisis Hidrologi</span>
                    </div>

                    <p className="lead text-xl text-slate-600 dark:text-slate-300 mb-8">
                        Banjir di Jakarta bukan sekadar masalah "hujan deras". Ini adalah kombinasi kompleks antara topografi alami, penurunan muka tanah, dan krisis iklim. Mari kita bedah datanya.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">1. Topografi: Mangkuk Alami</h2>
                    <p>
                        Secara geografis, 40% wilayah Jakarta berada di bawah permukaan laut. 13 sungai besar mengalir dari pegunungan di selatan (Bogor/Puncak) menuju muara di utara. Saat hujan deras terjadi di hulu, air meluncur deras ke Jakarta yang datarannya rendah. Jika air laut pasang (rob), air sungai tertahan dan meluap.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">2. Land Subsidence (Penurunan Tanah)</h2>
                    <p>
                        Jakarta tenggelam sekitar 1-15 cm per tahun akibat eksploitasi air tanah berlebihan. Hal ini membuat drainase gravitasi tidak lagi efektif. Air tidak bisa mengalir ke laut sendirian; harus dipompa. Inilah mengapa <Link href="/dashboard" className="text-cyan-500">Monitoring Pompa Air</Link> di Floodzy sangat krusial.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">3. Cuaca Ekstrem & Perubahan Iklim</h2>
                    <p>
                        Siklus hujan 5-tahunan kini datang lebih sering dengan intensitas lebih tinggi. Drainase kota yang didesain untuk curah hujan 100mm/hari seringkali kewalahan menghadapi hujan 300mm/hari.
                    </p>

                    <div className="bg-slate-100 dark:bg-slate-900 border-l-4 border-cyan-500 p-6 my-8 rounded-r-lg">
                        <h3 className="text-lg font-bold mb-2">Pentingnya Peringatan Dini</h3>
                        <p className="mb-4">
                            Karena faktor-faktor di atas sulit diubah dalam sekejap, kunci survival adalah <strong>informasi</strong>. Mengetahui TMA (Tinggi Muka Air) hulu naik 3 jam sebelum sampai di Jakarta memberi waktu emas untuk evakuasi.
                        </p>
                        <Link href="/dashboard" className="inline-block bg-cyan-600 text-white px-4 py-2 rounded font-bold hover:bg-cyan-700 transition">
                            Cek Dashboard Floodzy Sekarang
                        </Link>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Cara Kerja Floodzy</h2>
                    <p>
                        Floodzy menggunakan sensor IoT di pintu air utama dan data satelit untuk memprediksi potensi genangan. AI kami menganalisis pola hujan dan topografi untuk memberikan peringatan sebelum banjir terjadi.
                    </p>
                </article>
            </div>
        </div>
    );
}
