import { supabaseAdmin } from './admin'

export async function createUserProfile(user) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createDefaultWorkspace(userId) {
  const { data, error } = await supabaseAdmin
    .from('workspaces')
    .insert([
      {
        profile_id: userId,
        name: 'My Workspace',
        description: 'My default workspace',
        settings: {
          default: true,
          color: '#4f46e5'
        }
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function initializeUserPreferences(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .insert([
      {
        profile_id: userId,
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
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
} 