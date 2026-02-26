import React from "react";
import { translations } from "../data/lang";

export default function NotFound({ lang = "id" }: { lang?: "id" | "en" }) {
  const t = translations[lang as keyof typeof translations] || translations.id;

  return (
    <html lang={lang}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{`404 - ${t.notFoundTitle}`}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { font-family: 'Outfit', sans-serif; }
            .glass {
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.05);
            }
          `,
          }}
        />
      </head>
      <body className="bg-[#0A0A0A] text-white min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-red-500/30">
        {/* Background Gradients (Redish for Error) */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-2xl w-full">
          {/* Main Card */}
          <div className="glass rounded-2xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden group hover:border-red-500/20 transition-all duration-500">
            {/* 404 Icon */}
            <div className="mb-8 relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 blur-[20px] opacity-20"></div>
              <div className="relative w-20 h-20 bg-gradient-to-tr from-red-500 to-orange-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <span className="text-4xl font-bold text-white">?</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-200 to-yellow-400">
              404
            </h1>

            <h2 className="text-2xl font-semibold text-white mb-4">
              {t.notFoundTitle}
            </h2>

            <p className="text-gray-400 text-lg mb-8 font-light">
              {t.pageNotFound}
            </p>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <a
                href={`/?lang=${lang}`}
                className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-emerald-50 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                {t.backHome}
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} OkeGasJS Framework.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
