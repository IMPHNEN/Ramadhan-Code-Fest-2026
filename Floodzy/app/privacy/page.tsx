export const metadata = {
    title: 'Kebijakan Privasi | Floodzy',
    description: 'Kebijakan privasi Floodzy mengenai penggunaan data lokasi dan cookie.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert">
                <h1>Kebijakan Privasi</h1>
                <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

                <h2>1. Pengumpulan Data Lokasi</h2>
                <p>
                    Floodzy menggunakan data lokasi Anda (GPS) semata-mata untuk menampilkan peringatan banjir di sekitar Anda.
                    Data ini bersifat anonim dan tidak disimpan secara permanen di server kami.
                </p>

                <h2>2. Data Sensor & IoT</h2>
                <p>
                    Data ketinggian air dan curah hujan yang kami tampilkan berasal dari sensor publik dan mitra kami.
                    Kami berupaya menjaga akurasi namun tidak bertanggung jawab atas keputusan yang diambil berdasarkan data tersebut.
                </p>

                <h2>3. Kontak</h2>
                <p>
                    Untuk pertanyaan mengenai privasi, silakan hubungi <a href="mailto:privacy@floodzy.id">privacy@floodzy.id</a>.
                </p>
            </div>
        </div>
    );
}
