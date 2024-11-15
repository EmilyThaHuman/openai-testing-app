-- Create assistants table
create table public.assistants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  instructions text,
  model text not null,
  image_path text default ''::text,
  user_id uuid references auth.users not null
);

-- Create chats table
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  workspace_id uuid references public.workspaces not null,
  user_id uuid references auth.users not null,
  assistant_id uuid references public.assistants,
  model text,
  temperature numeric(3,2) default 0.7,
  context_length integer default 4096
);

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  chat_id uuid references public.chats not null,
  user_id uuid references auth.users not null,
  role text not null,
  content text not null,
  model text,
  tokens_used integer default 0,
  image_paths text[] default array[]::text[]
);

-- Create files table
create table public.files (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type text not null,
  size integer not null,
  file_path text not null,
  user_id uuid references auth.users not null,
  workspace_id uuid references public.workspaces not null
);

-- Create collections table for organizing files
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  user_id uuid references auth.users not null,
  workspace_id uuid references public.workspaces not null
);

-- Create collection_files junction table
create table public.collection_files (
  collection_id uuid references public.collections not null,
  file_id uuid references public.files not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (collection_id, file_id)
);

-- Create presets table for saving chat configurations
create table public.presets (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  model text not null,
  temperature numeric(3,2) default 0.7,
  context_length integer default 4096,
  user_id uuid references auth.users not null,
  workspace_id uuid references public.workspaces not null
);

-- Set up RLS policies for all tables
alter table public.assistants enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.files enable row level security;
alter table public.collections enable row level security;
alter table public.collection_files enable row level security;
alter table public.presets enable row level security;

-- RLS policies for assistants
create policy "Users can view their own assistants"
  on assistants for select
  using (auth.uid() = user_id);

create policy "Users can create their own assistants"
  on assistants for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assistants"
  on assistants for update
  using (auth.uid() = user_id);

-- RLS policies for chats
create policy "Users can view their own chats"
  on chats for select
  using (auth.uid() = user_id);

create policy "Users can create their own chats"
  on chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own chats"
  on chats for update
  using (auth.uid() = user_id);

-- RLS policies for messages
create policy "Users can view messages in their chats"
  on messages for select
  using (auth.uid() in (
    select user_id from chats where id = messages.chat_id
  ));

create policy "Users can create messages in their chats"
  on messages for insert
  with check (auth.uid() = user_id);

-- RLS policies for files
create policy "Users can view their own files"
  on files for select
  using (auth.uid() = user_id);

create policy "Users can create their own files"
  on files for insert
  with check (auth.uid() = user_id);

-- RLS policies for collections
create policy "Users can view their own collections"
  on collections for select
  using (auth.uid() = user_id);

create policy "Users can create their own collections"
  on collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on collections for update
  using (auth.uid() = user_id);

-- RLS policies for collection_files
create policy "Users can view their own collection files"
  on collection_files for select
  using (auth.uid() in (
    select user_id from collections where id = collection_files.collection_id
  ));

create policy "Users can manage their own collection files"
  on collection_files for insert
  with check (auth.uid() in (
    select user_id from collections where id = collection_files.collection_id
  ));

-- RLS policies for presets
create policy "Users can view their own presets"
  on presets for select
  using (auth.uid() = user_id);

create policy "Users can create their own presets"
  on presets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presets"
  on presets for update
  using (auth.uid() = user_id);

-- Create indexes for better query performance
create index idx_chats_workspace_id on chats(workspace_id);
create index idx_messages_chat_id on messages(chat_id);
create index idx_files_workspace_id on files(workspace_id);
create index idx_collections_workspace_id on collections(workspace_id); 