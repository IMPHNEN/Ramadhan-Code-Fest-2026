import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('[API] Attempting to fetch historical incidents...');
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('historical_incidents')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[API] Supabase error:', error);
      throw new Error(error.message);
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} incidents.`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Catch block error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch historical incidents' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
