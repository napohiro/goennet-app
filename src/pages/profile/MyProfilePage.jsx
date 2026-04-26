import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMyProfile } from '../../hooks/useProfile'
import { useDirectConnections } from '../../hooks/useConnections'
import { getOrCreateInviteToken, getInviteUrl } from '../../services/qrService'
import QRDisplay from '../../components/qr/QRDisplay'
import ProfileCard from '../../components/profile/ProfileCard'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ExternalLink from '../../components/common/ExternalLinkConfirm'
import { contactVisibilityLabel, lineageVisibilityLabel, networkVisibilityLabel } from '../../utils/formatUtils'

export default function MyProfilePage() {
  const navigate = useNavigate()
  const { profile, loading } = useMyProfile()
  const { connections } = useDirectConnections(profile?.id)
  const [qrUrl, setQrUrl] = useState(null)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (!profile) return
    getOrCreateInviteToken(profile.id)
      .then(token => setQrUrl(getInviteUrl(token.invite_token)))
      .catch(console.error)
  }, [profile?.id])

  if (loading) return <LoadingSpinner />

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h2 className="text-xl font-bold text-stone-800 mb-2">まだプロフィールがありません</h2>
        <p className="text-stone-500 text-sm mb-6">プロフィールを作成して、ご縁ネットワークを始めましょう。</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/profile/create')}>
          プロフィールを作る
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="w-20 h-20 rounded-full object-cover border-4 border-goen-green-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-goen-green-700 flex items-center justify-center text-white font-bold text-3xl">
              {(profile.display_name || '?')[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-stone-800">{profile.display_name}</h1>
            {profile.handle_name && <p className="text-stone-400 text-sm">@{profile.handle_name}</p>}
            {!profile.is_public && <Badge variant="gray" className="mt-1">非公開</Badge>}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/profile/edit')}>
          編集
        </Button>
      </div>

      {profile.catch_copy && (
        <p className="text-stone-600 text-base mb-4">{profile.catch_copy}</p>
      )}

      {profile.how_i_can_help && (
        <div className="bg-goen-green-50 rounded-2xl p-4 mb-4 border border-goen-green-100">
          <p className="text-xs font-bold text-goen-green-600 mb-1.5">私が役に立てること</p>
          <p className="text-stone-800 font-medium">{profile.how_i_can_help}</p>
        </div>
      )}

      {profile.useful_for && (
        <div className="bg-stone-50 rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-stone-500 mb-1">役に立てる方</p>
          <p className="text-stone-700 text-sm">{profile.useful_for}</p>
        </div>
      )}

      {profile.what_we_can_do && (
        <div className="bg-stone-50 rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-stone-500 mb-1">つながると何ができるか</p>
          <p className="text-stone-700 text-sm">{profile.what_we_can_do}</p>
        </div>
      )}

      {profile.offer_tags && profile.offer_tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {profile.offer_tags.map(tag => (
            <Badge key={tag} variant="green">{tag}</Badge>
          ))}
        </div>
      )}

      <div className="flex gap-3 mb-6">
        {profile.website_url && (
          <ExternalLink href={profile.website_url} className="text-goen-blue-600 text-sm font-medium hover:underline">🌐 HP</ExternalLink>
        )}
        {profile.youtube_url && (
          <ExternalLink href={profile.youtube_url} className="text-red-600 text-sm font-medium hover:underline">▶ YouTube</ExternalLink>
        )}
        {profile.instagram_url && (
          <ExternalLink href={profile.instagram_url} className="text-pink-600 text-sm font-medium hover:underline">📸 Instagram</ExternalLink>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4">
        <p className="text-xs font-bold text-stone-500 mb-3">公開設定</p>
        <div className="space-y-1.5 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>連絡先</span><span className="font-medium">{contactVisibilityLabel(profile.contact_visibility)}</span>
          </div>
          <div className="flex justify-between">
            <span>ご縁履歴</span><span className="font-medium">{lineageVisibilityLabel(profile.lineage_visibility)}</span>
          </div>
          <div className="flex justify-between">
            <span>ネットワーク</span><span className="font-medium">{networkVisibilityLabel(profile.network_visibility)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-stone-700">直接つながり</p>
          <Badge variant="green">{connections.length}人</Badge>
        </div>
        {connections.length > 0 ? (
          <div className="space-y-2">
            {connections.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center gap-2" onClick={() => navigate(`/profile/${c.partner?.id}`)}>
                <div className="w-8 h-8 rounded-full bg-goen-green-100 flex items-center justify-center text-goen-green-700 font-bold text-sm cursor-pointer">
                  {(c.partner?.display_name || '?')[0]}
                </div>
                <span className="text-sm text-stone-700">{c.partner?.display_name}</span>
              </div>
            ))}
            {connections.length > 3 && (
              <button onClick={() => navigate('/connections/map')} className="text-goen-green-700 text-xs font-medium">
                すべて見る →
              </button>
            )}
          </div>
        ) : (
          <p className="text-stone-400 text-sm">まだ直接つながりがいません</p>
        )}
      </div>

      <div className="space-y-3">
        <Button variant="gold" fullWidth size="lg" onClick={() => setShowQR(true)}>
          QRコードを表示する
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/connections/map')}>
          つながりマップを見る
        </Button>
      </div>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="マイQRコード">
        {qrUrl && (
          <QRDisplay url={qrUrl} profileName={profile.display_name} />
        )}
      </Modal>
    </div>
  )
}
