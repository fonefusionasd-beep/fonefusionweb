import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzmmbewgblovubbujrnt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_uNHFXimtirFfpk5obROLuQ_Wn051XC8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
