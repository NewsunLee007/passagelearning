-- 互动阅读 Demo：最小可用数据库结构（Supabase Postgres）
-- 说明：此 SQL 适合作为 Supabase SQL Editor 或 CLI migration 执行。

create extension if not exists "pgcrypto";

-- ========== 基础表 ==========

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key, -- = auth.uid()
  class_id uuid not null references public.classes(id) on delete restrict,
  name text not null,
  role text not null default 'student' check (role in ('student','teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  title text not null,
  content_json jsonb not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references public.articles(id) on delete cascade,
  type text not null check (type in ('vocab','sentence','reading')),
  "order" int not null default 0,
  config_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  article_id text not null references public.articles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  task_key text not null,
  answer_json jsonb not null,
  score numeric not null default 0,
  duration_ms int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists attempts_class_article_idx on public.attempts (class_id, article_id);
create index if not exists attempts_user_article_idx on public.attempts (user_id, article_id);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  article_id text not null references public.articles(id) on delete cascade,
  sentence_id text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists quotes_class_article_idx on public.quotes (class_id, article_id);
create index if not exists quotes_user_article_idx on public.quotes (user_id, article_id);

-- ========== RLS ==========

alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.tasks enable row level security;
alter table public.attempts enable row level security;
alter table public.quotes enable row level security;

-- classes：演示版允许“已登录用户”按班级名称查找/创建班级
drop policy if exists "classes_select_authenticated" on public.classes;
create policy "classes_select_authenticated"
on public.classes for select
to authenticated
using (true);

drop policy if exists "classes_insert_authenticated" on public.classes;
create policy "classes_insert_authenticated"
on public.classes for insert
to authenticated
with check (true);

-- profiles：本人可写读；教师可读本班学生
drop policy if exists "profiles_select_self_or_teacher" on public.profiles;
create policy "profiles_select_self_or_teacher"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
      and p.class_id = public.profiles.class_id
  )
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- articles/tasks：仅发布内容对所有登录用户可读（发布由 service role / 管理端完成）
drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published"
on public.articles for select
to authenticated
using (published = true);

drop policy if exists "tasks_select_published_article" on public.tasks;
create policy "tasks_select_published_article"
on public.tasks for select
to authenticated
using (
  exists (
    select 1 from public.articles a
    where a.id = public.tasks.article_id
      and a.published = true
  )
);

-- attempts：本人可写读；教师可读本班（只读统计）
drop policy if exists "attempts_select_self_or_teacher" on public.attempts;
create policy "attempts_select_self_or_teacher"
on public.attempts for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
      and p.class_id = public.attempts.class_id
  )
);

drop policy if exists "attempts_insert_self" on public.attempts;
create policy "attempts_insert_self"
on public.attempts for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "attempts_update_self" on public.attempts;
create policy "attempts_update_self"
on public.attempts for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- quotes：本人可写读；教师可读本班（只读统计）
drop policy if exists "quotes_select_self_or_teacher" on public.quotes;
create policy "quotes_select_self_or_teacher"
on public.quotes for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
      and p.class_id = public.quotes.class_id
  )
);

drop policy if exists "quotes_insert_self" on public.quotes;
create policy "quotes_insert_self"
on public.quotes for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "quotes_update_self" on public.quotes;
create policy "quotes_update_self"
on public.quotes for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
