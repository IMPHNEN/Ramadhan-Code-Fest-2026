import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: Use Edge if preferred, or remove for Node.js

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
    }

    const apiKey = process.env.WAQI_API_TOKEN;

    // Graceful fallback if no token (for dev/demo purposes)
    if (!apiKey) {
        console.warn("WAQI_API_TOKEN is not set. Returning mock data.");
        return NextResponse.json({
            status: 'ok',
            data: {
                aqi: 42,
                idx: 0,
                attributions: [],
                city: { geo: [Number(lat), Number(lon)], name: 'Demo Location (No Token)', url: '' },
                dominentpol: 'pm25',
                iaqi: { pm25: { v: 42 } },
                time: { s: new Date().toISOString(), tz: '+07:00', v: Date.now() / 1000 }
            }
        });
    }

    try {
        const externalUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;

        // Fetch with next.js caching (5 minutes)
        const res = await fetch(externalUrl, {
            next: { revalidate: 300 }
        });

        if (!res.ok) {
            throw new Error(`WAQI API error: ${res.statusText}`);
        }

        const data = await res.json();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            }
        });

    } catch (error) {
        console.error('AQI Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch AQI data' }, { status: 500 });
    }
}
