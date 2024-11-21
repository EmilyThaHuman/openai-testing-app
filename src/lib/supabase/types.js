/**
 * @typedef {string | number | boolean | null | { [key: string]: Json | undefined } | Json[]} Json
 */

/**
 * @typedef {Object} Profile
 * @property {string} id - UUID of the profile
 * @property {string} email - User's email
 * @property {string|null} full_name - User's full name
 * @property {string|null} avatar_url - URL to user's avatar
 * @property {boolean} has_completed_onboarding - Whether user completed onboarding
 * @property {string} updated_at - Last update timestamp
 * @property {Json} settings - User settings object
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id - UUID of the workspace
 * @property {string} profile_id - UUID of the profile that owns the workspace
 * @property {string} name - Workspace name
 * @property {string|null} description - Workspace description
 * @property {Json} settings - Workspace settings object
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} profile_id - UUID of the profile
 * @property {Json} editor_settings - Editor preferences
 * @property {Json} chat_settings - Chat preferences
 * @property {Json} ai_settings - AI model preferences
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} UserActivity
 * @property {string} profile_id - UUID of the profile
 * @property {string} last_active - Last activity timestamp
 * @property {number} total_chats - Total number of chats
 * @property {number} total_workspaces - Total number of workspaces
 */

/**
 * @typedef {Object} Database
 * @property {Object} public - Public schema
 * @property {Object} public.Tables - Database tables
 * @property {Object} public.Tables.profiles - Profiles table
 * @property {Profile} public.Tables.profiles.Row - Profile row type
 * @property {Partial<Profile>} public.Tables.profiles.Insert - Profile insert type
 * @property {Partial<Profile>} public.Tables.profiles.Update - Profile update type
 * @property {Object} public.Tables.workspaces - Workspaces table
 * @property {Workspace} public.Tables.workspaces.Row - Workspace row type
 * @property {Object} public.Tables.user_preferences - User preferences table
 * @property {UserPreferences} public.Tables.user_preferences.Row - User preferences row type
 * @property {Object} public.Views - Database views
 * @property {Object} public.Views.user_activity - User activity view
 * @property {UserActivity} public.Views.user_activity.Row - User activity row type
 * @property {Object} public.Functions - Database functions
 * @property {Object} public.Functions.handle_new_user - New user handler function
 * @property {Record<PropertyKey, never>} public.Functions.handle_new_user.Args - Function arguments
 * @property {undefined} public.Functions.handle_new_user.Returns - Function return type
 */

/**
 * @typedef {Object} EditorSettings
 * @property {'vs-dark'|'light'} theme - Editor theme
 * @property {number} fontSize - Font size in pixels
 * @property {number} tabSize - Tab size
 * @property {boolean} minimap - Show minimap
 * @property {'on'|'off'} wordWrap - Word wrap setting
 * @property {'on'|'off'} lineNumbers - Line numbers setting
 * @property {boolean} formatOnSave - Format on save setting
 */

/**
 * @typedef {Object} ChatSettings
 * @property {boolean} streamResponses - Enable streaming responses
 * @property {boolean} showTimestamps - Show message timestamps
 * @property {boolean} showAvatars - Show user avatars
 * @property {boolean} soundEnabled - Enable sound effects
 */

/**
 * @typedef {Object} AISettings
 * @property {string} model - AI model name
 * @property {number} temperature - Model temperature
 * @property {number} maxTokens - Maximum tokens per response
 */

/**
 * @typedef {Object} WorkspaceSettings
 * @property {boolean} default - Is default workspace
 * @property {string} color - Workspace color
 */

// Export empty object to make this a module
export {} 