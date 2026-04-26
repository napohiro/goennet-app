-- ============================================================
-- Goen Net - Supabase Schema
-- ============================================================
-- 実行順序: このファイルを Supabase SQL Editor で実行してください
-- テーブル命名規則: すべて goennet_ 始まり
-- 注意: service_role key はフロントエンドで絶対に使用しないこと
-- ============================================================

-- UUID拡張を有効化
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. goennet_members - ユーザープロフィール
-- ============================================================
create table if not exists goennet_members (
  id                  uuid primary key default uuid_generate_v4(),
  auth_user_id        uuid references auth.users(id) on delete cascade unique not null,
  display_name        text not null,
  handle_name         text unique,
  avatar_url          text,
  catch_copy          text,
  how_i_can_help      text,
  useful_for          text,
  what_we_can_do      text,
  offer_tags          text[] default '{}',
  website_url         text,
  youtube_url         text,
  instagram_url       text,
  line_contact        text,
  email_contact       text,
  phone_contact       text,
  contact_visibility  text not null default 'mutual_only'
    check (contact_visibility in ('private', 'mutual_only', 'public')),
  lineage_visibility  text not null default 'summary_only'
    check (lineage_visibility in ('private', 'summary_only', 'detailed')),
  network_visibility  text not null default 'direct_only'
    check (network_visibility in ('direct_only', 'depth_3', 'depth_5')),
  is_public           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_goennet_members_auth_user_id on goennet_members(auth_user_id);
create index if not exists idx_goennet_members_handle_name on goennet_members(handle_name);

-- ============================================================
-- 2. goennet_connection_requests - つながり申請
-- ============================================================
create table if not exists goennet_connection_requests (
  id                    uuid primary key default uuid_generate_v4(),
  requester_profile_id  uuid not null references goennet_members(id) on delete cascade,
  receiver_profile_id   uuid not null references goennet_members(id) on delete cascade,
  status                text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  source_type           text not null default 'manual'
    check (source_type in ('qr', 'manual', 'invite')),
  message               text default '',
  created_at            timestamptz not null default now(),
  responded_at          timestamptz,
  constraint no_self_request check (requester_profile_id != receiver_profile_id)
);

create index if not exists idx_goennet_conn_req_receiver on goennet_connection_requests(receiver_profile_id, status);
create index if not exists idx_goennet_conn_req_requester on goennet_connection_requests(requester_profile_id);

-- ============================================================
-- 3. goennet_direct_connections - 相互承認済みのつながり
-- ============================================================
create table if not exists goennet_direct_connections (
  id                  uuid primary key default uuid_generate_v4(),
  profile_a_id   uuid not null references goennet_members(id) on delete cascade,
  profile_b_id   uuid not null references goennet_members(id) on delete cascade,
  source_request_id   uuid references goennet_connection_requests(id),
  source_type         text default 'manual',
  source_lineage_id   uuid,
  is_active           boolean not null default true,
  connected_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  constraint no_self_connect check (profile_a_id != profile_b_id),
  constraint unique_connection unique (profile_a_id, profile_b_id)
);

create index if not exists idx_goennet_direct_conn_a on goennet_direct_connections(profile_a_id, is_active);
create index if not exists idx_goennet_direct_conn_b on goennet_direct_connections(profile_b_id, is_active);

-- ============================================================
-- 4. goennet_connection_lineage - ご縁履歴
-- ============================================================
create table if not exists goennet_connection_lineage (
  id                    uuid primary key default uuid_generate_v4(),
  root_profile_id       uuid not null references goennet_members(id) on delete cascade,
  target_profile_id     uuid not null references goennet_members(id) on delete cascade,
  origin_depth          integer not null check (origin_depth between 1 and 5),
  current_depth         integer not null check (current_depth between 1 and 5),
  path_profile_ids      jsonb default '[]',
  path_display_text     text,
  promoted_to_direct    boolean not null default false,
  promoted_at           timestamptz,
  direct_connection_id  uuid references goennet_direct_connections(id),
  is_active             boolean not null default true,
  created_at            timestamptz not null default now()
);

create index if not exists idx_goennet_lineage_root on goennet_connection_lineage(root_profile_id, is_active);
create index if not exists idx_goennet_lineage_target on goennet_connection_lineage(target_profile_id);

-- ============================================================
-- 5. goennet_blocks - ブロック管理
-- ============================================================
create table if not exists goennet_blocks (
  id                  uuid primary key default uuid_generate_v4(),
  blocker_profile_id  uuid not null references goennet_members(id) on delete cascade,
  blocked_profile_id  uuid not null references goennet_members(id) on delete cascade,
  reason              text default '',
  created_at          timestamptz not null default now(),
  constraint no_self_block check (blocker_profile_id != blocked_profile_id),
  constraint unique_block unique (blocker_profile_id, blocked_profile_id)
);

create index if not exists idx_goennet_blocks_blocker on goennet_blocks(blocker_profile_id);

-- ============================================================
-- 6. goennet_reports - 通報管理
-- ============================================================
create table if not exists goennet_reports (
  id                    uuid primary key default uuid_generate_v4(),
  reporter_profile_id   uuid not null references goennet_members(id) on delete cascade,
  reported_profile_id   uuid not null references goennet_members(id) on delete cascade,
  reason                text not null,
  details               text default '',
  status                text not null default 'open'
    check (status in ('open', 'reviewing', 'closed')),
  created_at            timestamptz not null default now(),
  constraint no_self_report check (reporter_profile_id != reported_profile_id)
);

-- ============================================================
-- 7. goennet_qr_invites - QR招待トークン
-- ============================================================
create table if not exists goennet_qr_invites (
  id                uuid primary key default uuid_generate_v4(),
  owner_profile_id  uuid not null references goennet_members(id) on delete cascade,
  invite_token      text not null unique default gen_random_uuid()::text,
  expires_at        timestamptz,
  max_uses          integer,
  used_count        integer not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists idx_goennet_qr_token on goennet_qr_invites(invite_token, is_active);
create index if not exists idx_goennet_qr_owner on goennet_qr_invites(owner_profile_id, is_active);

-- ============================================================
-- ヘルパー関数
-- ============================================================

-- QR使用回数インクリメント
create or replace function increment_invite_used_count(invite_id uuid)
returns void language plpgsql security definer as $$
begin
  update goennet_qr_invites
  set used_count = used_count + 1
  where id = invite_id;
end;
$$;

-- updated_at 自動更新トリガー
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_goennet_members_updated_at on goennet_members;
create trigger set_goennet_members_updated_at
  before update on goennet_members
  for each row execute function update_updated_at_column();
