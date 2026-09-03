import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error('CRITICAL: Missing Supabase environment variables! VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is undefined.');
}

// Provide a dummy URL/key if missing so createClient doesn't throw a fatal module load error
const safeUrl = supabaseUrl || 'https://missing-config.supabase.co';
const safeKey = supabaseAnonKey || 'missing-key';

export const supabase = createClient(safeUrl, safeKey);
