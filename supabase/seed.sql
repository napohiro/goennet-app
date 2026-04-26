-- ============================================================
-- Goen Net - 開発用ダミーデータ
-- ============================================================
-- 注意: このファイルは開発・テスト用です。
-- 本番環境では実行しないでください。
--
-- 前提: auth.users に対応するユーザーが存在する場合のみ
-- auth_user_id は実際のUUIDに変更してください。
-- ============================================================

-- ============================================================
-- ダミープロフィール（auth_user_idなしでの確認用）
-- 実際の使用時は auth_user_id に実際のユーザーIDを設定してください
-- ============================================================

-- 開発確認用のダミーデータ挿入例
-- （実際のAuth UUIDに差し替えて使用してください）

/*
-- プロフィール例

insert into goennet_members (
  id, auth_user_id, display_name, handle_name,
  catch_copy, how_i_can_help, useful_for, what_we_can_do,
  offer_tags, website_url, is_public,
  contact_visibility, lineage_visibility, network_visibility
) values
(
  'aaaaaaaa-0000-0000-0000-000000000001',
  'ffffffff-0000-0000-0000-000000000001',  -- 自分のAuthユーザーID
  '田中 自分', 'jibun',
  '地域コミュニティをつなぐ橋渡し役',
  'IT活用支援、地域ネットワーク構築',
  '新しいことに挑戦したい経営者・個人事業主',
  '適切な専門家や機関を紹介できます',
  ARRAY['IT支援', '地域活動', '紹介・つなぎ役'],
  'https://example.com', true,
  'mutual_only', 'summary_only', 'depth_3'
),
(
  'aaaaaaaa-0000-0000-0000-000000000002',
  'ffffffff-0000-0000-0000-000000000002',
  '山田 Aki', 'aki_yamada',
  'ものづくりで社会課題を解決',
  '製品開発・デザイン思考のファシリテーション',
  'スタートアップ・社会起業家',
  'プロトタイプ作成から資金調達まで伴走',
  ARRAY['プロダクト開発', 'デザイン', 'スタートアップ'],
  null, true,
  'mutual_only', 'summary_only', 'direct_only'
),
(
  'aaaaaaaa-0000-0000-0000-000000000003',
  'ffffffff-0000-0000-0000-000000000003',
  '佐藤 Sora', 'sora_sato',
  '農業×テクノロジーで地方を元気に',
  'スマート農業の導入支援・農産物のブランディング',
  '農業従事者・農業に関わりたい都市部の方',
  '農家と都市をつなぐご縁を作れます',
  ARRAY['農業', 'ブランディング', '地方創生'],
  null, true,
  'mutual_only', 'detailed', 'depth_3'
),
(
  'aaaaaaaa-0000-0000-0000-000000000004',
  'ffffffff-0000-0000-0000-000000000004',
  '鈴木 Mina', 'mina_suzuki',
  '女性起業家のメンター',
  '女性向けビジネスコーチング・コミュニティ運営',
  '起業したい・副業を始めたい女性',
  'ビジネスプランのブラッシュアップと仲間紹介',
  ARRAY['コーチング', '女性起業', 'コミュニティ'],
  null, true,
  'mutual_only', 'summary_only', 'direct_only'
),
(
  'aaaaaaaa-0000-0000-0000-000000000005',
  'ffffffff-0000-0000-0000-000000000005',
  '高橋 Ren', 'ren_takahashi',
  'ファイナンスで夢を実現させる',
  '資金調達・財務戦略・補助金申請',
  '新規事業立ち上げ・資金調達を考えている方',
  '最適な資金調達方法を一緒に考えます',
  ARRAY['資金調達', '補助金', '財務'],
  null, true,
  'mutual_only', 'summary_only', 'depth_3'
),
(
  'aaaaaaaa-0000-0000-0000-000000000006',
  'ffffffff-0000-0000-0000-000000000006',
  '伊藤 Yui', 'yui_ito',
  '法務・知財で事業を守る',
  '契約書レビュー・知的財産権のアドバイス',
  'スタートアップ・個人事業主',
  '法的リスクから事業を守るサポート',
  ARRAY['法務', '知財', '契約'],
  null, true,
  'mutual_only', 'summary_only', 'direct_only'
),
(
  'aaaaaaaa-0000-0000-0000-000000000007',
  'ffffffff-0000-0000-0000-000000000007',
  '渡辺 Kai', 'kai_watanabe',
  'デジタルマーケティングで集客を最大化',
  'SNSマーケティング・MEO・広告運用',
  '集客に悩む店舗・サービス業',
  '月次の集客戦略を一緒に立てます',
  ARRAY['マーケティング', 'SNS', 'MEO'],
  null, true,
  'mutual_only', 'summary_only', 'depth_3'
),
(
  'aaaaaaaa-0000-0000-0000-000000000008',
  'ffffffff-0000-0000-0000-000000000008',
  '小林 Nao', 'nao_kobayashi',
  '教育×コミュニティで人材育成',
  '研修設計・ファシリテーション・学習コミュニティ運営',
  '人材育成に悩む企業・団体',
  '組織の学習文化を一緒に育てます',
  ARRAY['教育', '人材育成', 'ファシリテーション'],
  null, true,
  'mutual_only', 'summary_only', 'direct_only'
);

-- ============================================================
-- ご縁の再現例: 自分 → Aki → Yui → Kai
-- ============================================================

-- 自分 ⇔ Aki (直接)
insert into goennet_direct_connections (
  id, profile_a_id, profile_b_id, source_type, is_active
) values (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',  -- 自分
  'aaaaaaaa-0000-0000-0000-000000000002',  -- Aki
  'manual', true
);

insert into goennet_connection_lineage (
  root_profile_id, target_profile_id,
  origin_depth, current_depth,
  path_profile_ids, path_display_text,
  promoted_to_direct, promoted_at,
  direct_connection_id, is_active
) values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000002',
  1, 1,
  '["aaaaaaaa-0000-0000-0000-000000000001","aaaaaaaa-0000-0000-0000-000000000002"]',
  '直接つながり',
  true, now(),
  'bbbbbbbb-0000-0000-0000-000000000001',
  true
);

-- Aki ⇔ Yui (直接)
insert into goennet_direct_connections (
  id, profile_a_id, profile_b_id, source_type, is_active
) values (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000002',  -- Aki
  'aaaaaaaa-0000-0000-0000-000000000006',  -- Yui
  'manual', true
);

-- Yui ⇔ Kai (直接)
insert into goennet_direct_connections (
  id, profile_a_id, profile_b_id, source_type, is_active
) values (
  'bbbbbbbb-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000006',  -- Yui
  'aaaaaaaa-0000-0000-0000-000000000007',  -- Kai
  'manual', true
);

-- 自分とKaiのご縁履歴（元は3段階目）
insert into goennet_connection_lineage (
  root_profile_id, target_profile_id,
  origin_depth, current_depth,
  path_profile_ids, path_display_text,
  promoted_to_direct, is_active
) values (
  'aaaaaaaa-0000-0000-0000-000000000001',  -- 自分 (root)
  'aaaaaaaa-0000-0000-0000-000000000007',  -- Kai (target)
  3, 3,
  '["aaaaaaaa-0000-0000-0000-000000000001","aaaaaaaa-0000-0000-0000-000000000002","aaaaaaaa-0000-0000-0000-000000000006","aaaaaaaa-0000-0000-0000-000000000007"]',
  '山田 Aki → 伊藤 Yui → 渡辺 Kai のご縁から出会いました。',
  false, true
);

-- 自分 ⇔ Kai が直接つながった後（繰り上がり）
-- current_depth を 1 に更新し、promoted_to_direct = true にする
-- （実際の操作はアプリ上のつながり承認フローで実行されます）

*/

-- ============================================================
-- 使用方法
-- ============================================================
-- 1. 上記のコメントを外す
-- 2. auth_user_id の UUID を実際の Supabase Auth ユーザーIDに変更
-- 3. Supabase SQL Editor で実行
