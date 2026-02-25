// src/app/api/regions/route.ts
import { NextResponse } from 'next/server';
import { fetchRegionsServer } from '@/lib/api.server';

export const runtime = 'nodejs';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // ganti * ke 'http://localhost:3001' kalau mau spesifik
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as
      | 'provinces'
      | 'regencies'
      | 'districts'
      | 'villages';
    const parentCode = searchParams.get('parentCode');

    if (!type) {
      return NextResponse.json(
        { error: 'Missing region type' },
        { status: 400, headers: corsHeaders() },
      );
    }

    const data = await fetchRegionsServer(type, parentCode || undefined);
    return NextResponse.json(data, { headers: corsHeaders() });
  } catch (error: any) {
    console.error('API regions error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders() },
    );
  }
}
