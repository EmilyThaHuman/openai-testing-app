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
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Create policies
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using ( auth.uid() = profile_id );

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using ( auth.uid() = profile_id );

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check ( auth.uid() = profile_id ); 