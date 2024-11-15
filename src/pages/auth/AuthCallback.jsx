import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function AuthCallback() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Authentication failed',
          description: error.message
        })
        navigate('/auth/login')
        return
      }

      if (session?.user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', session.user.id)
          .single()

        if (!profile?.has_completed_onboarding) {
          navigate('/auth/onboarding')
        } else {
          navigate('/dashboard')
        }
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
} 