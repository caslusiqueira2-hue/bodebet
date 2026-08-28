import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prawszeepeowvakyxldt.supabase.co';
const supabaseAnonKey = 'sb_publishable_Wn1BjLCVdDfh_vVqMHYkHw_wKoLEBBM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
