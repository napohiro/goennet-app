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
    setLoading(true)
    try {
      const data = await getMyProfile(user.id)
      setProfile(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  async function saveProfile(profileData) {
    if (!user) throw new Error('ログインが必要です')
    if (profile) {
      const updated = await updateProfile(profile.id, profileData)
      setProfile(updated)
      return updated
    } else {
      const created = await createProfile(user.id, profileData)
      setProfile(created)
      return created
    }
  }

  return { profile, loading, error, saveProfile, refetch: fetchProfile }
}
