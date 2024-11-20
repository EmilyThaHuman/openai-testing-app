import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useToast } from '@/components/ui/use-toast'

export function AuthCallback() {
  const supabase = useSupabaseClient()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL
        const code = new URLSearchParams(window.location.search).get('code')
        
        if (!code) throw new Error('No code provided')

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) throw error

        // Get user session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) throw new Error('No session found')

        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            has_completed_onboarding: false
          }, {
            onConflict: 'id'
          })

        if (profileError) throw profileError

        // Check onboarding status
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', session.user.id)
          .single()

        // Redirect based on onboarding status
        if (!profile?.has_completed_onboarding) {
          navigate('/auth/onboarding')
        } else {
          navigate('/open-canvas')
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
  }, [])

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">
          Completing authentication...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  )
} 