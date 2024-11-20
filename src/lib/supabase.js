import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'app-auth',
    storage: window.localStorage,
    flowType: 'pkce',
    sessionExpiryTime: 30 * 60 * 1000
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
})

export const sessionUtils = {
  getStoredSession() {
    const storedSession = localStorage.getItem('app-auth')
    if (!storedSession) return null

    try {
      const session = JSON.parse(storedSession)
      const expiresAt = new Date(session.expires_at).getTime()
      const now = new Date().getTime()

      if (now > expiresAt) {
        localStorage.removeItem('app-auth')
        return null
      }

      return session
    } catch (error) {
      console.error('Session parse error:', error)
      localStorage.removeItem('app-auth')
      return null
    }
  },

  setStoredSession(session) {
    if (!session) {
      localStorage.removeItem('app-auth')
      return
    }

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)
    
    const sessionData = {
      ...session,
      expires_at: expiresAt.toISOString()
    }

    localStorage.setItem('app-auth', JSON.stringify(sessionData))
  }
}

export const databaseUtils = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          return this.createProfile(userId)
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },

  async createProfile(userId) {
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: userData.user.email,
          onboarding_completed: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create profile error:', error)
      throw error
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it first then update
          await this.createProfile(userId)
          return this.updateProfile(userId, updates)
        }
        throw error
      }

      return data
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  async createWorkspace(workspace) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([workspace])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create workspace error:', error)
      throw error
    }
  }
}
