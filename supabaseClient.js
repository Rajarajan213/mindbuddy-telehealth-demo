/* ============================================================
   supabaseClient.js – Supabase Initialization
   ============================================================
   SETUP: Replace the two values below with your own credentials from:
   Supabase Dashboard → Settings (⚙️) → API
   ============================================================ */

const SUPABASE_URL  = 'https://jlvngyqlddmtlpuulowv.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsdm5neXFsZGRtdGxwdXVsb3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMTQ1NDUsImV4cCI6MjA4ODY5MDU0NX0.zCAgUSaj8xMitj5iQcn2o15eJZ3p97dyoAm00LhizeY';

// Creates the global supabase client (CDN version - no imports needed)
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
