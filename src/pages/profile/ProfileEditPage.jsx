import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../../components/profile/ProfileForm'
import { useMyProfile } from '../../hooks/useProfile'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { profile, loading: profileLoading, saveProfile } = useMyProfile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(data) {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await saveProfile(data)
      setSuccess(true)
      setTimeout(() => navigate('/profile/me'), 900)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-stone-100">
          <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-stone-800">プロフィール編集</h1>
      </div>

      {success && (
        <div className="bg-goen-green-50 border border-goen-green-200 rounded-xl p-3 mb-4 text-goen-green-700 text-sm font-medium">
          ✓ 保存しました。マイページに移動します…
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <ProfileForm profile={profile} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
