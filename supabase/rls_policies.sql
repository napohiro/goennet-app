-- ============================================================
-- Goen Net - RLS (Row Level Security) ポリシー
-- ============================================================
-- schema.sql 実行後にこのファイルを実行してください
-- テーブル命名規則: すべて goennet_ 始まり
--
-- 重要: service_role key はフロントエンドで絶対に使用しないこと
-- すべての操作は anon key + RLS で制御します
-- ============================================================

-- ============================================================
-- 自分のプロフィールIDを取得するヘルパー関数
-- ============================================================
create or replace function get_my_profile_id()
returns uuid language sql security definer stable as $$
  select id from goennet_members where auth_user_id = auth.uid() limit 1;
$$;

-- ============================================================
-- goennet_members
-- ============================================================
alter table goennet_members enable row level security;

-- 公開プロフィールは認証ユーザーが閲覧可能
create policy "goennet_members_select_public"
  on goennet_members for select
  using (is_public = true or auth_user_id = auth.uid());

-- 自分のプロフィールのみ作成可能
create policy "goennet_members_insert_own"
  on goennet_members for insert
  with check (auth_user_id = auth.uid());

-- 自分のプロフィールのみ更新可能
create policy "goennet_members_update_own"
  on goennet_members for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- 自分のプロフィールのみ削除可能
create policy "goennet_members_delete_own"
  on goennet_members for delete
  using (auth_user_id = auth.uid());

-- ============================================================
-- goennet_connection_requests
-- ============================================================
alter table goennet_connection_requests enable row level security;

-- 自分が送受信した申請のみ閲覧可能
create policy "goennet_conn_req_select_own"
  on goennet_connection_requests for select
  using (
    requester_profile_id = get_my_profile_id()
    or receiver_profile_id = get_my_profile_id()
  );

-- 自分が送る申請のみ作成可能
create policy "goennet_conn_req_insert_own"
  on goennet_connection_requests for insert
  with check (requester_profile_id = get_my_profile_id());

-- 受信者・送信者のみステータス変更可能
create policy "goennet_conn_req_update_own"
  on goennet_connection_requests for update
  using (
    receiver_profile_id = get_my_profile_id()
    or requester_profile_id = get_my_profile_id()
  );

-- ============================================================
-- goennet_direct_connections
-- ============================================================
alter table goennet_direct_connections enable row level security;

-- 当事者のみ閲覧可能
create policy "goennet_direct_conn_select_own"
  on goennet_direct_connections for select
  using (
    profile_a_id = get_my_profile_id()
    or profile_b_id = get_my_profile_id()
  );

-- 開発中は認証ユーザーに insert を許可（本番はEdge Functionで制御推奨）
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
-- goennet_connection_lineage
-- ============================================================
alter table goennet_connection_lineage enable row level security;

-- root または target のみ閲覧可能
create policy "goennet_lineage_select_own"
  on goennet_connection_lineage for select
  using (
    root_profile_id = get_my_profile_id()
    or target_profile_id = get_my_profile_id()
  );

create policy "goennet_lineage_insert_own"
  on goennet_connection_lineage for insert
  with check (root_profile_id = get_my_profile_id());

create policy "goennet_lineage_update_own"
  on goennet_connection_lineage for update
  using (root_profile_id = get_my_profile_id());

-- ============================================================
-- goennet_blocks
-- ============================================================
alter table goennet_blocks enable row level security;

-- 自分のブロックリストのみ閲覧・管理
create policy "goennet_blocks_select_own"
  on goennet_blocks for select
  using (
    blocker_profile_id = get_my_profile_id()
    or blocked_profile_id = get_my_profile_id()
  );

create policy "goennet_blocks_insert_own"
  on goennet_blocks for insert
  with check (blocker_profile_id = get_my_profile_id());

create policy "goennet_blocks_delete_own"
  on goennet_blocks for delete
  using (blocker_profile_id = get_my_profile_id());

-- ============================================================
-- goennet_reports
-- ============================================================
alter table goennet_reports enable row level security;

-- 通報した本人のみ閲覧（管理者はservice_roleで直接アクセス）
create policy "goennet_reports_select_own"
  on goennet_reports for select
  using (reporter_profile_id = get_my_profile_id());

create policy "goennet_reports_insert_own"
  on goennet_reports for insert
  with check (reporter_profile_id = get_my_profile_id());

-- ============================================================
-- goennet_qr_invites
-- ============================================================
alter table goennet_qr_invites enable row level security;

-- 自分のQRを管理可能 / is_active=true のQRはトークン参照のために全員閲覧可
create policy "goennet_qr_invites_select_own"
  on goennet_qr_invites for select
  using (owner_profile_id = get_my_profile_id() or is_active = true);

create policy "goennet_qr_invites_insert_own"
  on goennet_qr_invites for insert
  with check (owner_profile_id = get_my_profile_id());

create policy "goennet_qr_invites_update_own"
  on goennet_qr_invites for update
  using (owner_profile_id = get_my_profile_id());

-- ============================================================
-- 本番環境向け注意事項
-- ============================================================
-- 1. goennet_qr_invites の SELECT ポリシーを絞る
--    - 本番: invite_token での参照は Edge Function 経由で行う
-- 2. goennet_direct_connections の INSERT を Edge Function に移す
--    - 承認フローの整合性を保証するため
-- 3. レート制限を追加
--    - 申請の連続送信を防ぐ
-- 4. ブロック相手のプロフィールを SELECT から除外
--    - goennet_members の SELECT ポリシーにブロック確認を追加
