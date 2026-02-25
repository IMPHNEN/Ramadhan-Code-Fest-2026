// Health check endpoint untuk debugging koneksi
import { NextResponse } from 'next/server';
import { supabaseServiceRole, fetchSupabaseDataWithRetry } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test basic response
    const basicTest = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Test Supabase connection
    let supabaseTest = null;
    try {
      const { data, error } = await fetchSupabaseDataWithRetry(
        (client) => client.from('provinces').select('province_code, province_name').limit(1),
        'provinces'
      );

      if (error) {
        supabaseTest = { status: 'error', message: error.message };
      } else {
        supabaseTest = { status: 'ok', sampleData: data };
      }
    } catch (supabaseError: any) {
      supabaseTest = { status: 'error', message: supabaseError.message };
    }

    return NextResponse.json({
      ...basicTest,
      supabase: supabaseTest,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasOpenWeatherKey: !!process.env.OPENWEATHER_API_KEY,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
