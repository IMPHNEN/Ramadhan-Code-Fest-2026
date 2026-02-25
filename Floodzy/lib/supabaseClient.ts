// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Pastikan variabel lingkungan sudah diatur
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('DEBUG: NEXT_PUBLIC_SUPABASE_URL is undefined.');
} else {
  console.log(
    'DEBUG: NEXT_PUBLIC_SUPABASE_URL:',
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined.');
} else {
  console.log('DEBUG: NEXT_PUBLIC_SUPABASE_ANON_KEY loaded.'); // Jangan log key aslinya
}

// Inisialisasi Supabase Client untuk Sisi Klien (Frontend)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
console.log('DEBUG: supabaseClient initialized.');
