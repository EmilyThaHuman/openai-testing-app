import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { SUPABASE_AUTH_CONFIG, OAUTH_SCOPES } from '@/config/auth'

export function useAuth() {
  const supabase = useSupabaseClient()

  const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: SUPABASE_AUTH_CONFIG.providers[provider].redirectUrl,
        scopes: OAUTH_SCOPES[provider]
      }
    })

    if (error) throw error
    return data
  }

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    signInWithOAuth,
    signInWithEmail,
    signOut
  }
} 