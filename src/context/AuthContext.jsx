import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [loading, setLoading] = useState(true)

  // DEV モード、または VITE_ENABLE_TEST_LOGIN=true のとき有効。Supabase Auth を使わずローカル状態でログイン扱い。
  const isTestLoginEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_LOGIN === 'true'

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && isTestLoginEnabled) {
        // アプリ再起動時にdevLoginセッションをlocalStorageから復元する
        const uuid = localStorage.getItem('goennet_test_user_uuid')
        if (uuid) {
          setSession({ user: { id: uuid, email: 'dev@goennet.local' } })
          setLoading(false)
          return
        }
      }
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [isTestLoginEnabled])

  const devLogin = isTestLoginEnabled
    ? () => {
        // localStorage に永続化した UUID を使う（セッションをまたいで同じ auth_user_id になる）
        const LS_KEY = 'goennet_test_user_uuid'
        let uuid = localStorage.getItem(LS_KEY)
        if (!uuid) {
          uuid = crypto.randomUUID()
          localStorage.setItem(LS_KEY, uuid)
        }
        setSession({ user: { id: uuid, email: 'dev@goennet.local' } })
      }
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
