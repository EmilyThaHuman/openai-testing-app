-- Create additional storage buckets
insert into storage.buckets (id, name, public)
values 
  ('user_files', 'user_files', false),
  ('chat_images', 'chat_images', false),
  ('message_attachments', 'message_attachments', false),
  ('code_snippets', 'code_snippets', false);

-- Storage policies for user files
create policy "Users can view their own files"
  on storage.objects for select
  using (
    auth.uid()::text = (storage.foldername(name))[1]
    and bucket_id = 'user_files'
  );

create policy "Users can upload their own files"
  on storage.objects for insert
  with check (
    auth.uid()::text = (storage.foldername(name))[1]
    and bucket_id = 'user_files'
  );

-- Storage policies for chat images
create policy "Users can access chat images they're part of"
  on storage.objects for select
  using (
    bucket_id = 'chat_images' 
    and auth.uid() in (
      select user_id from chats where id::text = (storage.foldername(name))[1]
    )
  );

-- Create prompts table
create table public.prompts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  content text not null,
  user_id uuid references auth.users not null,
  workspace_id uuid references public.workspaces not null,
  is_public boolean default false,
  tags text[] default array[]::text[]
);

-- Create tools table
create table public.tools (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  type text not null, -- 'function', 'code_interpreter', 'retrieval'
  definition jsonb not null, -- Store tool configuration/schema
  user_id uuid references auth.users not null,
  workspace_id uuid references public.workspaces not null
);

-- Create code_blocks table for storing chat response code snippets
create table public.code_blocks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message_id uuid references public.messages not null,
  language text not null,
  code text not null,
  file_path text, -- Optional file path if code represents file changes
  line_start integer,
  line_end integer
);

-- Create assistant_tools junction table
create table public.assistant_tools (
  assistant_id uuid references public.assistants not null,
  tool_id uuid references public.tools not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (assistant_id, tool_id)
);

-- Create message_file_items table for tracking file references in messages
create table public.message_file_items (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.messages not null,
  file_id uuid references public.files not null,
  type text not null, -- 'attachment', 'reference', 'generated'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.prompts enable row level security;
alter table public.tools enable row level security;
alter table public.code_blocks enable row level security;
alter table public.assistant_tools enable row level security;
alter table public.message_file_items enable row level security;

-- RLS policies for prompts
create policy "Users can view their own prompts"
  on prompts for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can create their own prompts"
  on prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own prompts"
  on prompts for update
  using (auth.uid() = user_id);

-- RLS policies for tools
create policy "Users can view their own tools"
  on tools for select
  using (auth.uid() = user_id);

create policy "Users can create their own tools"
  on tools for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tools"
  on tools for update
  using (auth.uid() = user_id);

-- RLS policies for code blocks
create policy "Users can view code blocks from their messages"
  on code_blocks for select
  using (auth.uid() in (
    select user_id from messages where id = message_id
  ));

create policy "Users can create code blocks in their messages"
  on code_blocks for insert
  with check (auth.uid() in (
    select user_id from messages where id = message_id
  ));

-- RLS policies for assistant tools
create policy "Users can view their assistant tools"
  on assistant_tools for select
  using (auth.uid() in (
    select user_id from assistants where id = assistant_id
  ));

create policy "Users can manage their assistant tools"
  on assistant_tools for insert
  with check (auth.uid() in (
    select user_id from assistants where id = assistant_id
  ));

-- Create indexes for better query performance
create index idx_prompts_workspace_id on prompts(workspace_id);
create index idx_tools_workspace_id on tools(workspace_id);
create index idx_code_blocks_message_id on code_blocks(message_id);
create index idx_message_file_items_message_id on message_file_items(message_id);
create index idx_message_file_items_file_id on message_file_items(file_id);

-- Add triggers for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

create trigger update_prompts_updated_at
    before update on prompts
    for each row
    execute function update_updated_at_column();

create trigger update_tools_updated_at
    before update on tools
    for each row
    execute function update_updated_at_column(); 