-- ============================================================
-- ⚠️  開発・テスト専用 — 本番リリース前に必ず DROP すること
-- ============================================================
-- 目的:
--   テストログイン（モックセッション）では auth.uid() が null になるため、
--   通常の RLS ポリシーが全て弾かれる。
--   テスト期間中のみ、anon ロールを含む全アクセスを permissive に開放する。
--
-- 適用方法:
--   Supabase SQL Editor でこのファイルを実行する。
--
-- 解除方法（本番リリース前に必ず実行）:
--   このファイル末尾の「解除用 SQL」ブロックを実行する。
--
-- ⚠️ 注意:
--   using (true) / with check (true) は認証なしのアクセスも許可する。
--   実データが入った状態で本番公開する前に必ず解除すること。
--   service_role key は一切使用していない。
-- ============================================================

-- ============================================================
-- goennet_members
-- ============================================================
drop policy if exists "goennet_members_dev_all" on goennet_members;
create policy "goennet_members_dev_all"
  on goennet_members for all
  using (true)
  with check (true);

-- ============================================================
-- goennet_qr_invites
-- ============================================================
drop policy if exists "goennet_qr_invites_dev_all" on goennet_qr_invites;
create policy "goennet_qr_invites_dev_all"
  on goennet_qr_invites for all
  using (true)
  with check (true);

-- ============================================================
-- goennet_direct_connections
-- ============================================================
drop policy if exists "goennet_direct_conn_dev_all" on goennet_direct_connections;
create policy "goennet_direct_conn_dev_all"
  on goennet_direct_connections for all
  using (true)
  with check (true);

-- ============================================================
-- goennet_connection_requests
-- ============================================================
drop policy if exists "goennet_conn_req_dev_all" on goennet_connection_requests;
create policy "goennet_conn_req_dev_all"
  on goennet_connection_requests for all
  using (true)
  with check (true);

-- ============================================================
-- 適用確認クエリ
-- ============================================================
select
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
from pg_policies
where policyname like '%dev_all%'
order by tablename;

-- ============================================================
-- 【解除用 SQL】本番リリース前にここを実行する
-- ============================================================
-- drop policy if exists "goennet_members_dev_all"       on goennet_members;
-- drop policy if exists "goennet_qr_invites_dev_all"    on goennet_qr_invites;
-- drop policy if exists "goennet_direct_conn_dev_all"   on goennet_direct_connections;
-- drop policy if exists "goennet_conn_req_dev_all"      on goennet_connection_requests;
