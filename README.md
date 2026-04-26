# Goen Net — ご縁ネットワーク

> つながりに、履歴と意味を。

5段階まで広がる信頼のご縁ネットワーク。「この人とつながると何が生まれるか」「誰のご縁でつながったか」を見える化するSNSアプリ。

---

## アプリ概要

| 項目 | 内容 |
|---|---|
| アプリ名 | Goen Net |
| ブランド名 | Goen Network |
| キャッチコピー | つながりに、履歴と意味を。 |
| コンセプト | 5段階まで広がる、信頼のご縁ネットワーク |

---

## 技術構成

- **フロントエンド**: React 18 + Vite 5
- **スタイル**: Tailwind CSS 3
- **バックエンド**: Supabase (PostgreSQL + Auth + RLS)
- **認証**: Magic Link (メール)
- **QRコード**: qrcode.react
- **ネットワーク可視化**: カスタム SVG

---

## セットアップ手順

### 1. 環境変数を設定する

```bash
cp .env.example .env
```

`.env` を開いて以下を設定してください。

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

> **重要**: `service_role key` は絶対にここに書かないでください。  
> `anon key` のみ使用します。

### 2. Supabase でテーブルを作成する

Supabase ダッシュボードの **SQL Editor** で以下を順番に実行してください。

```
1. supabase/schema.sql     ← テーブル・インデックス・関数
2. supabase/rls_policies.sql  ← RLS ポリシー
```

### 3. Supabase の Auth 設定

Supabase ダッシュボード → **Authentication** → **URL Configuration** で以下を設定してください。

| 項目 | 値 |
|---|---|
| Site URL | `http://localhost:5173` (本番: `https://goennet-app.vercel.app`) |
| Redirect URLs | `http://localhost:5173/auth/callback` |
| Redirect URLs（本番追加） | `https://goennet-app.vercel.app/auth/callback*` ← 末尾に `*`（クエリパラメータを許可） |

> **`*` が必要な理由**: 招待フロー経由のログインでは `/auth/callback?redirect=/invite/:token` のようにクエリパラメータが付きます。  
> ワイルドカードがないと Magic Link の検証が失敗します。

### 4. 依存パッケージをインストールする

```bash
npm install
```

### 5. 開発サーバーを起動する

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

---

## VITE_APP_URL について（重要）

### QRコードURLの生成フロー

`VITE_APP_URL` は **QRコードURL** と **Magic Link の戻り先** 両方に使われます。

```
VITE_APP_URL（環境変数）
  └─ src/lib/authConfig.js  →  APP_URL / AUTH_REDIRECT_URL
       ├─ src/services/qrService.js  →  `${APP_URL}/invite/${token}`  ← QRコードURL
       └─ src/hooks/useAuth.js       →  emailRedirectTo               ← Magic Linkの戻り先
```

**`window.location.origin` や localhost の直書きは禁止。必ず `authConfig.js` 経由で使うこと。**

### 環境別の設定方法

| 環境 | 設定場所 | VITE_APP_URL の値 |
|---|---|---|
| ローカル開発 | `.env` | `http://localhost:5173` |
| Vercel 本番 | **Vercel ダッシュボード** | `https://goennet-app.vercel.app` |
| ローカル本番ビルド確認 | `.env.production`（gitignore済み） | `https://goennet-app.vercel.app` |

### Vercel 本番デプロイ時の設定手順

1. Vercel ダッシュボード → プロジェクト → **Settings > Environment Variables**
2. 以下を **Production** 環境に追加：

   | Key | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
   | `VITE_APP_URL` | `https://goennet-app.vercel.app` |

3. **Redeploy** を実行（環境変数は再デプロイしないと反映されない）

> `.env.production` はローカルで `vite build` の動作確認に使うファイルで、`.gitignore` で除外されています。  
> Vercel は `.env.production` を読みません。ダッシュボードの設定が優先されます。

### コード上の扱い

```js
// src/lib/authConfig.js
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'
export const AUTH_REDIRECT_URL = `${APP_URL}/auth/callback`
// ↑ VITE_APP_URL が未設定でもクラッシュしない（localhost にフォールバック）
```

---

## 動作確認手順

### 基本フロー

1. `http://localhost:5173` にアクセス
2. 「プロフィールを作る」→ ログインページへ
3. メールアドレスを入力して Magic Link を送信
4. メールのリンクをクリック → `/auth/callback` でセッション確立
5. プロフィール作成ページへ遷移
6. プロフィールを入力して保存
7. マイページで QR コードを表示

### つながり申請フロー

1. QR コードを URL でコピーして別のブラウザで開く
2. 「つながり申請を送る」→ 申請メッセージを入力して送信
3. もとのアカウントで「申請」タブ → 「承認する」
4. マップページで直接つながりとして表示される

---

## ファイル構成

