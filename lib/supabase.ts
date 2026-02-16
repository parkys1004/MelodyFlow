import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RequestStatus } from '../types';
import { useStore } from './store';

const getEnv = (key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env[key];
  }
  return '';
};

// Singleton-like instance management
let supabaseInstance: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabase = () => {
  const { apiConfig } = useStore.getState();
  
  // Prioritize user config, then env fallback
  const url = apiConfig.supabaseUrl || getEnv('VITE_SUPABASE_URL');
  const key = apiConfig.supabaseKey || getEnv('VITE_SUPABASE_ANON_KEY');

  if (!url || !key) return null;

  // Re-create client if config changes
  if (!supabaseInstance || url !== lastUrl || key !== lastKey) {
    try {
      supabaseInstance = createClient(url, key);
      lastUrl = url;
      lastKey = key;
    } catch (e) {
      console.error("Invalid Supabase Config", e);
      return null;
    }
  }

  return supabaseInstance;
};

export const isSupabaseConfigured = () => {
  return !!getSupabase();
};

// --- API Functions ---

export const insertSongRequest = async (track: any, user: any) => {
  const sb = getSupabase();
  
  if (!sb) {
    console.warn("Supabase not configured. Request simulated.");
    // Return fake success for demo purposes
    await new Promise(resolve => setTimeout(resolve, 500));
    return [{ id: 'demo-' + Date.now(), status: 'PENDING' }];
  }

  if (!user) throw new Error("User not logged in");

  const { data, error } = await sb
    .from('requests')
    .insert([
      {
        track_id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        cover_url: track.album.images[0]?.url,
        user_id: user.id,
        user_name: user.display_name,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    console.error("Supabase Insert Error:", error);
    throw error;
  }
  return data;
};

export const fetchSongRequests = async () => {
  const sb = getSupabase();
  if (!sb) {
    return [];
  }

  const { data, error } = await sb
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Fetch Error:", error);
    throw error;
  }
  return data;
};

export const updateRequestStatus = async (id: string | number, status: RequestStatus) => {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from('requests')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) {
    console.error("Supabase Update Error:", error);
    throw error;
  }
  return data;
};

// Export raw client getter for subscriptions
export const getSupabaseClient = getSupabase;