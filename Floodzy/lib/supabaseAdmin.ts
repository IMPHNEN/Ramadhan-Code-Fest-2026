import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or Service Role Key environment variables.');
}

export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Generic function to fetch data from Supabase with retry logic
export async function fetchSupabaseDataWithRetry<T>(
  queryFunction: (client: any) => PromiseLike<{ data: T | null; error: any }>,
  tableName: string, // For logging purposes
  retries = 3,
  delay = 1000, // 1 second delay
): Promise<{ data: T | null; error: any }> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await queryFunction(supabaseServiceRole);
      if (error) {
        console.error(`Error fetching from ${tableName} (attempt ${i + 1}):`, error.message);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        return { data, error: null };
      }
    } catch (e: any) {
      console.error(`Exception fetching from ${tableName} (attempt ${i + 1}):`, e.message);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return { data: null, error: e };
      }
    }
  }
  return { data: null, error: new Error(`Failed to fetch from ${tableName} after ${retries} attempts.`) };
}
