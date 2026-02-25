// app/api/petabencana-proxy/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hazardType = searchParams.get('hazardType') || 'flood';
  const timeframe = searchParams.get('timeframe') || '24h';

  // Ambil API Key dari environment variable jika PetaBencana.id membutuhkannya
  // Pastikan Anda menambahkan PETABENCANA_API_KEY di file .env.local Anda
  // const PETABENCANA_API_KEY = process.env.PETABENCANA_API_KEY; // Dikomentari untuk debugging 403

  const timeperiodMap: { [key: string]: number } = {
    '24h': 86400,
    '3d': 259200,
  };
  const timeperiod = timeperiodMap[timeframe] || 86400; // Default to 24h if timeframe is not recognized

  let apiUrl = `https://api.petabencana.id/reports?disaster=${hazardType}&timeperiod=${timeperiod}&geoformat=geojson`;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store', // Pastikan data selalu terbaru
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Floodzy/1.0', // Updated User-Agent
        // ...(PETABENCANA_API_KEY ? { Authorization: `Bearer ${PETABENCANA_API_KEY}` } : {}), // Dikomentari untuk debugging 403
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Tambah guard untuk 403 "Missing Authentication Token"
      if (response.status === 403 && errorText.includes("Missing Authentication Token")) {
        console.error(`PetaBencana 403 Error: Likely wrong path or method. URL: ${apiUrl}, Body: ${errorText}`);
        return NextResponse.json(
          {
            error: `PetaBencana API 403: Likely wrong path or method. Please check URL and HTTP method.`, 
            details: errorText,
            url: apiUrl
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          error: `Failed to fetch from PetaBencana.id: ${response.status} - ${errorText}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in PetaBencana proxy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
