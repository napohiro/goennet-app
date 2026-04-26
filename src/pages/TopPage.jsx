import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function TopPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-goen-green-700 to-goen-green-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-white text-center">
        <div className="w-20 h-20 rounded-full bg-goen-gold-300 flex items-center justify-center text-goen-green-900 font-bold text-4xl mb-6 shadow-xl">
          縁
        </div>

        <div className="mb-2">
          <span className="text-xs font-semibold tracking-[0.3em] text-goen-gold-300 uppercase">Goen Network</span>
        </div>

        <h1 className="text-4xl font-bold mb-3 leading-tight">
          Goen Net
        </h1>

        <p className="text-goen-gold-300 font-medium text-lg mb-2">
          つながりに、履歴と意味を。
        </p>

        <p className="text-green-200 text-sm mb-12 leading-relaxed max-w-xs">
          「この人とつながると何が生まれるか」<br />
          「誰のご縁でつながったか」を見える化する<br />
          信頼のご縁ネットワーク。
        </p>

        <div className="w-full max-w-sm space-y-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile/me"
                className="block w-full py-4 rounded-2xl bg-goen-gold-300 text-goen-green-900 font-bold text-center text-lg shadow-lg hover:bg-goen-gold-400 transition-colors"
              >
                マイページへ
              </Link>
              <Link
                to="/connections/map"
                className="block w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-center border border-white/20 hover:bg-white/20 transition-colors"
              >
                つながりマップを見る
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="block w-full py-4 rounded-2xl bg-goen-gold-300 text-goen-green-900 font-bold text-center text-lg shadow-lg hover:bg-goen-gold-400 transition-colors"
              >
                プロフィールを作る
              </Link>
              <Link
                to="/auth/login"
                className="block w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-center border border-white/20 hover:bg-white/20 transition-colors"
              >
                QRを読み込む
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-10 text-center">
        <div className="flex justify-center gap-6 text-green-300 text-xs">
          {['安心・安全設計', '申請→承認制', '5段階のご縁'].map(t => (
            <div key={t} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">✓</div>
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
