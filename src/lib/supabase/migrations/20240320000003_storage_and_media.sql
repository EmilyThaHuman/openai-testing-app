-- Create media_files table for general file storage
create table if not exists public.media_files (
    id uuid default uuid_generate_v4() primary key,
    profile_id uuid references public.profiles(id) on delete cascade,
    bucket_id text not null,
    file_name text not null,
    file_type text not null,
    file_size bigint not null,
    storage_path text not null,
    original_name text,
    mime_type text,
    metadata jsonb default '{}'::jsonb,
    is_public boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(bucket_id, storage_path)
);

-- Create chat_attachments table for message attachments
create table if not exists public.chat_attachments (
    id uuid default uuid_generate_v4() primary key,
    message_id uuid references public.messages(id) on delete cascade,
    profile_id uuid references public.profiles(id) on delete cascade,
    media_file_id uuid references public.media_files(id) on delete cascade,
    type text not null check (type in ('image', 'file', 'code', 'link')),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create storage buckets if they don't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('chat-images', 'chat-images', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('user-files', 'user-files', false, 10485760, array['application/pdf', 'text/plain', 'application/json', 'text/markdown']),
    ('code-snippets', 'code-snippets', false, 1048576, array['text/plain', 'application/json', 'text/markdown']),
    ('profile-images', 'profile-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Enable RLS
alter table public.media_files enable row level security;
alter table public.chat_attachments enable row level security;

-- Media files policies
create policy "Users can view their own files."
    on media_files for select
    using ( auth.uid() = profile_id );

create policy "Users can view public files."
    on media_files for select
    using ( is_public = true );

create policy "Users can upload their own files."
    on media_files for insert
    with check ( auth.uid() = profile_id );

create policy "Users can update their own files."
    on media_files for update
    using ( auth.uid() = profile_id );

create policy "Users can delete their own files."
    on media_files for delete
    using ( auth.uid() = profile_id );

-- Chat attachments policies
create policy "Users can view their own attachments."
    on chat_attachments for select
    using ( auth.uid() = profile_id );

create policy "Users can create their own attachments."
    on chat_attachments for insert
    with check ( auth.uid() = profile_id );

create policy "Users can delete their own attachments."
    on chat_attachments for delete
    using ( auth.uid() = profile_id );

-- Storage policies
create policy "Chat images are publicly accessible."
    on storage.objects for select
    using ( bucket_id = 'chat-images' );

create policy "Users can upload chat images."
    on storage.objects for insert
    with check (
        bucket_id = 'chat-images' 
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
    );

create policy "Users can access their own files."
    on storage.objects for select
    using (
        auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can upload their own files."
    on storage.objects for insert
    with check (
        auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can update their own files."
    on storage.objects for update
    using (
        auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can delete their own files."
    on storage.objects for delete
    using (
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create indexes
create index if not exists media_files_profile_id_idx on media_files (profile_id);
create index if not exists media_files_bucket_path_idx on media_files (bucket_id, storage_path);
create index if not exists chat_attachments_message_id_idx on chat_attachments (message_id);
create index if not exists chat_attachments_media_file_id_idx on chat_attachments (media_file_id);

-- Add trigger for updated_at
create trigger handle_media_files_updated_at
    before update on media_files
    for each row
    execute procedure public.handle_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.media_files;
alter publication supabase_realtime add table public.chat_attachments;

-- Add functions for file management
create or replace function public.get_signed_url(
    bucket text,
    filepath text,
    expires_in integer default 300
)
returns text
language plpgsql
security definer
as $$
begin
    return storage.create_signed_url(
        bucket,
        filepath,
        expires_in
    );
end;
$$;

-- Add function to clean up orphaned files
create or replace function public.cleanup_orphaned_files()
returns void
language plpgsql
security definer
as $$
begin
    delete from storage.objects
    where created_at < now() - interval '1 day'
    and id not in (
        select storage_path from media_files
    );
end;
$$; 