create extension if not exists "pgcrypto";

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id text primary key,
  class_id uuid not null references classes(id) on delete restrict,
  name text not null,
  role text not null default 'student' check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id text primary key,
  title text not null,
  unit text not null default '',
  cover_url text,
  content_json jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  active_version_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists article_versions (
  id uuid primary key default gen_random_uuid(),
  article_id text not null references articles(id) on delete cascade,
  content_json jsonb not null,
  created_by text,
  note text,
  created_at timestamptz not null default now()
);

alter table articles
  add constraint articles_active_version_fk
  foreign key (active_version_id) references article_versions(id) on delete set null;

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  article_id text not null references articles(id) on delete cascade,
  task_key text not null,
  answer_json jsonb not null default '{}'::jsonb,
  score numeric not null default 0,
  duration_ms int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  article_id text not null references articles(id) on delete cascade,
  sentence_id text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, article_id, sentence_id)
);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references profiles(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  article_id text not null references articles(id) on delete cascade,
  type text not null check (type in ('word', 'sentence')),
  value text not null,
  created_at timestamptz not null default now(),
  unique (user_id, article_id, type, value)
);

create index if not exists attempts_class_article_idx on attempts (class_id, article_id);
create index if not exists attempts_user_article_idx on attempts (user_id, article_id);
create index if not exists article_versions_article_idx on article_versions (article_id, created_at desc);
create index if not exists favorites_user_article_idx on favorites (user_id, article_id);
create index if not exists quotes_user_article_idx on quotes (user_id, article_id);
