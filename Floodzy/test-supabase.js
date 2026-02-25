const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

async function testSupabase() {
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    'SUPABASE_SERVICE_ROLE_KEY loaded:',
    !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error('Error: Missing Supabase environment variables.');
    return;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    console.log('Supabase client created. Fetching data...');

    const { data, error } = await supabase
      .from('provinces')
      .select('province_name')
      .limit(5);

    if (error) {
      console.error('Supabase fetch error:', error);
      return;
    }

    console.log('Successfully fetched data:');
    console.log(data);
  } catch (e) {
    console.error('An unexpected error occurred:', e);
  }
}

testSupabase();
