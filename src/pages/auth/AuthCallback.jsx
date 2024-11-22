import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { AppIcon } from '@/components/ui/AppIcon';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [steps, setSteps] = useState([
    { id: 'auth', label: 'Authenticating', status: 'loading' },
    { id: 'profile', label: 'Setting up profile', status: 'pending' },
    { id: 'workspace', label: 'Preparing workspace', status: 'pending' }
  ]);
  const [error, setError] = useState(null);

  // Get store actions
  const { 
    setUser,
    setAccessToken,
    setUsername,
    setDisplayname,
    setAvatar,
    setUserProfileContext
  } = useStore(state => ({
    setUser: state.setUser,
    setAccessToken: state.setAccessToken,
    setUsername: state.setUsername,
    setDisplayname: state.setDisplayname,
    setAvatar: state.setAvatar,
    setUserProfileContext: state.setUserProfileContext
  }))

  const updateStepStatus = (stepId, status) => {
    setSteps(currentSteps =>
      currentSteps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthCallback = async () => {
      try {
        // Get URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Get URL query parameters
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');
        const error = queryParams.get('error');
        const error_description = queryParams.get('error_description');

        if (error) {
          throw new Error(error_description || error);
        }

        let session;

        // Handle PKCE flow
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          session = data.session;
        }
        // Handle implicit flow
        else if (accessToken && type === 'recovery') {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (setSessionError) throw setSessionError;
          session = data.session;
        }
        // Get existing session
        else {
          const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          session = existingSession;
        }

        if (!session) {
          throw new Error('No session established');
        }

        // Update store with user data
        setUser(session.user);
        setAccessToken(session.access_token);
        setUsername(session.user.email);
        setDisplayname(session.user.user_metadata?.full_name || '');
        setAvatar(session.user.user_metadata?.avatar_url || '');
        setUserProfileContext('default');

        if (!mounted) return;

        updateStepStatus('auth', 'complete');
        updateStepStatus('profile', 'loading');

        // Step 2: Profile Setup
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
            has_completed_onboarding: false,
            settings: {
              theme: 'system',
              language: 'en',
              notifications: { email: true, desktop: false }
            }
          },
          { onConflict: 'id', returning: 'minimal' }
        );
        if (profileError) throw profileError;

        if (!mounted) return;

        updateStepStatus('profile', 'complete');
        updateStepStatus('workspace', 'loading');

        // Step 3: Workspace Setup
        const { error: workspaceError } = await supabase.from('workspaces').upsert(
          {
            profile_id: session.user.id,
            name: 'My Workspace',
            description: 'My default workspace',
            settings: { default: true, color: '#4f46e5' }
          },
          { onConflict: 'profile_id,name', returning: 'minimal' }
        );
        if (workspaceError) throw workspaceError;

        const { error: preferencesError } = await supabase.from('user_preferences').upsert(
          {
            profile_id: session.user.id,
            editor_settings: {
              theme: 'vs-dark',
              fontSize: 14,
              tabSize: 2,
              minimap: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              formatOnSave: true
            },
            chat_settings: {
              streamResponses: true,
              showTimestamps: true,
              showAvatars: true,
              soundEnabled: false
            },
            ai_settings: {
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 2000
            }
          },
          { onConflict: 'profile_id', returning: 'minimal' }
        );
        if (preferencesError) throw preferencesError;

        if (!mounted) return;

        updateStepStatus('workspace', 'complete');

        // Check if user is authenticated before proceeding
        if (!isAuthenticated) {
          throw new Error('Authentication failed');
        }

        // Short delay before redirect to show completion
        setTimeout(() => {
          if (mounted) {
            if (!user?.has_completed_onboarding) {
              navigate('/auth/onboarding');
            } else {
              navigate('/open-canvas');
            }
          }
        }, 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        if (mounted) {
          setError(error.message);
          updateStepStatus(steps.find(s => s.status === 'loading')?.id, 'error');
          toast({
            variant: 'destructive',
            title: 'Authentication failed',
            description: error.message
          });
          setTimeout(() => navigate('/auth/login'), 2000);
        }
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [supabase, navigate, toast, isAuthenticated, user]);

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0" style={{ position: 'relative' }}>
      <div className="relative h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/95" />
      </div>
      <div className="lg:p-8 relative">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-2 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="mx-auto relative w-24 h-24 mb-4"
            >
              <div className="absolute inset-0 bg-primary/10 animate-ping rounded-xl" />
              <AppIcon size="xl" className="relative z-10" />
            </motion.div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Setting up your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare everything for you
            </p>

            <div className="relative mt-8 space-y-4">
              {steps.map((step) => (
                <StepIndicator
                  key={step.id}
                  step={step.label}
                  status={step.status}
                  icon={
                    step.status === 'complete' ? CheckCircle2 :
                    step.status === 'loading' ? Loader2 :
                    step.status === 'error' ? XCircle :
                    CheckCircle2
                  }
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step, status, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-2 rounded-lg bg-card/50"
    >
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full',
          status === 'complete' && 'bg-primary/20 text-primary',
          status === 'loading' && 'bg-primary/20 text-primary',
          status === 'pending' && 'bg-muted text-muted-foreground',
          status === 'error' && 'bg-destructive/20 text-destructive'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5',
            status === 'loading' && 'animate-spin'
          )}
        />
      </div>
      <span
        className={cn(
          'text-sm font-medium flex-1',
          status === 'complete' && 'text-foreground',
          status === 'loading' && 'text-foreground',
          status === 'pending' && 'text-muted-foreground',
          status === 'error' && 'text-destructive'
        )}
      >
        {step}
      </span>
    </motion.div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center space-y-4 p-6 text-center"
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
        <XCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Authentication Failed</h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Try Again
      </button>
    </motion.div>
  );
}
