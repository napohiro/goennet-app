import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { signInWithMagicLink, devLogin, loading, authError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/profile/me'

  // DEV モード、または Vercel の VITE_ENABLE_TEST_LOGIN=true のとき有効
  const isTestLoginEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_LOGIN === 'true'

  // デバッグ用: ブラウザのコンソールで実際に埋め込まれた値を確認する
  console.log(
    '[Goen Net] VITE_ENABLE_TEST_LOGIN:', import.meta.env.VITE_ENABLE_TEST_LOGIN,
    '| DEV:', import.meta.env.DEV,
    '| isTestLoginEnabled:', isTestLoginEnabled
  )

  if (isAuthenticated) {
    navigate(redirect)
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = await signInWithMagicLink(email, redirect)
    if (ok) setSent(true)
  }

  return (
    <div className="min-h-screen bg-goen-warm flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-goen-green-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            縁
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Goen Net</h1>
          <p className="text-stone-500 text-sm mt-1">つながりに、履歴と意味を。</p>
        </div>

        {isTestLoginEnabled ? (
          // DEV または VITE_ENABLE_TEST_LOGIN=true のとき: Magic Link フォームを非表示にしテストログインのみ表示
          <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50 p-6">
            <p className="text-xs font-bold text-amber-700 mb-1">🔧 テストログインモード</p>
            <p className="text-xs text-amber-600 mb-4">
              VITE_ENABLE_TEST_LOGIN=true が設定されています。Magic Link を使うには false に変更してください。
            </p>
            <Button
              type="button"
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => {
                devLogin()
                const pendingToken = localStorage.getItem('pending_invite_token')
                navigate(pendingToken ? `/invite/${pendingToken}` : redirect)
              }}
            >
              開発用ログイン
            </Button>
            <p className="text-xs text-amber-600 mt-3 text-center">
              ユーザー: テストユーザー (dev-user-001)
            </p>
          </div>
        ) : sent ? (
          <div className="bg-goen-green-50 border border-goen-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📨</div>
            <h2 className="font-bold text-goen-green-800 text-lg mb-2">メールを送りました</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              <strong>{email}</strong> にログインリンクを送りました。<br />
              メールのリンクをクリックしてログインしてください。
            </p>
            <p className="text-xs text-stone-400 mt-3">
              メールが届かない場合は迷惑メールフォルダをご確認ください。
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-goen-green-700 text-sm font-medium underline"
            >
              メールアドレスを変更する
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <h2 className="font-bold text-stone-800 text-lg mb-1">ログイン / 新規登録</h2>
            <p className="text-stone-500 text-sm mb-5">
              メールアドレスにログインリンクを送ります。<br />
              パスワードは不要です。
            </p>

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

              {authError && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{authError}</p>
              )}

              <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
                ログインリンクを送る
              </Button>
            </form>

            <p className="text-xs text-stone-400 text-center mt-4">
              ご利用にはメールアドレスが必要です。<br />
              個人情報は適切に管理します。
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
