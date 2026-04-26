import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // DEV モード、または VITE_ENABLE_TEST_LOGIN=true のとき有効。Supabase Auth を使わずローカル状態でログイン扱い。
  const isTestLoginEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_LOGIN === 'true'
  const devLogin = isTestLoginEnabled
    ? () => setSession({ user: { id: 'dev-user-001', email: 'dev@goennet.local' } })
    : undefined

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, devLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
