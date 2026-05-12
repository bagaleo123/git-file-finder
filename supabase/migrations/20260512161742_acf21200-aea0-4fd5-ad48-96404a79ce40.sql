
-- PROFILES
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  language text not null default 'en',
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id);

-- timestamp trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- CASES
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  employer_name text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.cases enable row level security;
create index cases_user_idx on public.cases(user_id, created_at desc);
create policy "own cases all" on public.cases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger cases_touch before update on public.cases for each row execute function public.touch_updated_at();

-- CASE MESSAGES
create table public.case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.case_messages enable row level security;
create index case_messages_case_idx on public.case_messages(case_id, created_at);
create policy "own case msgs all" on public.case_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CASE FILES
create table public.case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  extracted_text text,
  created_at timestamptz not null default now()
);
alter table public.case_files enable row level security;
create index case_files_case_idx on public.case_files(case_id, created_at desc);
create policy "own case files all" on public.case_files for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SUPPORT MESSAGES
create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.support_messages enable row level security;
create policy "anyone can submit support" on public.support_messages for insert with check (true);

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('case-files','case-files', false)
on conflict (id) do nothing;

create policy "users read own case files"
on storage.objects for select
using (bucket_id = 'case-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users upload own case files"
on storage.objects for insert
with check (bucket_id = 'case-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users delete own case files"
on storage.objects for delete
using (bucket_id = 'case-files' and auth.uid()::text = (storage.foldername(name))[1]);
