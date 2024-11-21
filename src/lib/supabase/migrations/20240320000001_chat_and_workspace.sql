-- Create workspaces table for organizing content
create table if not exists public.workspaces (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    description text,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_threads table for organizing conversations
create table if not exists public.chat_threads (
    id uuid default uuid_generate_v4() primary key,
    workspace_id uuid references public.workspaces(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    title text,
    system_prompt text,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_message_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_files table for file attachments
create table if not exists public.chat_files (
    id uuid default uuid_generate_v4() primary key,
    thread_id uuid references public.chat_threads(id) on delete cascade,
    message_id uuid references public.messages(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    file_name text not null,
    file_type text not null,
    file_size bigint not null,
    storage_path text not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_preferences table for detailed settings
create table if not exists public.user_preferences (
    profile_id uuid references public.profiles(id) on delete cascade primary key,
    editor_settings jsonb default '{
        "theme": "vs-dark",
        "fontSize": 14,
        "tabSize": 2,
        "minimap": false,
        "wordWrap": "on",
        "lineNumbers": "on",
        "formatOnSave": true
    }'::jsonb,
    chat_settings jsonb default '{
        "streamResponses": true,
        "showTimestamps": true,
        "showAvatars": true,
        "soundEnabled": false
    }'::jsonb,
    ai_settings jsonb default '{
        "model": "gpt-4",
        "temperature": 0.7,
        "maxTokens": 2000
    }'::jsonb,
    ui_settings jsonb default '{
        "theme": "system",
        "fontSize": "medium",
        "reducedMotion": false,
        "highContrast": false
    }'::jsonb,
    notification_settings jsonb default '{
        "email": true,
        "desktop": false,
        "sound": false
    }'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.workspaces enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_files enable row level security;
alter table public.user_preferences enable row level security;

-- Workspace policies
create policy "Users can view their own workspaces."
    on workspaces for select
    using ( auth.uid() = profile_id );

create policy "Users can create their own workspaces."
    on workspaces for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own workspaces."
    on workspaces for update
    using ( auth.uid() = profile_id );

create policy "Users can delete their own workspaces."
    on workspaces for delete
    using ( auth.uid() = profile_id );

-- Chat thread policies
create policy "Users can view their own chat threads."
    on chat_threads for select
    using ( auth.uid() = profile_id );

create policy "Users can create chat threads in their workspaces."
    on chat_threads for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own chat threads."
    on chat_threads for update
    using ( auth.uid() = profile_id );

create policy "Users can delete their own chat threads."
    on chat_threads for delete
    using ( auth.uid() = profile_id );

-- Chat files policies
create policy "Users can view their own chat files."
    on chat_files for select
    using ( auth.uid() = profile_id );

create policy "Users can upload their own chat files."
    on chat_files for insert
    with check ( auth.uid() = profile_id );

create policy "Users can delete their own chat files."
    on chat_files for delete
    using ( auth.uid() = profile_id );

-- User preferences policies
create policy "Users can view their own preferences."
    on user_preferences for select
    using ( auth.uid() = profile_id );

create policy "Users can update their own preferences."
    on user_preferences for update
    using ( auth.uid() = profile_id );

create policy "Users can insert their own preferences."
    on user_preferences for insert
    with check ( auth.uid() = profile_id );

-- Create indexes
create index if not exists workspaces_profile_id_idx on workspaces (profile_id);
create index if not exists chat_threads_workspace_id_idx on chat_threads (workspace_id);
create index if not exists chat_threads_profile_id_idx on chat_threads (profile_id);
create index if not exists chat_files_thread_id_idx on chat_files (thread_id);
create index if not exists chat_files_message_id_idx on chat_files (message_id);

-- Add triggers for updated_at
create trigger handle_workspaces_updated_at
    before update on workspaces
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_chat_threads_updated_at
    before update on chat_threads
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_user_preferences_updated_at
    before update on user_preferences
    for each row
    execute procedure public.handle_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.workspaces;
alter publication supabase_realtime add table public.chat_threads;
alter publication supabase_realtime add table public.chat_files;
alter publication supabase_realtime add table public.user_preferences; 