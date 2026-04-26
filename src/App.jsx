import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuthContext } from './context/AuthContext'
import { isSupabaseConfigured } from './lib/supabase'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import LoadingSpinner from './components/common/LoadingSpinner'

import TopPage from './pages/TopPage'
import LoginPage from './pages/auth/LoginPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'
import ProfileCreatePage from './pages/profile/ProfileCreatePage'
import ProfileEditPage from './pages/profile/ProfileEditPage'
import MyProfilePage from './pages/profile/MyProfilePage'
import ProfileViewPage from './pages/profile/ProfileViewPage'
import ConnectionRequestsPage from './pages/connections/ConnectionRequestsPage'
import ConnectionMapPage from './pages/connections/ConnectionMapPage'
import InvitePage from './pages/invite/InvitePage'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!session) return <Navigate to="/auth/login" replace />
  return children
}

function MockModeBanner() {
  return (
    <div className="bg-amber-400 text-amber-900 text-xs text-center py-1.5 font-medium px-2">
      🔧 ローカルモックモード — Supabase 未接続（.env を設定すると本番連携できます）
    </div>
  )
}

function AppRoutes() {
  const { session, loading } = useAuthContext()

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen flex flex-col">
      {!isSupabaseConfigured && <MockModeBanner />}
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />

          <Route path="/profile/create" element={
            <ProtectedRoute><ProfileCreatePage /></ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute><ProfileEditPage /></ProtectedRoute>
          } />
          <Route path="/profile/me" element={
            <ProtectedRoute><MyProfilePage /></ProtectedRoute>
          } />
          <Route path="/profile/:profileId" element={
            <ProtectedRoute><ProfileViewPage /></ProtectedRoute>
          } />
          <Route path="/connections/requests" element={
            <ProtectedRoute><ConnectionRequestsPage /></ProtectedRoute>
          } />
          <Route path="/connections/map" element={
            <ProtectedRoute><ConnectionMapPage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {session && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
