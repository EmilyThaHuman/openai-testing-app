import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase, databaseUtils } from '@/lib/supabase/client';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setUser(session?.user ?? null);
  //     setIsAuthenticated(!!session?.user);
  //     setLoading(false);
  //   });

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (_event, session) => {
  //     setUser(session?.user ?? null);
  //     setIsAuthenticated(!!session?.user);
  //     setLoading(false);

  //     // Create/update profile when user signs in
  //     if (session?.user) {
  //       try {
  //         await databaseUtils.getProfile(session.user.id);
  //       } catch (error) {
  //         console.error('Error handling user profile:', error);
  //       }
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session?.user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: error.message,
          });
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session);

      if (session && session.provider_token) {
        window.localStorage.setItem(
          'oauth_provider_token',
          session.provider_token
        );
      }
      if (session && session.provider_refresh_token) {
        window.localStorage.setItem(
          'oauth_provider_refresh_token',
          session.provider_refresh_token
        );
      }

      setTimeout(() => {
        switch (event) {
          case 'SIGNED_IN':
            toast({
              title: 'Signed In',
              description: 'You have successfully signed in.',
            });
            break;
          case 'SIGNED_OUT':
            window.localStorage.removeItem('oauth_provider_token');
            window.localStorage.removeItem('oauth_provider_refresh_token');
            toast({
              title: 'Signed Out',
              description: 'You have been signed out.',
            });
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed:', session);
            break;
          case 'USER_UPDATED':
            console.log('User updated:', session);
            break;
          case 'PASSWORD_RECOVERY':
            toast({
              title: 'Password Recovery',
              description: 'Please reset your password.',
            });
            break;
          case 'INITIAL_SESSION':
            // Initial session loaded
            break;
          default:
            console.warn('Unhandled auth event:', event);
            break;
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOAuth = async provider => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope:
              provider === 'github'
                ? 'read:user user:email'
                : 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          },
          ...(provider === 'github' && {
            skipBrowserRedirect: false,
          }),
          ...(provider === 'google' && {
            flow: 'pkce',
          }),
        },
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: `${provider} login failed`,
        description: error.message,
      });
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      console.log('EMAIL SIGNIN', data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
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
            has_completed_onboarding: false,
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message,
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
        description: error.message,
      });
      throw error;
    }
  };

  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  const getSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  };

  const updateUser = async updates => {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  };

  const exchangeCodeForSession = async code => {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data;
  };

  const updateUserProfile = async updates => {
    try {
      const { data, error } = await databaseUtils.updateProfile(
        user.id,
        updates
      );
      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message,
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
        setIsAuthenticated,
        signInWithOAuth,
        signInWithEmail,
        signUp,
        signOut,
        updateUserProfile,
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

