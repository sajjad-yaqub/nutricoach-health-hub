import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here');

if (!isSupabaseConfigured) {
  console.warn(
    'NutriCoach: Supabase credentials not found in environment variables. Running in high-fidelity LOCAL STORAGE DEMO MODE. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect to live Supabase DB.'
  );
}

// Create a dummy client if not configured so imports do not break
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
