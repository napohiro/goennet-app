import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getMyProfile } from '../../services/profileService'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)

  // Magic Link の emailRedirectTo に ?redirect=... を付与した場合に引き継ぐ
  const redirectPath = searchParams.get('redirect') || ''

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) throw new Error('セッションが見つかりません。ログインリンクをもう一度お試しください。')

        const profile = await getMyProfile(session.user.id)
        if (profile) {
          navigate(redirectPath || '/profile/me', { replace: true })
        } else {
          const next = redirectPath
            ? `/profile/create?redirect=${encodeURIComponent(redirectPath)}`
            : '/profile/create'
          navigate(next, { replace: true })
        }
      } catch (e) {
        setError(e.message)
      }
    }

    handleCallback()
  }, [navigate, redirectPath])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-bold text-stone-800 text-lg mb-2">ログインに失敗しました</h2>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="text-goen-green-700 font-medium underline"
          >
            ログインページへ戻る
          </button>
        </div>
      </div>
    )
  }

  return <LoadingSpinner text="ログイン処理中…" />
}
