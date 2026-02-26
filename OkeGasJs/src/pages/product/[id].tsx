import React from "react";

export default function ProductDetail({ params }: { params: { id: string } }) {
  return (
    <div className="p-10 text-center font-sans">
      <h1 className="text-4xl font-bold mb-4">Product Detail</h1>
      <p className="text-2xl text-gray-600">
        Product ID:{" "}
        <span className="text-blue-500 font-mono">{params?.id}</span>
      </p>
      <div className="mt-8">
        <a href="/" className="text-blue-500 underline">
          Back Home
        </a>
      </div>
    </div>
  );
}
