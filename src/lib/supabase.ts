import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Prepared Supabase browser client for the upcoming backend migration.
 *
 * The current app intentionally continues to use local/demo auth and mock data.
 * Real Supabase auth, database queries, and schema-backed data will be wired in a
 * later phase after the database schema is created.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);
