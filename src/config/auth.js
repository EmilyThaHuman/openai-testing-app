export const SUPABASE_AUTH_CONFIG = {
  providers: {
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirectUrl: `${window.location.origin}/auth/callback`
    },
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirectUrl: `${window.location.origin}/auth/callback`
    }
  }
}

export const OAUTH_SCOPES = {
  github: 'read:user user:email',
  google: 'profile email'
} 