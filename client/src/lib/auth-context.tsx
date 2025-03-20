import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, AuthError } from './supabase';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; success: boolean }>;
  signOut: () => Promise<{ error: AuthError | null; success: boolean }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null; success: boolean }>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearError = () => setError(null);

  useEffect(() => {
    // Check for user on initial load
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking auth session:', error);
        const message = error instanceof Error ? error.message : 'Failed to check authentication status';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Sign-up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, success: false };
      }
      
      toast({
        title: "Sign-up successful",
        description: "Please check your email for the confirmation link",
      });
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast({
        title: "Sign-up failed",
        description: message,
        variant: "destructive",
      });
      return { 
        error: { message } as AuthError, 
        success: false 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, success: false };
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      return { 
        error: { message } as AuthError, 
        success: false 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        toast({
          title: "Sign-out failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, success: false };
      }
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast({
        title: "Sign-out failed",
        description: message,
        variant: "destructive",
      });
      return { 
        error: { message } as AuthError, 
        success: false 
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, success: false };
      }
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link",
      });
      return { error: null, success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      toast({
        title: "Password reset failed",
        description: message,
        variant: "destructive",
      });
      return { 
        error: { message } as AuthError, 
        success: false 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      signUp, 
      signIn, 
      signOut, 
      resetPassword,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 