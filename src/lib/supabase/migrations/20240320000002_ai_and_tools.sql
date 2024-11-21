-- Create AI assistants table
create table if not exists public.ai_assistants (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    description text,
    model text not null default 'gpt-4',
    system_prompt text,
    tools jsonb default '[]'::jsonb,
    settings jsonb default '{
        "temperature": 0.7,
        "maxTokens": 2000,
        "topP": 1,
        "frequencyPenalty": 0,
        "presencePenalty": 0
    }'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tools table for custom functions
create table if not exists public.tools (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    description text,
    type text not null check (type in ('function', 'retrieval', 'code_interpreter')),
    schema jsonb,
    code text,
    enabled boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tool_executions table for logging
create table if not exists public.tool_executions (
    id uuid default uuid_generate_v4() primary key,
    tool_id uuid references public.tools(id) on delete cascade,
    message_id uuid references public.messages(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    input jsonb,
    output jsonb,
    error text,
    duration interval,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create api_keys table
create table if not exists public.api_keys (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    key_hash text not null,
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(profile_id, name)
);

-- Create usage_logs table
create table if not exists public.usage_logs (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    type text not null check (type in ('chat', 'tool', 'api')),
    tokens_used integer default 0,
    cost numeric(10,6) default 0,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ai_assistants enable row level security;
alter table public.tools enable row level security;
alter table public.tool_executions enable row level security;
alter table public.api_keys enable row level security;
alter table public.usage_logs enable row level security;

-- AI Assistants policies
create policy "Users can view their own assistants."
    on ai_assistants for select
    using ( auth.uid() = profile_id );

create policy "Users can create their own assistants."
    on ai_assistants for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own assistants."
    on ai_assistants for update
    using ( auth.uid() = profile_id );

create policy "Users can delete their own assistants."
    on ai_assistants for delete
    using ( auth.uid() = profile_id );

-- Tools policies
create policy "Users can view their own tools."
    on tools for select
    using ( auth.uid() = profile_id );

create policy "Users can create their own tools."
    on tools for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own tools."
    on tools for update
    using ( auth.uid() = profile_id );

-- Tool executions policies
create policy "Users can view their own tool executions."
    on tool_executions for select
    using ( auth.uid() = profile_id );

create policy "Users can create tool execution logs."
    on tool_executions for insert
    with check ( auth.uid() = profile_id );

-- API keys policies
create policy "Users can view their own API keys."
    on api_keys for select
    using ( auth.uid() = profile_id );

create policy "Users can create their own API keys."
    on api_keys for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own API keys."
    on api_keys for update
    using ( auth.uid() = profile_id );

-- Usage logs policies
create policy "Users can view their own usage logs."
    on usage_logs for select
    using ( auth.uid() = profile_id );

create policy "System can insert usage logs."
    on usage_logs for insert
    with check ( auth.uid() = profile_id );

-- Create indexes
create index if not exists ai_assistants_profile_id_idx on ai_assistants (profile_id);
create index if not exists tools_profile_id_idx on tools (profile_id);
create index if not exists tool_executions_tool_id_idx on tool_executions (tool_id);
create index if not exists api_keys_profile_id_idx on api_keys (profile_id);
create index if not exists usage_logs_profile_id_idx on usage_logs (profile_id);
create index if not exists usage_logs_type_idx on usage_logs (type);

-- Add triggers
create trigger handle_ai_assistants_updated_at
    before update on ai_assistants
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_tools_updated_at
    before update on tools
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_api_keys_updated_at
    before update on api_keys
    for each row
    execute procedure public.handle_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.ai_assistants;
alter publication supabase_realtime add table public.tools;
alter publication supabase_realtime add table public.tool_executions;
alter publication supabase_realtime add table public.usage_logs; 