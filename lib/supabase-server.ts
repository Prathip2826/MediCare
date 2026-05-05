import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only create the client if we have the key, otherwise it might fail during build
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null as any;

export async function getServerUser() {
  // Check if we are in build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') return null;
  
  // If we're in a build environment without the key, return null
  if (!supabaseAdmin) return null;

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('firebase_uid', token)
      .single();

    if (error || !profile) return null;

    return profile;
  } catch (e) {
    // cookies() can throw in some build contexts
    return null;
  }
}
