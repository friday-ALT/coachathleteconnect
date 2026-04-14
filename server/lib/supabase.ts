/**
 * Supabase Server Client
 * 
 * This file provides server-side Supabase clients for:
 * 1. Admin operations (using service role key)
 * 2. User-scoped operations (using user's auth token)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@shared/supabase-types';

// Validate required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Admin client with full access (bypasses RLS)
 * Use this for:
 * - Server-side operations that need elevated permissions
 * - Background jobs
 * - Admin operations
 * 
 * ⚠️ WARNING: This client bypasses Row Level Security!
 * Only use when necessary and never expose to client.
 */
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Create a Supabase client for a specific user
 * This client respects Row Level Security policies
 * 
 * @param accessToken - User's access token from session
 * @returns Supabase client scoped to the user
 */
export function createServerSupabaseClient(accessToken?: string) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration');
  }

  const client = createClient<Database>(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: accessToken ? {
          Authorization: `Bearer ${accessToken}`
        } : {}
      }
    }
  );

  return client;
}

/**
 * Get Supabase configuration for client-side use
 * Only returns public, safe-to-expose values
 */
export function getSupabaseConfig() {
  if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
  }
  
  return {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY,
  };
}
