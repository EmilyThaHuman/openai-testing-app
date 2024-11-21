create table if not exists public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  settings jsonb default '{
    "default": true,
    "color": "#4f46e5"
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(profile_id, name)
);

-- Enable RLS
alter table public.workspaces enable row level security;

-- Create policies
create policy "Users can view their own workspaces"
  on public.workspaces for select
  using ( auth.uid() = profile_id );

create policy "Users can update their own workspaces"
  on public.workspaces for update
  using ( auth.uid() = profile_id );

create policy "Users can insert their own workspaces"
  on public.workspaces for insert
  with check ( auth.uid() = profile_id );

create policy "Users can delete their own workspaces"
  on public.workspaces for delete
  using ( auth.uid() = profile_id ); 