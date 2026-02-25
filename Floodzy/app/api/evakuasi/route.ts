import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { EvacuationLocation } from '@/types'; // Import the updated type

export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log('[API Evakuasi] Request received.');

  try {
    console.log(
      '[API Evakuasi] Attempting to fetch from evacuation_locations...',
    );
    const { data, error } = await supabaseAdmin.from('evacuation_locations').select('*');

    if (error) {
      console.error('[API Evakuasi] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mocking the new fields for demonstration purposes
    const mockedData: EvacuationLocation[] = data.map((item: any) => ({
      ...item,
      operational_status: (['Buka', 'Penuh', 'Tutup Sementara', 'Buka dan Menerima Pengungsi'])[Math.floor(Math.random() * 4)],
      essential_services: {
        clean_water: (['Tersedia', 'Terbatas', 'Tidak Tersedia'])[Math.floor(Math.random() * 3)],
        electricity: (['Tersedia', 'Terbatas', 'Tidak Tersedia'])[Math.floor(Math.random() * 3)],
        medical_support: (['Tersedia 24 Jam', 'Tersedia', 'Tidak Tersedia'])[Math.floor(Math.random() * 3)],
      },
      verified_by: (['BPBD DKI Jakarta', 'Palang Merah Indonesia', 'BNPB'])[Math.floor(Math.random() * 3)],
    }));

    console.log(
      '[API Evakuasi] Data fetched successfully (with mocked fields):',
      mockedData ? mockedData.length : 0,
      'items.',
    );
    return NextResponse.json(mockedData, { status: 200 });
  } catch (error: any) {
    console.error('[API Evakuasi] Unexpected error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 },
    );
  }
}
