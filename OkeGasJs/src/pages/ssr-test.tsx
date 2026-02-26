import React from "react";

export async function getServerSideProps(context: any) {
  // Simulate API call
  const random = Math.floor(Math.random() * 100);

  return {
    props: {
      serverTime: Date.now(),
      randomValue: random,
      message: "Data fetched from server!",
    },
  };
}

export default function SSRTest(props: any) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-4">SSR Test Page</h1>
      <div className="glass p-8 rounded-xl max-w-md w-full">
        <p className="text-emerald-400 mb-2">{props.message}</p>
        <div className="mb-4">
          <span className="text-gray-400">Server Time:</span>
          <br />
          <code className="bg-black/30 px-2 py-1 rounded">
            {props.serverTime}
          </code>
        </div>
        <div>
          <span className="text-gray-400">Random Value:</span>
          <br />
          <code className="text-2xl font-mono text-yellow-400">
            {props.randomValue}
          </code>
        </div>
      </div>
      <p className="mt-8 text-gray-500 text-sm">Refresh page to see new data</p>
    </div>
  );
}
