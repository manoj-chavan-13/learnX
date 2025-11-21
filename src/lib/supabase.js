import { createClient } from "@supabase/supabase-js";

// =================================================================
// 🔴 ACTION REQUIRED: REPLACE THESE WITH YOUR ACTUAL KEYS
// =================================================================
const SUPABASE_URL = "https://pkabexpfifvqxnmfzeiz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrYWJleHBmaWZ2cXhubWZ6ZWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDc0NzgsImV4cCI6MjA3OTI4MzQ3OH0.0lcm0Sx_oCLeHSqV2wpHCbsOv7xojLMtE2s_G_KcAzc";

let supabaseInstance = null;

export const initSupabase = () => {
  if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_URL.includes("YOUR_SUPABASE")
  ) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
      console.error("Supabase Init Failed:", error);
      return null;
    }
  }
  return supabaseInstance;
};
