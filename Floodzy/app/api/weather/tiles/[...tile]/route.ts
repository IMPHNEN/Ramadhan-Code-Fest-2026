import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: {
    tile: string[];
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const { params } = context;
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  if (!apiKey) {
    return new Response('API key is not configured', { status: 500 });
  }

  const tilePath = params.tile.join('/');
  const externalUrl = `https://tile.openweathermap.org/map/${tilePath}?appid=${apiKey}`;

  try {
    const response = await fetch(externalUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      return new Response(response.statusText, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching weather tile:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
