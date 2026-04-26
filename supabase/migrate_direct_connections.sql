-- ============================================================
-- Goen Net - goennet_direct_connections カラム名移行スクリプト
-- ============================================================
-- 背景:
--   コードは profile_a_id / profile_b_id を正として使用する。
--   旧カラム名 (user_a_profile_id / user_b_profile_id) が
--   Supabase 側に残っている場合は以下を実行してください。
--
-- 実行順序: Supabase SQL Editor で上から順番に実行
-- ============================================================

-- ============================================================
-- Step 1: 旧カラムからデータを補正（カラムが両方存在する場合）
-- ============================================================
-- profile_a_id が null で from_member_id 系が埋まっているケース
update goennet_direct_connections
set
  profile_a_id = coalesce(profile_a_id, user_a_profile_id),
  profile_b_id = coalesce(profile_b_id, user_b_profile_id)
where
  profile_a_id is null
  or profile_b_id is null;

-- ============================================================
-- Step 2: 旧カラムを削除（不要になった場合）
-- ※ profile_a_id / profile_b_id に完全移行済みの確認後に実行
-- ============================================================
-- alter table goennet_direct_connections
--   drop column if exists user_a_profile_id,
--   drop column if exists user_b_profile_id;

-- ============================================================
-- Step 3: profile_a_id / profile_b_id カラムが存在しない場合は追加
-- ============================================================
-- alter table goennet_direct_connections
--   add column if not exists profile_a_id uuid references goennet_members(id) on delete cascade,
--   add column if not exists profile_b_id uuid references goennet_members(id) on delete cascade;

-- ============================================================
-- Step 4: インデックスを再作成（カラム名変更後）
-- ============================================================
drop index if exists idx_goennet_direct_conn_a;
drop index if exists idx_goennet_direct_conn_b;

create index if not exists idx_goennet_direct_conn_a on goennet_direct_connections(profile_a_id, is_active);
create index if not exists idx_goennet_direct_conn_b on goennet_direct_connections(profile_b_id, is_active);

-- ============================================================
-- Step 5: RLS ポリシーを更新（カラム名変更後）
-- ============================================================
drop policy if exists "goennet_direct_conn_select_own" on goennet_direct_connections;
drop policy if exists "goennet_direct_conn_insert_own" on goennet_direct_connections;
drop policy if exists "goennet_direct_conn_update_own" on goennet_direct_connections;

create policy "goennet_direct_conn_select_own"
  on goennet_direct_connections for select
  using (
    profile_a_id = get_my_profile_id()
    or profile_b_id = get_my_profile_id()
  );

create policy "goennet_direct_conn_insert_own"
  on goennet_direct_connections for insert
  with check (
    profile_a_id = get_my_profile_id()
    or profile_b_id = get_my_profile_id()
  );

create policy "goennet_direct_conn_update_own"
  on goennet_direct_connections for update
  using (
    profile_a_id = get_my_profile_id()
    or profile_b_id = get_my_profile_id()
  );

-- ============================================================
-- 確認クエリ: null が残っていないか確認
-- ============================================================
select
  count(*) as total,
  count(*) filter (where profile_a_id is null) as missing_a,
  count(*) filter (where profile_b_id is null) as missing_b
from goennet_direct_connections;
