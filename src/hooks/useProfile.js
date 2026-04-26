import { useState, useEffect, useCallback } from 'react'
import { getMyProfile, createProfile, updateProfile } from '../services/profileService'
import { useAuthContext } from '../context/AuthContext'

export function useMyProfile() {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    console.log('[Goen Net] fetchProfile: auth_user_id =', user.id)
    setLoading(true)
    try {
      const data = await getMyProfile(user.id)
      setProfile(data)
    } catch (e) {
      console.error('[Goen Net] fetchProfile error:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  async function saveProfile(profileData) {
    if (!user) throw new Error('ログインが必要です')
    if (profile) {
      await updateProfile(profile.id, profileData)
    } else {
      await createProfile(user.id, profileData)
    }
    // 保存後はSupabaseから再取得してstateを確実に同期する
    await fetchProfile()
  }

  return { profile, loading, error, saveProfile, refetch: fetchProfile }
}
