-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  has_completed_onboarding boolean default false,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create storage buckets
insert into storage.buckets (id, name)
values 
  ('avatars', 'avatars'),
  ('workspace_images', 'workspace_images'),
  ('assistant_images', 'assistant_images');

-- Set up storage policies
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Only owners can update avatars."
  on storage.objects for update
  using ( auth.uid() = owner );

-- Create workspaces table
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  image_path text default ''::text,
  user_id uuid references auth.users not null,
  is_home boolean default false
);

-- Set up RLS for workspaces
alter table public.workspaces enable row level security;

create policy "Users can view their own workspaces."
  on workspaces for select
  using ( auth.uid() = user_id );

create policy "Users can create their own workspaces."
  on workspaces for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own workspaces."
  on workspaces for update
  using ( auth.uid() = user_id ); 