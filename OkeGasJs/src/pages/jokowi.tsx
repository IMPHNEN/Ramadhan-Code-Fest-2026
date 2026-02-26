import React from "react";
import { Head } from "../lib/head";

export default function JokowiPage() {
  return (
    <>
      <Head>
        <title>Profil Jokowi - OkeGasJS</title>
        <meta
          name="description"
          content="Halaman profil Presiden Jokowi dengan fitur Dynamic Head OkeGasJS."
        />
        <meta property="og:title" content="Jokowi Profile" />
      </Head>
      <div className="p-10 bg-gray-900 min-h-screen text-white flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-4">Jokowi Dodo</h1>
      </div>
    </>
  );
}
