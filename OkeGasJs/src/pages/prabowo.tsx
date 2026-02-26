import React, { useEffect, useState } from "react";
import { Head } from "../lib/head";

export default function PrabowoPage() {
  const [showButton, setShowButton] = useState(true);

  // Modern browsers block autoplay with sound.
  // We can try to autoplay, but if it fails (due to policy), we show a button.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000); // If sound doesn't start or user wants to control, show button after 2s
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Oke Gas Party - Prabowo</title>
        <meta
          name="description"
          content="Joget Gemoy bersama Prabowo. Oke Gas Oke Gas!"
        />
      </Head>

      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-zinc-800">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="z-10 text-center p-0 bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-zinc-800 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
          {/* Card Header */}
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-2xl font-bold tracking-tighter text-white">
              OKE GAS
            </h1>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-6">
            <div className="relative group rounded-md overflow-hidden border border-zinc-800">
              <img
                src="/prabowo.png"
                alt="Prabowo Joget Gemoy"
                className="w-full h-auto object-cover opacity-90 transition-opacity hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-zinc-950/80 border border-zinc-800 rounded text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
                prabowo.png
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-medium text-emerald-400">
                  Hidup Jokowi
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          {showButton && (
            <div className="p-4 bg-zinc-900/80 border-t border-zinc-800">
              <button
                onClick={() => {
                  const iframe = document.getElementById(
                    "youtube-audio"
                  ) as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                }}
                className="w-full py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold rounded-md transition-colors focus:ring-2 focus:ring-zinc-500 focus:outline-none"
              >
                Unmute Sound 🔊
              </button>
            </div>
          )}
        </div>

        {/* Hidden Youtube Autoplay */}
        <div className="absolute invisible pointer-events-none w-0 h-0 overflow-hidden">
          <iframe
            id="youtube-audio"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/HquFbKYvWtI?autoplay=1&loop=1&playlist=HquFbKYvWtI&controls=0&start=10"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        <footer className="absolute bottom-6 text-zinc-600 text-xs font-mono">
          POWERED BY OKEGASJS
        </footer>
      </div>
    </>
  );
}
