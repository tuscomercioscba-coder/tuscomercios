import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://czbukztebwrfpvbvycje.supabase.co";
const supabaseKey = "sb_publishable_zGkiDLovJGeugSjhgbTo_g_xkoO9sgS";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});