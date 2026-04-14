/**
 * Supabase Browser Client
 * 
 * This file provides the client-side Supabase client for:
 * 1. Authentication (signup, login, logout, etc.)
 * 2. Real-time subscriptions
 * 3. Client-side data operations (respects RLS)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@shared/supabase-types';

// These will be provided by the server or set during build
// For now, we'll fetch them from the backend
let supabaseUrl: string | null = null;
let supabaseAnonKey: string | null = null;

// Lazy initialization - fetch config from server on first use
async function getSupabaseConfig() {
  if (supabaseUrl && supabaseAnonKey) {
    return { url: supabaseUrl, anonKey: supabaseAnonKey };
  }

  try {
    const response = await fetch('/api/config/supabase');
    if (!response.ok) {
      throw new Error('Failed to fetch Supabase config');
    }
    const config = await response.json();
    supabaseUrl = config.url;
    supabaseAnonKey = config.anonKey;
    return config;
  } catch (error) {
    console.error('Failed to load Supabase config:', error);
    throw error;
  }
}

// Client instance (will be created on first use)
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create the Supabase client
 * This is a singleton that's initialized lazily
 */
export async function getSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = await getSupabaseConfig();
  
  supabaseClient = createClient<Database>(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storageKey: 'coach-athlete-auth',
      storage: window.localStorage,
    },
  });

  return supabaseClient;
}

/**
 * Synchronous version - use only after calling getSupabase() at least once
 * This is useful for places where you know the client is already initialized
 */
export function getSupabaseSync() {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call getSupabase() first.');
  }
  return supabaseClient;
}
