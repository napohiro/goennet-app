import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const { session, user, loading } = useAuthContext()
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState(null)

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      setAuthError('ローカルモックモードのため、ログインは使用できません。.env を設定してください。')
      return false
    }
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return true
    } catch (e) {
      setAuthError(e.message)
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  async function signUp(email, password) {
    if (!isSupabaseConfigured) {
      setAuthError('ローカルモックモードのため、登録は使用できません。.env を設定してください。')
      return false
    }
    setAuthLoading(true)
    setAuthError(null)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
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
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
  }
}
