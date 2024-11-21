-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  full_name text,
  avatar_url text,
  has_completed_onboarding boolean default false,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create indexes for better performance
create index if not exists profiles_email_idx on profiles (email);
create index if not exists profiles_onboarding_idx on profiles (has_completed_onboarding);

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure public.handle_updated_at();

-- Add comments for documentation
comment on table public.profiles is 'User profile information and settings';
comment on column profiles.id is 'References auth.users.id';
comment on column profiles.email is 'User email address';
comment on column profiles.full_name is 'User full name';
comment on column profiles.avatar_url is 'URL to user avatar image';
comment on column profiles.has_completed_onboarding is 'Whether user has completed onboarding';
comment on column profiles.settings is 'JSON object containing user settings';
comment on column profiles.created_at is 'Timestamp when profile was created';
comment on column profiles.updated_at is 'Timestamp when profile was last updated';

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Set up realtime subscriptions
alter publication supabase_realtime add table public.profiles;

-- Set up storage for avatars
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' ); 