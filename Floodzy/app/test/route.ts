import { NextResponse } from 'next/server';

export async function GET() {
  console.log('DEBUG: Test API route hit! (Floodzy Project)'); // Tambahkan identifikasi
  return NextResponse.json({
    message: 'Hello from Test API! (Floodzy Project)',
  });
}
