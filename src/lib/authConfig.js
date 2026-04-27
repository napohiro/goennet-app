/**
 * 認証設定の一元管理ファイル
 *
 * このアプリはメールアドレス＋パスワード認証を使用します。
 * Magic Link は使用しません。
 *
 * AUTH_REDIRECT_URL は Supabase のメール確認リンクの戻り先として
 * Supabase ダッシュボードの「Site URL / Redirect URLs」に登録してください。
 * アプリコード内では使用しません。
 *
 * 本番環境では .env.production の VITE_APP_URL を正しいドメインに設定すること。
 */
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export const AUTH_REDIRECT_URL = `${APP_URL}/auth/callback`
