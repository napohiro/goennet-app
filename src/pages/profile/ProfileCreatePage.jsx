import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileForm from '../../components/profile/ProfileForm'
import { useMyProfile } from '../../hooks/useProfile'

export default function ProfileCreatePage() {
  const navigate = useNavigate()
  const { saveProfile } = useMyProfile()
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

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">プロフィールを作る</h1>
        <p className="text-stone-500 text-sm mt-1">
          あなたが「どんな人の役に立てるか」を中心に教えてください。
        </p>
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

      <ProfileForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
