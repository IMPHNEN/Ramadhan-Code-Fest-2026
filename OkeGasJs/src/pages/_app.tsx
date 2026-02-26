import React from "react";

export default function App({ Component, pageProps }: any) {
  return (
    <html lang={pageProps.lang || "id"}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OkeGas JS #HIDUPJOKOWI</title>
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
      <body className="bg-[#0A0A0A] text-white min-h-screen relative selection:bg-emerald-500/30">
        <Component {...pageProps} />
      </body>
    </html>
  );
}
