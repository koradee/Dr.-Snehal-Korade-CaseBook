import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase credentials not fully configured in environment variables.');
}

// Create a Supabase client with the Service Role Key.
// WARNING: The service role key bypasses Row Level Security (RLS).
// We are only using this on the server-side API routes after verifying custom auth.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseServiceRoleKey || 'placeholder', 
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
