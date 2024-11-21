export const SUPABASE_CONFIG = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: {
      storageKey: 'reed-ai-auth',
      persistSession: true
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    channels: {
      chat: 'chat_messages',
      presence: 'presence_updates',
      notifications: 'user_notifications'
    }
  },
  storage: {
    buckets: {
      avatars: 'avatars',
      workspaceFiles: 'workspace-files',
      chatAttachments: 'chat-attachments'
    }
  }
} 