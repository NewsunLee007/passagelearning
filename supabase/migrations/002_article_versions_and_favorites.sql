create table if not exists public.article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references public.articles(id) on delete cascade,
  content_json jsonb not null,
  created_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists article_versions_article_idx on public.article_versions (article_id, created_at desc);

alter table public.articles add column if not exists cover_url text;
alter table public.articles add column if not exists active_version_id uuid references public.article_versions(id) on delete set null;

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  article_id text not null references public.articles(id) on delete cascade,
  type text not null check (type in ('word','sentence')),
  value text not null,
  created_at timestamptz not null default now()
);

create index if not exists favorites_user_article_idx on public.favorites (user_id, article_id);
create index if not exists favorites_class_article_idx on public.favorites (class_id, article_id);

alter table public.article_versions enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "article_versions_select_published_article" on public.article_versions;
create policy "article_versions_select_published_article"
on public.article_versions for select
to authenticated
using (
  exists (
    select 1
    from public.articles a
    where a.id = public.article_versions.article_id
      and a.published = true
  )
);

drop policy if exists "favorites_select_self_or_teacher" on public.favorites;
create policy "favorites_select_self_or_teacher"
on public.favorites for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
      and p.class_id = public.favorites.class_id
  )
);

drop policy if exists "favorites_insert_self" on public.favorites;
create policy "favorites_insert_self"
on public.favorites for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "favorites_delete_self" on public.favorites;
create policy "favorites_delete_self"
on public.favorites for delete
to authenticated
using (user_id = auth.uid());

