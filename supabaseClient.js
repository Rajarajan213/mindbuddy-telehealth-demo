/* ============================================================
   supabaseClient.js – Supabase Initialization
   ============================================================
   SETUP: Replace the two values below with your own credentials from:
   Supabase Dashboard → Settings (⚙️) → API
   ============================================================ */

const SUPABASE_URL  = 'YOUR_SUPABASE_URL';       // e.g. https://xxxx.supabase.co
const SUPABASE_KEY  = 'YOUR_SUPABASE_ANON_KEY';  // eyJ... long JWT string

// Creates the global supabase client (CDN version - no imports needed)
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
