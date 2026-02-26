import React from "react";
import { Link } from "../lib/link";
import { translations } from "../data/lang";

export default function Page({ lang = "id" }: { lang?: "id" | "en" }) {
  const t = translations[lang as keyof typeof translations] || translations.id;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <a
          href={`/?lang=${t.langCode}`}
          className="bg-white/10 hover:bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/5"
        >
          {t.langLabel}
        </a>
      </div>

      <div className="max-w-2xl w-full">
        <div className="glass rounded-2xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-500">
          <div className="mb-8 relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500 blur-[20px] opacity-20"></div>
            <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400">
            {t.title}
          </h1>

          <p className="text-gray-400 text-lg mb-8 font-light">
            {t.subtitle} <br className="hidden md:block" />
            {t.success}
          </p>

          <div className="mb-8 flex justify-center gap-4">
            <Link
              href="/prabowo"
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full text-white font-bold hover:scale-105 transition-transform shadow-lg"
            >
              🚀 Go to Prabowo (SPA Navigation)
            </Link>
          </div>

          <div className="text-left bg-black/50 rounded-lg p-4 mb-8 border border-white/5 font-mono text-sm relative group/code">
            <div className="flex gap-2 absolute top-4 right-4 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <p className="text-gray-500 mb-2">// {t.edit}</p>
            <div className="flex items-center text-gray-300">
              <span className="text-emerald-500 mr-2">➜</span>
              <span>src/pages/index.tsx</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-emerald-50 transition-colors w-full md:w-auto"
            >
              {t.docs}
            </a>
            <a
              href="https://github.com"
              target="_blank"
              className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-semibold transition-all w-full md:w-auto flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 w-full p-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm pointer-events-none">
          <div className="pointer-events-auto mb-4 md:mb-0">
            <span className="opacity-75">Made by </span>
            <span className="text-emerald-400 font-semibold">
              Dzikri Maulana
            </span>
          </div>

          <div className="flex items-center gap-4 pointer-events-auto">
            <a
              href="https://github.com"
              target="_blank"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>
            <a
              href="https://npmjs.com"
              target="_blank"
              className="hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.334v-4h-1.333v4H17.335V8.667h5.332v5.331zM10.665 10H12v2.667h-1.335V10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
