import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AUTH_REDIRECT_URL } from '../lib/authConfig'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { session, user, loading } = useAuthContext()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  // redirectPath を渡すと、Magic Link 経由で戻ってきた後にそのパスへ遷移する
  async function signInWithMagicLink(email, redirectPath = '') {
    if (!isSupabaseConfigured) {
      setAuthError('ローカルモックモードのため、ログインは使用できません。.env を設定してください。')
      return false
    }
    setAuthLoading(true)
    setAuthError(null)
    const emailRedirectTo = redirectPath
      ? `${AUTH_REDIRECT_URL}?redirect=${encodeURIComponent(redirectPath)}`
      : AUTH_REDIRECT_URL
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo },
      })
      if (error) throw error
      return true
    } catch (e) {
      setAuthError(e.message)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    setAuthLoading(true)
    await supabase.auth.signOut()
    setAuthLoading(false)
  }

  // 開発専用: import.meta.env.DEV のときのみ有効。本番ビルドでは dead code として除去される。
  async function devSignIn() {
    if (!import.meta.env.DEV || !isSupabaseConfigured) return false
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_DEV_EMAIL || 'dev@goennet.local',
        password: import.meta.env.VITE_DEV_PASSWORD || 'devtest1234',
      })
      if (error) throw error
      return true
    } catch (e) {
      setAuthError(`[DEV] ${e.message}`)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  return {
    session,
    user,
    loading: loading || authLoading,
    authError,
    signInWithMagicLink,
    signOut,
    isAuthenticated: !!session,
    devSignIn: import.meta.env.DEV ? devSignIn : undefined,
  }
}
