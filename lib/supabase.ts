import { createClient } from '@supabase/supabase-js';
import { RequestStatus } from '../types';

const getEnv = (key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env[key];
  }
  return '';
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

// Export configuration status so components can adapt
export const isSupabaseConfigured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn("Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. Database features will be disabled.");
}

// Fallback to prevent crash on init if keys are missing
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
);

export const insertSongRequest = async (track: any, user: any) => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured. Request simulated.");
    // Return fake success for demo purposes
    await new Promise(resolve => setTimeout(resolve, 500));
    return [{ id: 'demo-' + Date.now(), status: 'PENDING' }];
  }

  if (!user) throw new Error("User not logged in");

  const { data, error } = await supabase
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
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
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
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
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