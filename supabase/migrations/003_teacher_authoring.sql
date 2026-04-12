-- Allow teachers to view all articles (even unpublished) and manage them
drop policy if exists "articles_select_all_for_teacher" on public.articles;
create policy "articles_select_all_for_teacher"
on public.articles for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  )
);

drop policy if exists "articles_insert_teacher" on public.articles;
create policy "articles_insert_teacher"
on public.articles for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  )
);

drop policy if exists "articles_update_teacher" on public.articles;
create policy "articles_update_teacher"
on public.articles for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  )
);

-- Allow teachers to view all versions and create new versions
drop policy if exists "article_versions_select_all_for_teacher" on public.article_versions;
create policy "article_versions_select_all_for_teacher"
on public.article_versions for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  )
);

drop policy if exists "article_versions_insert_teacher" on public.article_versions;
create policy "article_versions_insert_teacher"
on public.article_versions for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'teacher'
  )
);
