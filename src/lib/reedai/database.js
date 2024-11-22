// Import the utils
import {
  string,
  number,
  boolean,
  nullValue,
  undefinedValue,
  array,
  object,
  json,
  date,
  email,
  uuid,
  isoDate,
  url,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isJson,
  validateSchema,
} from './schema-types.js';

// Define the 'Json' type using the 'json' export
const Json = json;

// Define the 'Database' object
const Database = {
  graphql_public: {
    Tables: {},
    Views: {},
    Functions: {
      graphql: {
        Args: {
          operationName: undefinedValue, // optional string
          query: undefinedValue, // optional string
          variables: undefinedValue, // optional Json
          extensions: undefinedValue, // optional Json
        },
        Returns: Json,
      },
    },
    Enums: {},
    CompositeTypes: {},
  },
  public: {
    Tables: {
      embeddings: {
        Row: {
          content: string,
          embedding: string | null,
          id: number,
        },
        Insert: {
          content: string,
          embedding: string | null,
          id: nullValue,
        },
        Update: {
          content: string,
          embedding: string | null,
          id: nullValue,
        },
        Relationships: [],
    },
      // === assistant_collections === //
      assistant_collections: {
        Row: {
          assistant_id: string,
          collection_id: string,
          created_at: isoDate,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          assistant_id: string,
          collection_id: string,
          created_at: isoDate, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          assistant_id: undefinedValue,
          collection_id: undefinedValue,
          created_at: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'assistant_collections_assistant_id_fkey',
            columns: [string], // ["assistant_id"]
            isOneToOne: boolean,
            referencedRelation: 'assistants',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_collections_collection_id_fkey',
            columns: [string], // ["collection_id"]
            isOneToOne: boolean,
            referencedRelation: 'collections',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_collections_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === assistant_files === //
      assistant_files: {
        Row: {
          assistant_id: string,
          created_at: isoDate,
          file_id: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          assistant_id: string,
          created_at: isoDate, // optional string
          file_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          assistant_id: undefinedValue,
          created_at: undefinedValue,
          file_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'assistant_files_assistant_id_fkey',
            columns: [string], // ["assistant_id"]
            isOneToOne: boolean,
            referencedRelation: 'assistants',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_files_file_id_fkey',
            columns: [string], // ["file_id"]
            isOneToOne: boolean,
            referencedRelation: 'files',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_files_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === assistant_tools === //
      assistant_tools: {
        Row: {
          assistant_id: string,
          created_at: isoDate,
          tool_id: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          assistant_id: string,
          created_at: isoDate, // optional string
          tool_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          assistant_id: undefinedValue,
          created_at: undefinedValue,
          tool_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'assistant_tools_assistant_id_fkey',
            columns: [string], // ["assistant_id"]
            isOneToOne: boolean,
            referencedRelation: 'assistants',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_tools_tool_id_fkey',
            columns: [string], // ["tool_id"]
            isOneToOne: boolean,
            referencedRelation: 'tools',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_tools_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === assistant_workspaces === //
      assistant_workspaces: {
        Row: {
          assistant_id: string,
          created_at: isoDate,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          assistant_id: string,
          created_at: isoDate, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          assistant_id: undefinedValue,
          created_at: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'assistant_workspaces_assistant_id_fkey',
            columns: [string], // ["assistant_id"]
            isOneToOne: boolean,
            referencedRelation: 'assistants',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistant_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === assistants === //
      assistants: {
        Row: {
          context_length: number,
          created_at: isoDate,
          description: string,
          embeddings_provider: string,
          folder_id: nullValue,
          id: uuid,
          image_path: url,
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          model: string,
          name: string,
          prompt: string,
          sharing: string,
          temperature: number,
          updated_at: nullValue,
          user_id: uuid,
        },
        Insert: {
          context_length: number,
          created_at: isoDate, // optional string
          description: string,
          embeddings_provider: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          image_path: url,
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          model: string,
          name: string,
          prompt: string,
          sharing: string, // optional string
          temperature: number,
          updated_at: nullValue, // optional string | null
          user_id: uuid,
        },
        Update: {
          context_length: undefinedValue,
          created_at: undefinedValue,
          description: undefinedValue,
          embeddings_provider: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          image_path: undefinedValue,
          include_profile_context: undefinedValue,
          include_workspace_instructions: undefinedValue,
          model: undefinedValue,
          name: undefinedValue,
          prompt: undefinedValue,
          sharing: undefinedValue,
          temperature: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'assistants_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'assistants_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === chat_files === //
      chat_files: {
        Row: {
          chat_id: string,
          created_at: isoDate,
          file_id: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          chat_id: string,
          created_at: isoDate, // optional string
          file_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          chat_id: undefinedValue,
          created_at: undefinedValue,
          file_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'chat_files_chat_id_fkey',
            columns: [string], // ["chat_id"]
            isOneToOne: boolean,
            referencedRelation: 'chats',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'chat_files_file_id_fkey',
            columns: [string], // ["file_id"]
            isOneToOne: boolean,
            referencedRelation: 'files',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'chat_files_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === chats === //
      chats: {
        Row: {
          assistant_id: nullValue,
          context_length: number,
          created_at: isoDate,
          embeddings_provider: string,
          folder_id: nullValue,
          id: uuid,
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          model: string,
          name: string,
          prompt: string,
          sharing: string,
          temperature: number,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          assistant_id: nullValue, // optional string | null
          context_length: number,
          created_at: isoDate, // optional string
          embeddings_provider: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          model: string,
          name: string,
          prompt: string,
          sharing: string, // optional string
          temperature: number,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          assistant_id: nullValue,
          context_length: undefinedValue,
          created_at: undefinedValue,
          embeddings_provider: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          include_profile_context: undefinedValue,
          include_workspace_instructions: undefinedValue,
          model: undefinedValue,
          name: undefinedValue,
          prompt: undefinedValue,
          sharing: undefinedValue,
          temperature: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'chats_assistant_id_fkey',
            columns: [string], // ["assistant_id"]
            isOneToOne: boolean,
            referencedRelation: 'assistants',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'chats_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'chats_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'chats_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === collection_files === //
      collection_files: {
        Row: {
          collection_id: string,
          created_at: isoDate,
          file_id: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          collection_id: string,
          created_at: isoDate, // optional string
          file_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          collection_id: undefinedValue,
          created_at: undefinedValue,
          file_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'collection_files_collection_id_fkey',
            columns: [string], // ["collection_id"]
            isOneToOne: boolean,
            referencedRelation: 'collections',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'collection_files_file_id_fkey',
            columns: [string], // ["file_id"]
            isOneToOne: boolean,
            referencedRelation: 'files',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'collection_files_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === collection_workspaces === //
      collection_workspaces: {
        Row: {
          collection_id: string,
          created_at: isoDate,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          collection_id: string,
          created_at: isoDate, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          collection_id: undefinedValue,
          created_at: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'collection_workspaces_collection_id_fkey',
            columns: [string], // ["collection_id"]
            isOneToOne: boolean,
            referencedRelation: 'collections',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'collection_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'collection_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === collections === //
      collections: {
        Row: {
          created_at: isoDate,
          description: string,
          folder_id: nullValue,
          id: uuid,
          name: string,
          sharing: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          description: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          name: string,
          sharing: string, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          created_at: undefinedValue,
          description: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          name: undefinedValue,
          sharing: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'collections_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'collections_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === file_items === //
      file_items: {
        Row: {
          content: string,
          created_at: isoDate,
          file_id: string,
          id: uuid,
          local_embedding: nullValue,
          openai_embedding: nullValue,
          sharing: string,
          tokens: number,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          content: string,
          created_at: isoDate, // optional string
          file_id: string,
          id: uuid, // optional string
          local_embedding: nullValue, // optional string | null
          openai_embedding: nullValue, // optional string | null
          sharing: string, // optional string
          tokens: number,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          content: undefinedValue,
          created_at: undefinedValue,
          file_id: undefinedValue,
          id: undefinedValue,
          local_embedding: nullValue,
          openai_embedding: nullValue,
          sharing: undefinedValue,
          tokens: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'file_items_file_id_fkey',
            columns: [string], // ["file_id"]
            isOneToOne: boolean,
            referencedRelation: 'files',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'file_items_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === file_workspaces === //
      file_workspaces: {
        Row: {
          created_at: isoDate,
          file_id: string,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          file_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          created_at: undefinedValue,
          file_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'file_workspaces_file_id_fkey',
            columns: [string], // ["file_id"]
            isOneToOne: boolean,
            referencedRelation: 'files',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'file_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'file_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === files === //
      files: {
        Row: {
          created_at: isoDate,
          description: string,
          file_path: string,
          folder_id: nullValue,
          id: uuid,
          name: string,
          sharing: string,
          size: number,
          tokens: number,
          type: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          description: string,
          file_path: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          name: string,
          sharing: string, // optional string
          size: number,
          tokens: number,
          type: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          created_at: undefinedValue,
          description: undefinedValue,
          file_path: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          name: undefinedValue,
          sharing: undefinedValue,
          size: undefinedValue,
          tokens: undefinedValue,
          type: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'files_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'files_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === folders === //
      folders: {
        Row: {
          created_at: isoDate,
          description: string,
          id: uuid,
          name: string,
          type: string,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          description: string,
          id: uuid, // optional string
          name: string,
          type: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          created_at: undefinedValue,
          description: undefinedValue,
          id: undefinedValue,
          name: undefinedValue,
          type: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'folders_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'folders_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === message_file_items === //
      message_file_items: {
        Row: {
          created_at: isoDate,
          file_item_id: string,
          message_id: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          file_item_id: string,
          message_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          created_at: undefinedValue,
          file_item_id: undefinedValue,
          message_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'message_file_items_file_item_id_fkey',
            columns: [string], // ["file_item_id"]
            isOneToOne: boolean,
            referencedRelation: 'file_items',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'message_file_items_message_id_fkey',
            columns: [string], // ["message_id"]
            isOneToOne: boolean,
            referencedRelation: 'messages',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'message_file_items_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === messages === //
      messages: {
        Row: {
          assistant_id: nullValue,
          chat_id: string,
          content: string,
          created_at: isoDate,
          id: uuid,
          image_paths: array, // array of strings
          model: string,
          role: string,
          sequence_number: number,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          assistant_id: nullValue, // optional string | null
          chat_id: string,
          content: string,
          created_at: isoDate, // optional string
          id: uuid, // optional string
          image_paths: array, // array of strings
          model: string,
          role: string,
          sequence_number: number,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          assistant_id: nullValue,
          chat_id: undefinedValue,
          content: undefinedValue,
          created_at: undefinedValue,
          id: undefinedValue,
          image_paths: undefinedValue,
          model: undefinedValue,
          role: undefinedValue,
          sequence_number: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'messages_assistant_id_fkey',
            columns: [string], // ["assistant_id"]
            isOneToOne: boolean,
            referencedRelation: 'assistants',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'messages_chat_id_fkey',
            columns: [string], // ["chat_id"]
            isOneToOne: boolean,
            referencedRelation: 'chats',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'messages_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === model_workspaces === //
      model_workspaces: {
        Row: {
          created_at: isoDate,
          model_id: string,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          model_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          created_at: undefinedValue,
          model_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'model_workspaces_model_id_fkey',
            columns: [string], // ["model_id"]
            isOneToOne: boolean,
            referencedRelation: 'models',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'model_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'model_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === models === //
      models: {
        Row: {
          api_key: string,
          base_url: string,
          context_length: number,
          created_at: isoDate,
          description: string,
          folder_id: nullValue,
          id: uuid,
          model_id: string,
          name: string,
          sharing: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          api_key: string,
          base_url: string,
          context_length: number, // optional number
          created_at: isoDate, // optional string
          description: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          model_id: string,
          name: string,
          sharing: string, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          api_key: undefinedValue,
          base_url: undefinedValue,
          context_length: undefinedValue,
          created_at: undefinedValue,
          description: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          model_id: undefinedValue,
          name: undefinedValue,
          sharing: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'models_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'models_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === preset_workspaces === //
      preset_workspaces: {
        Row: {
          created_at: isoDate,
          preset_id: string,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          preset_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          created_at: undefinedValue,
          preset_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'preset_workspaces_preset_id_fkey',
            columns: [string], // ["preset_id"]
            isOneToOne: boolean,
            referencedRelation: 'presets',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'preset_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'preset_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === presets === //
      presets: {
        Row: {
          context_length: number,
          created_at: isoDate,
          description: string,
          embeddings_provider: string,
          folder_id: nullValue,
          id: uuid,
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          model: string,
          name: string,
          prompt: string,
          sharing: string,
          temperature: number,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          context_length: number,
          created_at: isoDate, // optional string
          description: string,
          embeddings_provider: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          model: string,
          name: string,
          prompt: string,
          sharing: string, // optional string
          temperature: number,
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          context_length: undefinedValue,
          created_at: undefinedValue,
          description: undefinedValue,
          embeddings_provider: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          include_profile_context: undefinedValue,
          include_workspace_instructions: undefinedValue,
          model: undefinedValue,
          name: undefinedValue,
          prompt: undefinedValue,
          sharing: undefinedValue,
          temperature: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'presets_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'presets_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === profiles === //
      profiles: {
        Row: {
          anthropic_api_key: nullValue,
          azure_openai_35_turbo_id: nullValue,
          azure_openai_45_turbo_id: nullValue,
          azure_openai_45_vision_id: nullValue,
          azure_openai_api_key: nullValue,
          azure_openai_embeddings_id: nullValue,
          azure_openai_endpoint: nullValue,
          bio: string,
          created_at: isoDate,
          display_name: string,
          google_gemini_api_key: nullValue,
          groq_api_key: nullValue,
          has_onboarded: boolean,
          id: uuid,
          image_path: url,
          image_url: url,
          mistral_api_key: nullValue,
          openai_api_key: nullValue,
          openai_organization_id: nullValue,
          openrouter_api_key: nullValue,
          perplexity_api_key: nullValue,
          profile_context: string,
          updated_at: nullValue,
          use_azure_openai: boolean,
          user_id: string,
          username: string,
        },
        Insert: {
          anthropic_api_key: nullValue, // optional string | null
          azure_openai_35_turbo_id: nullValue, // optional string | null
          azure_openai_45_turbo_id: nullValue, // optional string | null
          azure_openai_45_vision_id: nullValue, // optional string | null
          azure_openai_api_key: nullValue, // optional string | null
          azure_openai_embeddings_id: nullValue, // optional string | null
          azure_openai_endpoint: nullValue, // optional string | null
          bio: string,
          created_at: isoDate, // optional string
          display_name: string,
          google_gemini_api_key: nullValue, // optional string | null
          groq_api_key: nullValue, // optional string | null
          has_onboarded: boolean, // optional boolean
          id: uuid, // optional string
          image_path: url,
          image_url: url,
          mistral_api_key: nullValue, // optional string | null
          openai_api_key: nullValue, // optional string | null
          openai_organization_id: nullValue, // optional string | null
          openrouter_api_key: nullValue, // optional string | null
          perplexity_api_key: nullValue, // optional string | null
          profile_context: string,
          updated_at: nullValue, // optional string | null
          use_azure_openai: boolean,
          user_id: string,
          username: string,
        },
        Update: {
          anthropic_api_key: nullValue,
          azure_openai_35_turbo_id: nullValue,
          azure_openai_45_turbo_id: nullValue,
          azure_openai_45_vision_id: nullValue,
          azure_openai_api_key: nullValue,
          azure_openai_embeddings_id: nullValue,
          azure_openai_endpoint: nullValue,
          bio: undefinedValue,
          created_at: undefinedValue,
          display_name: undefinedValue,
          google_gemini_api_key: nullValue,
          groq_api_key: nullValue,
          has_onboarded: undefinedValue,
          id: undefinedValue,
          image_path: undefinedValue,
          image_url: undefinedValue,
          mistral_api_key: nullValue,
          openai_api_key: nullValue,
          openai_organization_id: nullValue,
          openrouter_api_key: nullValue,
          perplexity_api_key: nullValue,
          profile_context: undefinedValue,
          updated_at: nullValue,
          use_azure_openai: undefinedValue,
          user_id: undefinedValue,
          username: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === prompt_workspaces === //
      prompt_workspaces: {
        Row: {
          created_at: isoDate,
          prompt_id: string,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          prompt_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          created_at: undefinedValue,
          prompt_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'prompt_workspaces_prompt_id_fkey',
            columns: [string], // ["prompt_id"]
            isOneToOne: boolean,
            referencedRelation: 'prompts',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'prompt_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'prompt_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === prompts === //
      prompts: {
        Row: {
          content: string,
          created_at: isoDate,
          folder_id: nullValue,
          id: uuid,
          name: string,
          sharing: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          content: string,
          created_at: isoDate, // optional string
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          name: string,
          sharing: string, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          content: undefinedValue,
          created_at: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          name: undefinedValue,
          sharing: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'prompts_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'prompts_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === tool_workspaces === //
      tool_workspaces: {
        Row: {
          created_at: isoDate,
          tool_id: string,
          updated_at: nullValue,
          user_id: string,
          workspace_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          tool_id: string,
          updated_at: nullValue, // optional string | null
          user_id: string,
          workspace_id: string,
        },
        Update: {
          created_at: undefinedValue,
          tool_id: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
          workspace_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'tool_workspaces_tool_id_fkey',
            columns: [string], // ["tool_id"]
            isOneToOne: boolean,
            referencedRelation: 'tools',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'tool_workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'tool_workspaces_workspace_id_fkey',
            columns: [string], // ["workspace_id"]
            isOneToOne: boolean,
            referencedRelation: 'workspaces',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === tools === //
      tools: {
        Row: {
          created_at: isoDate,
          custom_headers: Json,
          description: string,
          folder_id: nullValue,
          id: uuid,
          name: string,
          schema: Json,
          sharing: string,
          updated_at: nullValue,
          url: url,
          user_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          custom_headers: Json, // optional Json
          description: string,
          folder_id: nullValue, // optional string | null
          id: uuid, // optional string
          name: string,
          schema: Json, // optional Json
          sharing: string, // optional string
          updated_at: nullValue, // optional string | null
          url: url,
          user_id: string,
        },
        Update: {
          created_at: undefinedValue,
          custom_headers: Json,
          description: undefinedValue,
          folder_id: nullValue,
          id: undefinedValue,
          name: undefinedValue,
          schema: Json,
          sharing: undefinedValue,
          updated_at: nullValue,
          url: undefinedValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'tools_folder_id_fkey',
            columns: [string], // ["folder_id"]
            isOneToOne: boolean,
            referencedRelation: 'folders',
            referencedColumns: [string], // ["id"]
          },
          {
            foreignKeyName: 'tools_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
      // === workspaces === //
      workspaces: {
        Row: {
          created_at: isoDate,
          default_context_length: number,
          default_model: string,
          default_prompt: string,
          default_temperature: number,
          description: string,
          embeddings_provider: string,
          id: uuid,
          image_path: url,
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          instructions: string,
          is_home: boolean,
          name: string,
          sharing: string,
          updated_at: nullValue,
          user_id: string,
        },
        Insert: {
          created_at: isoDate, // optional string
          default_context_length: number,
          default_model: string,
          default_prompt: string,
          default_temperature: number,
          description: string,
          embeddings_provider: string,
          id: uuid, // optional string
          image_path: url, // optional string
          include_profile_context: boolean,
          include_workspace_instructions: boolean,
          instructions: string,
          is_home: boolean, // optional boolean
          name: string,
          sharing: string, // optional string
          updated_at: nullValue, // optional string | null
          user_id: string,
        },
        Update: {
          created_at: undefinedValue,
          default_context_length: undefinedValue,
          default_model: undefinedValue,
          default_prompt: undefinedValue,
          default_temperature: undefinedValue,
          description: undefinedValue,
          embeddings_provider: undefinedValue,
          id: undefinedValue,
          image_path: undefinedValue,
          include_profile_context: undefinedValue,
          include_workspace_instructions: undefinedValue,
          instructions: undefinedValue,
          is_home: undefinedValue,
          name: undefinedValue,
          sharing: undefinedValue,
          updated_at: nullValue,
          user_id: undefinedValue,
        },
        Relationships: [
          {
            foreignKeyName: 'workspaces_user_id_fkey',
            columns: [string], // ["user_id"]
            isOneToOne: boolean,
            referencedRelation: 'users',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
    },
    Views: {},
    Functions: {
      // === create_duplicate_messages_for_new_chat === //
      create_duplicate_messages_for_new_chat: {
        Args: {
          old_chat_id: uuid,
          new_chat_id: uuid,
          new_user_id: uuid,
        },
        Returns: undefinedValue,
      },
      // === delete_message_including_and_after === //
      delete_message_including_and_after: {
        Args: {
          p_user_id: uuid,
          p_chat_id: uuid,
          p_sequence_number: number,
        },
        Returns: undefinedValue,
      },
      // === delete_messages_including_and_after === //
      delete_messages_including_and_after: {
        Args: {
          p_user_id: uuid,
          p_chat_id: uuid,
          p_sequence_number: number,
        },
        Returns: undefinedValue,
      },
      // === delete_storage_object === //
      delete_storage_object: {
        Args: {
          bucket: string,
          object: string,
        },
        Returns: object, // Record<string, unknown>
      },
      // === delete_storage_object_from_bucket === //
      delete_storage_object_from_bucket: {
        Args: {
          bucket_name: string,
          object_path: string,
        },
        Returns: object, // Record<string, unknown>
      },
      // === match_file_items_local === //
      match_file_items_local: {
        Args: {
          query_embedding: string,
          match_count: number, // optional
          file_ids: array, // optional array of strings
        },
        Returns: array, // Array of matching items
      },
      // === match_file_items_openai === //
      match_file_items_openai: {
        Args: {
          query_embedding: string,
          match_count: number, // optional
          file_ids: array, // optional array of strings
        },
        Returns: array, // Array of matching items
      },
      // === non_private_assistant_exists === //
      non_private_assistant_exists: {
        Args: {
          p_name: string,
        },
        Returns: boolean,
      },
      // === non_private_file_exists === //
      non_private_file_exists: {
        Args: {
          p_name: string,
        },
        Returns: boolean,
      },
      // === non_private_workspace_exists === //
      non_private_workspace_exists: {
        Args: {
          p_name: string,
        },
        Returns: boolean,
      },
    },
    Enums: {},
    CompositeTypes: {},
  },
  storage: {
    Tables: {
      // === buckets === //
      buckets: {
        Row: {
          allowed_mime_types: nullValue, // array of strings or null
          avif_autodetection: nullValue, // boolean or null
          created_at: nullValue, // string or null
          file_size_limit: nullValue, // number or null
          id: string,
          name: string,
          owner: nullValue,
          owner_id: nullValue,
          public: nullValue,
          updated_at: nullValue,
        },
        Insert: {
          allowed_mime_types: nullValue, // optional array of strings or null
          avif_autodetection: nullValue, // optional boolean or null
          created_at: nullValue, // optional string or null
          file_size_limit: nullValue, // optional number or null
          id: string,
          name: string,
          owner: nullValue, // optional string or null
          owner_id: nullValue, // optional string or null
          public: nullValue, // optional boolean or null
          updated_at: nullValue, // optional string or null
        },
        Update: {
          allowed_mime_types: nullValue,
          avif_autodetection: nullValue,
          created_at: nullValue,
          file_size_limit: nullValue,
          id: undefinedValue,
          name: undefinedValue,
          owner: nullValue,
          owner_id: nullValue,
          public: nullValue,
          updated_at: nullValue,
        },
        Relationships: [],
      },
      // === migrations === //
      migrations: {
        Row: {
          executed_at: nullValue,
          hash: string,
          id: number,
          name: string,
        },
        Insert: {
          executed_at: nullValue,
          hash: string,
          id: number,
          name: string,
        },
        Update: {
          executed_at: nullValue,
          hash: undefinedValue,
          id: undefinedValue,
          name: undefinedValue,
        },
        Relationships: [],
      },
      // === objects === //
      objects: {
        Row: {
          bucket_id: nullValue,
          created_at: nullValue,
          id: string,
          last_accessed_at: nullValue,
          metadata: Json,
          name: nullValue,
          owner: nullValue,
          owner_id: nullValue,
          path_tokens: nullValue, // array of strings or null
          updated_at: nullValue,
          version: nullValue,
        },
        Insert: {
          bucket_id: nullValue, // optional string or null
          created_at: nullValue,
          id: string,
          last_accessed_at: nullValue,
          metadata: Json,
          name: nullValue,
          owner: nullValue,
          owner_id: nullValue,
          path_tokens: nullValue,
          updated_at: nullValue,
          version: nullValue,
        },
        Update: {
          bucket_id: nullValue,
          created_at: nullValue,
          id: undefinedValue,
          last_accessed_at: nullValue,
          metadata: Json,
          name: nullValue,
          owner: nullValue,
          owner_id: nullValue,
          path_tokens: nullValue,
          updated_at: nullValue,
          version: nullValue,
        },
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey',
            columns: [string], // ["bucket_id"]
            isOneToOne: boolean,
            referencedRelation: 'buckets',
            referencedColumns: [string], // ["id"]
          },
        ],
      },
    },
    Views: {},
    Functions: {
      // === can_insert_object === //
      can_insert_object: {
        Args: {
          bucketid: string,
          name: string,
          owner: string,
          metadata: Json,
        },
        Returns: undefinedValue,
      },
      // === extension === //
      extension: {
        Args: {
          name: string,
        },
        Returns: string,
      },
      // === filename === //
      filename: {
        Args: {
          name: string,
        },
        Returns: string,
      },
      // === foldername === //
      foldername: {
        Args: {
          name: string,
        },
        Returns: array, // array of strings
      },
      // === get_size_by_bucket === //
      get_size_by_bucket: {
        Args: object, // Empty object
        Returns: [
          {
            size: number,
            bucket_id: string,
          },
        ],
      },
      // === search === //
      search: {
        Args: {
          prefix: string,
          bucketname: string,
          limits: number, // optional
          levels: number, // optional
          offsets: number, // optional
          search: string, // optional
          sortcolumn: string, // optional
          sortorder: string, // optional
        },
        Returns: [
          {
            name: string,
            id: string,
            updated_at: isoDate,
            created_at: isoDate,
            last_accessed_at: isoDate,
            metadata: Json,
          },
        ],
      },
    },
    Enums: {},
    CompositeTypes: {},
  },
};

// Define 'PublicSchema' as 'Database.public'
const PublicSchema = Database.public;

// Define utility functions (as placeholders)
function Tables(PublicTableNameOrOptions, TableName = null) {
  // Implement logic if needed
}

function TablesInsert(PublicTableNameOrOptions, TableName = null) {
  // Implement logic if needed
}

function TablesUpdate(PublicTableNameOrOptions, TableName = null) {
  // Implement logic if needed
}

function Enums(PublicEnumNameOrOptions, EnumName = null) {
  // Implement logic if needed
}

// === Validation Functions === //
export const validateDatabaseSchema = (data, schema) => {
  // Add schema validation logic here
  if (!data || typeof data !== 'object') return false;

  return Object.keys(schema).every(key => {
    const schemaType = schema[key];
    const value = data[key];

    if (typeof schemaType === 'function') {
      return schemaType(value);
    }

    if (Array.isArray(schemaType)) {
      return (
        Array.isArray(value) &&
        value.every(item => validateDatabaseSchema(item, schemaType[0]))
      );
    }

    if (typeof schemaType === 'object') {
      return validateDatabaseSchema(value, schemaType);
    }

    return true;
  });
};

// === Type Guards === //
export const isAssistant = data => {
  return validateDatabaseSchema(data, Database.public.Tables.assistants.Row);
};

export const isChat = data => {
  return validateDatabaseSchema(data, Database.public.Tables.chats.Row);
};

// Add more type guards as needed...

export const createEmptyRow = tableSchema => {
  const row = {};
  Object.keys(tableSchema.Row).forEach(key => {
    const type = tableSchema.Row[key];
    if (type === string) row[key] = '';
    else if (type === number) row[key] = 0;
    else if (type === boolean) row[key] = false;
    else if (type === array) row[key] = [];
    else if (type === object) row[key] = {};
    else if (type === nullValue) row[key] = null;
    else row[key] = undefined;
  });
  return row;
};

// Export the necessary modules (if using ES6 modules)
export {
  Json,
  Database,
  PublicSchema,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
};
