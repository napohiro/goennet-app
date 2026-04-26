/**
 * 認証設定の一元管理ファイル
 *
 * Magic Link や OAuth の戻り先URLはここで管理する。
 * signInWithOtp 等では window.location.origin を直書きせず、
 * 必ずこのファイルの APP_URL を使うこと。
 *
 * 本番環境では .env.production の VITE_APP_URL を正しいドメインに設定すること。
 */
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

export const AUTH_REDIRECT_URL = `${APP_URL}/auth/callback`

export const AUTH_OPTIONS = {
  emailRedirectTo: AUTH_REDIRECT_URL,
}
