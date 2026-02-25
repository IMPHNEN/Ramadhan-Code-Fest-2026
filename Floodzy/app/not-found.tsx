import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Halaman Tidak Ditemukan | Floodzy',
    description: 'Maaf, halaman yang Anda cari tidak dapat ditemukan.',
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-bold text-slate-800 dark:text-slate-900 absolute opacity-20 select-none">404</h1>

            <div className="z-10 relative space-y-6 max-w-lg">
                <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                    <span className="text-4xl">🌊</span>
                </div>

                <h2 className="text-3xl font-bold text-white font-display">Arus Salah Arah</h2>
                <p className="text-slate-400">
                    Seperti air yang tersesat, halaman yang Anda cari tidak ditemukan di server kami.
                    Mungkin sudah surut atau berpindah aliran.
                </p>

                <div className="pt-6">
                    <Link
                        href="/"
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-8 rounded-full transition duration-300 inline-block"
                    >
                        Kembali ke Dashboard Utama
                    </Link>
                </div>

                <div className="text-xs font-mono text-slate-600 mt-12">
                    ERROR_CODE: PAGE_NOT_FOUND_EXCEPTION
                </div>
            </div>
        </div>
    );
}
