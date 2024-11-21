export const SUPABASE_CONFIG = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'app-auth',
    storage: window.localStorage,
    sessionExpiryTime: 30 * 60 * 1000,
  },
  db: {
    schema: 'public',
    autoRefreshData: true,
    realtime: {
      enabled: true,
      presence: {
        key: 'user_presence',
      },

    },
    // realtime: {
    //   channels: {
    //     chat: 'chat_messages',
    //     presence: 'presence_updates',
    //     notifications: 'user_notifications',
    //   },
    // },
    storage: {
      buckets: {
        avatars: 'avatars',
        workspaceFiles: 'workspace-files',
        chatAttachments: 'chat-attachments',
      },
    },
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    fetch: {
      cache: 'no-cache',
    },
  },
};
