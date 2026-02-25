import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[API Alerts] Attempting to fetch alerts...');
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Alerts] Supabase error:', error);
      throw new Error(error.message);
    }

    console.log(`[API Alerts] Successfully fetched ${data?.length || 0} alerts.`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Alerts] Catch block error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch alerts' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
