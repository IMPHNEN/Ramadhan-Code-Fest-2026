// app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from 'react-hot-toast';
import { AlertCountProvider } from '@/components/contexts/AlertCountContext';
import 'leaflet/dist/leaflet.css';
import ReactQueryProvider from '@/components/providers/ReactQueryProvider';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
import { LanguageProvider } from '@/src/context/LanguageContext';

// font
const inter = Inter({ subsets: ['latin'] });

// ✅ Konfigurasi disesuaikan dengan file yang ada
export const metadata = {
  metadataBase: new URL('https://floodzy.id'),
  title: "Floodzy",
  description: "Real-time flood detection and alert system",
  icons: {
    icon: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512' },
    ],
    apple: { url: '/apple-icon.png' },
  },
  verification: {
    google: 'od3kGfaYj9zBkKYrLnZFTFlynJDYt9dDxa22ivRHMtQ',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950`}>
        <ReactQueryProvider>
          <ThemeProvider>
            <AlertCountProvider>
              <LanguageProvider>
                <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
              </LanguageProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </AlertCountProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

