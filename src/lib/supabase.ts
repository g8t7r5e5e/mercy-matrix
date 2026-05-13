import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase browser client for Phase 4 authentication.
 *
 * The client is only created when both public Vite environment variables are
 * present. Missing variables intentionally keep the app in demo/local auth mode
 * so previews and builds continue to work without real Supabase credentials.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use Supabase Auth; falling back to demo/local auth."
  );
}
