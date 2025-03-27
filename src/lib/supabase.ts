
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a placeholder client if credentials are missing
const createPlaceholderClient = () => {
  console.warn('Supabase URL and/or Anonymous Key are missing. Using placeholder client.');
  
  // Return a mock client that logs operations instead of performing them
  return {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      eq: () => ({ data: null, error: new Error('Supabase not configured') }),
      single: () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
    auth: {
      signIn: () => Promise.resolve({ user: null, session: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
};

// Create the client or use placeholder if credentials are missing
export const supabase = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createPlaceholderClient() as any;

