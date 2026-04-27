import { useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signupDone, setSignupDone] = useState(false)
  const { signIn, signUp, loading, authError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/profile/me'
  const successMessage = location.state?.message ?? null

  if (isAuthenticated) {
    const pendingToken = localStorage.getItem('pending_invite_token')
    navigate(pendingToken ? `/invite/${pendingToken}` : redirect, { replace: true })
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (mode === 'login') {
      await signIn(email, password)
      // ログイン成功後は isAuthenticated が true になり上の if で自動リダイレクト
    } else {
      const ok = await signUp(email, password)
      if (ok) setSignupDone(true)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setEmail('')
    setPassword('')
    setSignupDone(false)
  }

  return (
    <div className="min-h-screen bg-goen-warm flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {successMessage && (
          <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 mb-6 text-center text-stone-600 text-sm">
            {successMessage}
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-goen-green-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            縁
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Goen Net</h1>
          <p className="text-stone-500 text-sm mt-1">つながりに、履歴と意味を。</p>
        </div>

        {signupDone ? (
          <div className="bg-goen-green-50 border border-goen-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📨</div>
            <h2 className="font-bold text-goen-green-800 text-lg mb-2">確認メールを送りました</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              <strong>{email}</strong> に確認リンクを送りました。<br />
              メールのリンクをクリックして登録を完了してください。
            </p>
            <p className="text-xs text-stone-400 mt-3">
              メールが届かない場合は迷惑メールフォルダをご確認ください。
            </p>
            <button
              onClick={() => switchMode('login')}
              className="mt-4 text-goen-green-700 text-sm font-medium underline"
            >
              ログイン画面へ戻る
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">

            {/* タブ */}
            <div className="flex rounded-xl bg-stone-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-goen-green-700 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                ログイン
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-goen-green-700 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                新規登録
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  パスワード
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '8文字以上で入力' : 'パスワード'}
                  className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500 text-base"
                />
              </div>

              {authError && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{authError}</p>
              )}

              <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
                {mode === 'login' ? 'ログイン' : '登録する'}
              </Button>
            </form>

            <p className="text-xs text-stone-400 text-center mt-4">
              ご利用にはメールアドレスとパスワードが必要です。<br />
              個人情報は適切に管理します。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
