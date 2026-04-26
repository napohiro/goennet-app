import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-goen-green-700 text-white shadow-md">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link to={isAuthenticated ? '/profile/me' : '/'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-goen-gold-300 flex items-center justify-center text-goen-green-900 font-bold text-sm">
            縁
          </div>
          <span className="font-bold text-lg tracking-wide">Goen Net</span>
        </Link>

        <nav className="flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link to="/connections/requests" className="p-2 rounded-lg hover:bg-goen-green-600 relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-goen-green-600 text-sm">
                ログアウト
              </button>
            </>
          ) : (
            <Link to="/auth/login" className="text-sm font-semibold hover:text-goen-gold-300 transition-colors">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
