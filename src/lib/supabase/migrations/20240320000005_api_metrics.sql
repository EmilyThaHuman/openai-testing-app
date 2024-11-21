-- Create API metrics table
create table if not exists public.api_metrics (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  endpoint text not null,
  total_calls integer default 0,
  chat_calls integer default 0,
  image_calls integer default 0,
  audio_calls integer default 0,
  embedding_calls integer default 0,
  duration integer,
  status_code integer,
  error_message text,
  model text,
  tokens_used integer default 0,
  cost numeric(10,6) default 0,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.api_metrics enable row level security;

-- Create policies
create policy "Users can view their own metrics"
  on public.api_metrics for select
  using ( auth.uid() = profile_id );

create policy "Users can insert their own metrics"
  on public.api_metrics for insert
  with check ( auth.uid() = profile_id );

-- Create aggregated metrics view
create or replace view public.aggregated_metrics as
select
  profile_id,
  date_trunc('hour', timestamp) as time_bucket,
  count(*) as total_requests,
  sum(case when type = 'chat' then 1 else 0 end) as chat_requests,
  sum(case when type = 'image' then 1 else 0 end) as image_requests,
  sum(case when type = 'audio' then 1 else 0 end) as audio_requests,
  avg(duration) as avg_duration,
  sum(tokens_used) as total_tokens,
  sum(cost) as total_cost,
  count(case when status_code >= 400 then 1 end) as errors
from public.api_metrics
group by profile_id, time_bucket;

-- Create function to clean up old metrics
create or replace function public.cleanup_old_metrics()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Keep only last 90 days of metrics
  delete from public.api_metrics
  where timestamp < now() - interval '90 days';
  return new;
end;
$$;

-- Create trigger for metrics cleanup
create trigger cleanup_old_metrics_trigger
  after insert on public.api_metrics
  execute procedure public.cleanup_old_metrics();

-- Create real-time metrics function
create or replace function public.handle_new_metric()
returns trigger
language plpgsql
as $$
begin
  perform pg_notify(
    'new_metric',
    json_build_object(
      'profile_id', new.profile_id,
      'metric', json_build_object(
        'id', new.id,
        'type', new.type,
        'endpoint', new.endpoint,
        'duration', new.duration,
        'timestamp', new.timestamp
      )
    )::text
  );
  return new;
end;
$$;

-- Create trigger for real-time metrics
create trigger handle_new_metric_trigger
  after insert on public.api_metrics
  for each row execute procedure public.handle_new_metric(); 