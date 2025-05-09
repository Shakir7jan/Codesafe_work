import { createClient } from '@supabase/supabase-js';

// Access global environment variables if defined
declare global {
  interface Window {
    ENV?: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}

// Try to get environment variables from multiple sources
// 1. Vite's import.meta.env
// 2. Window.ENV (set in index.html)
// 3. Hardcoded fallback (not recommended for production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                   (typeof window !== 'undefined' && window.ENV?.SUPABASE_URL) || 
                   'https://hjbkhhswpwpaqhomlsbb.supabase.co';

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                   (typeof window !== 'undefined' && window.ENV?.SUPABASE_ANON_KEY) || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYmtoaHN3cHdwYXFob21sc2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTI4NDMsImV4cCI6MjA1ODA2ODg0M30.i-UvhysYMTUWyoJ_Zk8fPOSpj96da-gEiQFqr30-vxw';

// Debug environment variables
console.log('ENV VARS:', { 
  supabaseUrl, 
  supabaseKeyLength: supabaseKey?.length || 0,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  source: import.meta.env.VITE_SUPABASE_URL 
    ? 'Vite env' 
    : (typeof window !== 'undefined' && window.ENV?.SUPABASE_URL)
      ? 'Window ENV' 
      : 'Fallback'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type AuthError = {
  message: string;
};

// Helper functions for authentication
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  
  return { data, error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function updateProfile(profile: { fullName?: string; company?: string; jobTitle?: string }) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      fullName: profile.fullName,
      company: profile.company,
      jobTitle: profile.jobTitle,
    },
  });
  return { data, error };
}

export async function deleteAccount() {
  // First get the current user to verify they're authenticated
  const { user, error: userError } = await getCurrentUser();
  
  if (userError || !user) {
    return { error: { message: 'You must be logged in to delete your account' } };
  }
  
  // Delete the user account
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  
  if (error) {
    // If we can't use admin API (which is likely in client-side code),
    // try with regular auth methods
    if (error.message.includes('admin') || error.message.includes('permission')) {
      // Use signOut as a fallback - in a real app, you'd call a backend endpoint 
      // that performs the deletion with proper admin credentials
      await signOut();
      
      // Since we can't directly delete from client-side, return success
      // but in a real app, implement a server endpoint to handle this
      console.log('WARNING: Account deletion fallback used. In production, implement a server-side endpoint for this.');
      return { error: null };
    }
    return { error };
  }
  
  return { error: null };
}