import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

class SupabaseClient {
  constructor() {
    if (SupabaseClient.instance) {
      return SupabaseClient.instance;
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'app-auth',
        storage:
          typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
        sessionExpiryTime: 30 * 60 * 1000,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    });

    SupabaseClient.instance = this;
  }

  getClient() {
    return this.client;
  }
}

// Export a singleton instance
export const supabase = new SupabaseClient().getClient();

// Export utility functions
export const sessionUtils = {
  getStoredSession() {
    if (typeof window === 'undefined') return null;

    const storedSession = localStorage.getItem('app-auth');
    if (!storedSession) return null;

    try {
      const session = JSON.parse(storedSession);
      const expiresAt = new Date(session.expires_at).getTime();
      const now = new Date().getTime();

      if (now > expiresAt) {
        localStorage.removeItem('app-auth');
        return null;
      }

      return session;
    } catch (error) {
      console.error('Session parse error:', error);
      localStorage.removeItem('app-auth');
      return null;
    }
  },

  setStoredSession(session) {
    if (typeof window === 'undefined') return;

    if (!session) {
      localStorage.removeItem('app-auth');
      return;
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const sessionData = {
      ...session,
      expires_at: expiresAt.toISOString(),
    };

    localStorage.setItem('app-auth', JSON.stringify(sessionData));
  },
};

export const databaseUtils = {
  async batchInsert(table, records, batchSize = 100) {
    const batches = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    return Promise.all(
      batches.map(batch => supabase.from(table).insert(batch).select())
    );
  },

  async upsertWithRelations(table, data, relations) {
    const { data: mainRecord } = await supabase
      .from(table)
      .upsert(data)
      .select()
      .single();

    if (relations && mainRecord) {
      await Promise.all(
        Object.entries(relations).map(([relationTable, relationData]) =>
          supabase.from(relationTable).upsert({
            ...relationData,
            parent_id: mainRecord.id,
          })
        )
      );
    }

    return mainRecord;
  },

  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          return this.createProfile(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async createProfile(userId) {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userData.user.email,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it first then update
          await this.createProfile(userId);
          return this.updateProfile(userId, updates);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async createWorkspace(workspace) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([workspace])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create workspace error:', error);
      throw error;
    }
  },
};
