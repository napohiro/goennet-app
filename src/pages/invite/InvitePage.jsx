import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInviteByToken } from '../../services/qrService'
import { createDirectConnection, checkMutualConnection } from '../../services/connectionService'
import { useMyProfile } from '../../hooks/useProfile'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ExternalLink from '../../components/common/ExternalLinkConfirm'

export default function InvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { profile: myProfile, loading: profileLoading } = useMyProfile()

  const [invite, setInvite] = useState(null)
  const [mutual, setMutual] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getInviteByToken(token)
      .then(async (data) => {
        if (!data || !data.is_active) { setNotFound(true); return }
        setInvite(data)
        if (myProfile && data.owner) {
          const m = await checkMutualConnection(myProfile.id, data.owner.id)
          setMutual(m)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token, myProfile?.id])

  async function handleRequest() {
    if (!isAuthenticated) {
      navigate(`/auth/login?redirect=/invite/${token}`)
      return
    }
    // プロフィールがまだ読み込み中の場合は何もしない（競合防止）
    if (profileLoading) return
    if (!myProfile) {
      navigate(`/profile/create?redirect=/invite/${token}`)
      return
    }
    setSending(true)
    setSendError(null)
    try {
      await createDirectConnection(myProfile.id, invite.owner.id)
      setSent(true)
    } catch (e) {
      setSendError(e.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-bold text-stone-800 text-xl mb-2">QRが見つかりません</h2>
        <p className="text-stone-500 text-sm">このQRコードは無効または期限切れです。</p>
      </div>
    </div>
  )

  const owner = invite?.owner
  if (!owner) return null

  const isMe = myProfile?.id === owner.id

  return (
    <div className="min-h-screen bg-goen-warm">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-goen-green-700 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <span>縁</span> Goen Net QRからのご縁
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {owner.avatar_url ? (
              <img src={owner.avatar_url} alt={owner.display_name} className="w-20 h-20 rounded-full object-cover border-4 border-goen-green-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-goen-green-700 flex items-center justify-center text-white font-bold text-3xl">
                {(owner.display_name || '?')[0]}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-stone-800">{owner.display_name}</h2>
              {owner.handle_name && <p className="text-stone-400 text-sm">@{owner.handle_name}</p>}
            </div>
          </div>

          {owner.catch_copy && (
            <p className="text-stone-600 mb-3">{owner.catch_copy}</p>
          )}

          {owner.how_i_can_help && (
            <div className="bg-goen-green-50 rounded-xl p-3 mb-3 border border-goen-green-100">
              <p className="text-xs font-bold text-goen-green-600 mb-1">私が役に立てること</p>
              <p className="text-stone-800 text-sm font-medium">{owner.how_i_can_help}</p>
            </div>
          )}

          {owner.offer_tags && owner.offer_tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {owner.offer_tags.map(tag => <Badge key={tag} variant="green">{tag}</Badge>)}
            </div>
          )}
        </div>

        {isMe ? (
          <div className="bg-goen-green-50 rounded-2xl p-4 text-center text-goen-green-700 font-medium">
            これはあなた自身のQRコードです
          </div>
        ) : sent ? (
          <div className="bg-goen-green-50 border border-goen-green-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🌿</div>
            <p className="font-bold text-goen-green-800 text-lg mb-1">つながりました！</p>
            <p className="text-stone-500 text-sm">{owner.display_name} さんと直接つながりました。</p>
            <button onClick={() => navigate('/profile/me')} className="mt-4 text-goen-green-700 text-sm font-medium underline">
              マイページへ戻る
            </button>
          </div>
        ) : mutual ? (
          <div className="bg-goen-green-50 border border-goen-green-200 rounded-2xl p-4 text-center text-goen-green-700 font-medium">
            すでに直接つながっています
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
            <h3 className="font-bold text-stone-800 mb-1">{owner.display_name} さんに申請する</h3>
            <p className="text-stone-500 text-xs mb-4">
              ボタンを押すと {owner.display_name} さんと直接つながります。
            </p>
            {sendError && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3 mb-3">{sendError}</p>
            )}
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleRequest}
              loading={sending || (isAuthenticated && profileLoading)}
            >
              {isAuthenticated ? '申請する' : 'ログインして申請する'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
