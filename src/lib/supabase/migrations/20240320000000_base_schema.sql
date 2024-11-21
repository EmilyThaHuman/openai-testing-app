-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_crypto";

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique,
    full_name text,
    avatar_url text,
    has_completed_onboarding boolean default false,
    settings jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Chat and canvas settings
    default_system_prompt text,
    theme_preference text default 'system',
    language_preference text default 'en',
    editor_settings jsonb default '{
        "fontSize": 14,
        "theme": "vs-dark",
        "minimap": false,
        "wordWrap": "on"
    }'::jsonb
);

-- Create messages table for chat history
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    content text not null,
    role text not null check (role in ('user', 'assistant', 'system')),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    thread_id text,
    parent_id uuid references public.messages(id)
);

-- Create code_snippets table
create table if not exists public.code_snippets (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    title text,
    content text not null,
    language text default 'javascript',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.code_snippets enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
    on profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile."
    on profiles for update
    using ( auth.uid() = id );

-- Messages policies
create policy "Users can view their own messages."
    on messages for select
    using ( auth.uid() = profile_id );

create policy "Users can insert their own messages."
    on messages for insert
    with check ( auth.uid() = profile_id );

-- Code snippets policies
create policy "Users can view their own snippets."
    on code_snippets for select
    using ( auth.uid() = profile_id );

create policy "Users can insert their own snippets."
    on code_snippets for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own snippets."
    on code_snippets for update
    using ( auth.uid() = profile_id );

create policy "Users can delete their own snippets."
    on code_snippets for delete
    using ( auth.uid() = profile_id );

-- Create indexes
create index if not exists profiles_email_idx on profiles (email);
create index if not exists profiles_onboarding_idx on profiles (has_completed_onboarding);
create index if not exists messages_profile_id_idx on messages (profile_id);
create index if not exists messages_thread_id_idx on messages (thread_id);
create index if not exists code_snippets_profile_id_idx on code_snippets (profile_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add triggers
create trigger handle_profiles_updated_at
    before update on profiles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_code_snippets_updated_at
    before update on code_snippets
    for each row
    execute procedure public.handle_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.code_snippets; 