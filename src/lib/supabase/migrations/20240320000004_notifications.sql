-- Create notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('success', 'error', 'warning', 'info')),
  title text not null,
  message text not null,
  read boolean default false,
  data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Create policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = profile_id );

create policy "Users can update their own notifications"
  on public.notifications for update
  using ( auth.uid() = profile_id );

-- Create function to handle notification cleanup
create or replace function public.cleanup_old_notifications()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Delete notifications older than 30 days
  delete from public.notifications
  where created_at < now() - interval '30 days';
  return new;
end;
$$;

-- Create trigger for notification cleanup
create trigger cleanup_old_notifications_trigger
  after insert on public.notifications
  execute procedure public.cleanup_old_notifications();

-- Create function to handle real-time notifications
create or replace function public.handle_new_notification()
returns trigger
language plpgsql
as $$
begin
  perform pg_notify(
    'new_notification',
    json_build_object(
      'profile_id', new.profile_id,
      'notification', json_build_object(
        'id', new.id,
        'type', new.type,
        'title', new.title,
        'message', new.message,
        'created_at', new.created_at
      )
    )::text
  );
  return new;
end;
$$;

-- Create trigger for real-time notifications
create trigger handle_new_notification_trigger
  after insert on public.notifications
  for each row execute procedure public.handle_new_notification(); 