-- Vở Song Ngữ: chạy file này 1 lần trong Supabase > SQL Editor.
-- Mỗi người dùng chỉ có đúng 1 dòng chứa toàn bộ tiến độ (JSON),
-- nên dữ liệu rất nhỏ, nằm thoải mái trong gói miễn phí.

create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Bật Row Level Security: mỗi người chỉ đọc/ghi được dòng của chính mình.
alter table public.progress enable row level security;

drop policy if exists "progress_select_own" on public.progress;
drop policy if exists "progress_insert_own" on public.progress;
drop policy if exists "progress_update_own" on public.progress;
drop policy if exists "progress_delete_own" on public.progress;

create policy "progress_select_own" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "progress_insert_own" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "progress_update_own" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "progress_delete_own" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);
