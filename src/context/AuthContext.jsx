import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, databaseUtils } from '@/lib/supabase/client';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);

      // Create/update profile when user signs in
      if (session?.user) {
        try {
          await databaseUtils.getProfile(session.user.id);
        } catch (error) {
          console.error('Error handling user profile:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: provider === 'github' 
              ? 'read:user user:email'
              : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          },
          ...(provider === 'github' && {
            skipBrowserRedirect: false,
          }),
          ...(provider === 'google' && {
            flow: 'pkce',
          })
        }
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `${provider} login failed`,
        description: error.message
      });
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message
      });
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: '',
            avatar_url: '',
            has_completed_onboarding: false
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/auth/login';
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Sign out failed',
        description: error.message
      });
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const { data, error } = await databaseUtils.updateProfile(user.id, updates);
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.'
      });
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        signIn,
        signInWithEmail,
        signUp,
        signOut,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
