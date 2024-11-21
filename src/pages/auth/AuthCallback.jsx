import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { AppIcon } from '@/components/ui/AppIcon'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AuthCallback() {
  const supabase = useSupabaseClient()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error
        if (!session) throw new Error('No session found')

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
            has_completed_onboarding: false,
            settings: {
              theme: 'system',
              language: 'en',
              notifications: {
                email: true,
                desktop: false
              }
            }
          }, {
            onConflict: 'id',
            returning: 'minimal'
          })

        if (profileError) throw profileError

        const { error: workspaceError } = await supabase
          .from('workspaces')
          .upsert({
            profile_id: session.user.id,
            name: 'My Workspace',
            description: 'My default workspace',
            settings: {
              default: true,
              color: '#4f46e5'
            }
          }, {
            onConflict: 'profile_id,name',
            returning: 'minimal'
          })

        if (workspaceError) throw workspaceError

        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .upsert({
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
          }, {
            onConflict: 'profile_id',
            returning: 'minimal'
          })

        if (preferencesError) throw preferencesError

        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select(`
            has_completed_onboarding,
            settings,
            workspaces (
              id,
              name,
              settings
            )
          `)
          .eq('id', session.user.id)
          .single()

        if (fetchError) throw fetchError

        if (!profile?.has_completed_onboarding) {
          navigate('/auth/onboarding')
        } else {
          const defaultWorkspace = profile.workspaces?.find(w => w.settings?.default)
          navigate(defaultWorkspace ? `/workspace/${defaultWorkspace.id}` : '/open-canvas')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: error.message
        })
        navigate('/auth/login')
      }
    }

    handleAuthCallback()
  }, [supabase, navigate, toast])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center space-y-6">
          {/* App Icon with Pulse */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="relative mx-auto"
          >
            <div className="absolute inset-0 bg-primary/10 animate-ping rounded-xl" />
            <AppIcon size="xl" className="relative z-10" />
          </motion.div>

          {/* Loading Steps */}
          <div className="space-y-4 mt-8">
            <StepIndicator
              step="Authenticating"
              status="complete"
              icon={CheckCircle2}
            />
            <StepIndicator
              step="Setting up profile"
              status="loading"
              icon={Loader2}
            />
            <StepIndicator
              step="Preparing workspace"
              status="pending"
              icon={CheckCircle2}
            />
          </div>

          {/* Loading Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold tracking-tight">
              Setting up your account
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we prepare everything for you
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// Step indicator component
function StepIndicator({ step, status, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        status === 'complete' && "bg-primary/20 text-primary",
        status === 'loading' && "bg-primary/20 text-primary",
        status === 'pending' && "bg-muted text-muted-foreground"
      )}>
        <Icon 
          className={cn(
            "w-5 h-5",
            status === 'loading' && "animate-spin"
          )} 
        />
      </div>
      <span className={cn(
        "text-sm font-medium",
        status === 'complete' && "text-foreground",
        status === 'loading' && "text-foreground",
        status === 'pending' && "text-muted-foreground"
      )}>
        {step}
      </span>
    </motion.div>
  )
}

// Error state component
function ErrorState({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-4"
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
        <XCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">Authentication Failed</h3>
      <p className="text-sm text-muted-foreground">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Try Again
      </button>
    </motion.div>
  )
} 