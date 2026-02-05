import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Test connection
  console.log('1. Testing basic connection...');
  const { data, error } = await supabase.from('events').select('count');

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  } else {
    console.log('✅ Connection successful!');
    console.log('Events count:', data);
  }

  // Test recurring_events table
  console.log('\n2. Testing recurring_events table...');
  const { data: recData, error: recError } = await supabase
    .from('recurring_events')
    .select('count');

  if (recError) {
    console.error('❌ Error:', recError.message);
    console.error('Details:', recError);
  } else {
    console.log('✅ Recurring events table exists!');
    console.log('Count:', recData);
  }
}

test();
