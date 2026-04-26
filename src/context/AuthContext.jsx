import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

const DEV_UUID_KEY = 'goennet_test_user_uuid'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [loading, setLoading] = useState(true)

  // DEV モード、または VITE_ENABLE_TEST_LOGIN=true のとき有効。Supabase Auth を使わずローカル状態でログイン扱い。
  const isTestLoginEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_LOGIN === 'true'

  // devLogin 中は Supabase の INITIAL_SESSION(null) でセッションを上書きしないためのフラグ
  const devModeActive = useRef(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null)
      setLoading(false)
      return
    }

    // onAuthStateChange を getSession より先に登録し、INITIAL_SESSION を確実に先行処理させる
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // devLogin 中に Supabase から null が来ても上書きしない（race condition 対策）
      if (devModeActive.current && newSession === null) return
      devModeActive.current = false
      setSession(newSession)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && isTestLoginEnabled) {
        // アプリ再起動時: localStorage の UUID からdevセッションを復元する
        const uuid = localStorage.getItem(DEV_UUID_KEY)
        if (uuid) {
          console.log('[Goen Net] devLogin 復元: auth_user_id =', uuid)
          devModeActive.current = true
          setSession({ user: { id: uuid, email: 'dev@goennet.local' } })
          setLoading(false)
          return
        }
      }
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [isTestLoginEnabled])

  const devLogin = isTestLoginEnabled
    ? () => {
        // localStorage に永続化した UUID を使う（初回のみ生成・以後は同じ値を再利用）
        let uuid = localStorage.getItem(DEV_UUID_KEY)
        if (!uuid) {
          uuid = crypto.randomUUID()
          localStorage.setItem(DEV_UUID_KEY, uuid)
        }
        console.log('[Goen Net] devLogin: auth_user_id =', uuid)
        devModeActive.current = true
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