```
goennet-app/
├── src/
│   ├── components/
│   │   ├── common/          # 汎用コンポーネント
│   │   ├── layout/          # Header, BottomNav
│   │   ├── profile/         # プロフィール系
│   │   ├── connections/     # つながり系
│   │   ├── qr/              # QRコード
│   │   └── safety/          # ブロック・通報
│   ├── context/
│   │   └── AuthContext.jsx  # 認証状態管理
│   ├── hooks/               # カスタムフック
│   ├── lib/
│   │   ├── supabase.js      # Supabase クライアント
│   │   ├── authConfig.js    # 認証URL設定 (重要)
│   │   └── constants.js     # 定数
│   ├── pages/               # 画面コンポーネント
│   ├── services/            # API 操作
│   └── utils/               # ユーティリティ
├── supabase/
│   ├── schema.sql           # テーブル定義
│   ├── rls_policies.sql     # RLS ポリシー
│   └── seed.sql             # 開発用ダミーデータ
└── .env.example
```

---

## テーブル設計

> **命名規則**: すべてのテーブル名は `goennet_` 始まりで統一。汎用名（`profiles`, `connections` 等）や古い `goen_` プレフィックスは使用禁止。

| テーブル | 用途 |
|---|---|
| `goennet_members` | ユーザープロフィール |
| `goennet_connection_requests` | つながり申請（pending/accepted/rejected） |
| `goennet_direct_connections` | 相互承認済みのつながり |
| `goennet_connection_lineage` | ご縁履歴（誰経由か、元何段階か） |
| `goennet_blocks` | ブロック管理 |
| `goennet_reports` | 通報管理 |
| `goennet_qr_invites` | QR招待トークン |

---

## セキュリティ方針

### 絶対に守ること

| ルール | 理由 |
|---|---|
| `service_role key` をフロントに置かない | 全データへのアクセスが可能になるため |
| すべてのテーブルで RLS を ON にする | 認証なしのアクセスを防ぐため |
| 連絡先は初期 `mutual_only` | プライバシー保護 |
| QR → 申請 → 承認制 | 勝手につながりを作られないため |

### ⚠️ テスト用の permissive ポリシーについて

テスト期間中、`supabase/rls_dev_permissive.sql` を実行すると以下の一時ポリシーが有効になります。

| ポリシー名 | 対象テーブル | 内容 |
|---|---|---|
| `goennet_members_dev_all` | `goennet_members` | 全操作を `using (true)` で許可 |
| `goennet_qr_invites_dev_all` | `goennet_qr_invites` | 全操作を `using (true)` で許可 |
| `goennet_direct_conn_dev_all` | `goennet_direct_connections` | 全操作を `using (true)` で許可 |
| `goennet_conn_req_dev_all` | `goennet_connection_requests` | 全操作を `using (true)` で許可 |

**これらは認証なし（anon）でも全データにアクセスできる状態です。**  
**正式リリース前に必ず解除し、`auth.uid()` ベースのポリシーに戻してください。**

解除は `rls_dev_permissive.sql` 末尾の「解除用 SQL」コメントを Supabase SQL Editor で実行します。

### 本番デプロイ前チェックリスト

- [ ] **`supabase/rls_dev_permissive.sql` の解除用 SQL を実行**して `*_dev_all` ポリシーを全て DROP する（最重要）
- [ ] Vercel の `VITE_ENABLE_TEST_LOGIN` を `false` に変更して Redeploy（Magic Link に戻す）
- [ ] **Vercel ダッシュボード**の Environment Variables に `VITE_APP_URL=https://goennet-app.vercel.app` を設定（`.env.production` は Vercel に読まれない）
- [ ] Supabase の Site URL を `https://goennet-app.vercel.app` に変更
- [ ] Supabase の Redirect URLs に `https://goennet-app.vercel.app/auth/callback*`（末尾 `*` 必須）を追加
- [ ] RLS が全テーブルで有効になっているか確認（`*_dev_all` ポリシーが残っていないこと）
- [ ] `supabase/rls_policies.sql` のコメントを読み本番向けに強化
- [ ] `seed.sql` を本番で実行していないことを確認
- [ ] Supabase のレート制限を設定
- [ ] `goennet_direct_connections` の INSERT を Edge Function に移す

---

## 今後の改善ポイント（優先度順）

### 優先度2（近い将来）

- [ ] 5段階ネットワーク計算のパフォーマンス最適化（再帰SQLクエリ化）
- [ ] 元N段バッジのマップ表示
- [ ] プロフィール画像アップロード（Supabase Storage）
- [ ] ネットワーク公開範囲の厳密な制御
- [ ] ご縁履歴の詳細表示（path_display_text の自動生成）

### 優先度3（将来）

- [ ] 期限付きQRコード（`expires_at` は実装済み）
- [ ] 管理者ダッシュボード（通報対応）
- [ ] レート制限（申請の連続送信防止）
- [ ] 本人確認バッジ
- [ ] プッシュ通知（申請が届いたとき）
- [ ] Edge Function による承認フローの厳密化
- [ ] A/Bテスト環境

---

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase プロジェクトの URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase の anon key（公開鍵） |
| `VITE_APP_URL` | ✅ | アプリのベース URL（Magic Link の戻り先） |

> `VITE_SUPABASE_SERVICE_ROLE_KEY` は絶対に追加しないこと。

---

## ライセンス

このプロジェクトは非公開です。無断転用・再配布を禁止します。
