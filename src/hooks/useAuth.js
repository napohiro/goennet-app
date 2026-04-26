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

  return {
    session,
    user,
    loading: loading || authLoading,
    authError,
    signInWithMagicLink,
    signOut,
    isAuthenticated: !!session,
  }
}
