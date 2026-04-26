import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProfileById } from '../../services/profileService'
import { checkMutualConnection, checkPendingRequest, sendConnectionRequest } from '../../services/connectionService'
import { getLineage } from '../../services/lineageService'
import { isBlocked } from '../../services/safetyService'
import { useMyProfile } from '../../hooks/useProfile'
import ContactSection from '../../components/profile/ContactSection'
import LineageRecord from '../../components/connections/LineageRecord'
import BlockReportModal from '../../components/safety/BlockReportModal'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ExternalLink from '../../components/common/ExternalLinkConfirm'
import Modal from '../../components/common/Modal'

export default function ProfileViewPage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { profile: myProfile } = useMyProfile()

  const [profile, setProfile] = useState(null)
  const [mutual, setMutual] = useState(false)
  const [pending, setPending] = useState(null)
  const [lineage, setLineage] = useState(null)
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(true)

  const [showBlockReport, setShowBlockReport] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const isMe = myProfile?.id === profileId

  useEffect(() => {
    if (!profileId) return
    setLoading(true)
    Promise.all([
      getProfileById(profileId),
      myProfile ? checkMutualConnection(myProfile.id, profileId) : Promise.resolve(false),
      myProfile ? checkPendingRequest(myProfile.id, profileId) : Promise.resolve(null),
      myProfile ? getLineage(myProfile.id, profileId) : Promise.resolve(null),
      myProfile ? isBlocked(myProfile.id, profileId) : Promise.resolve(false),
    ]).then(([p, m, pend, lin, blk]) => {
      setProfile(p)
      setMutual(m)
      setPending(pend)
      setLineage(lin)
      setBlocked(blk)
    }).finally(() => setLoading(false))
  }, [profileId, myProfile?.id])

  async function handleSendRequest() {
    if (!myProfile) { navigate('/auth/login'); return }
    setRequestLoading(true)
    try {
      await sendConnectionRequest(myProfile.id, profileId, requestMessage, 'manual')
      setRequestSent(true)
      setShowRequestModal(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setRequestLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!profile) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-stone-500">プロフィールが見つかりません。</p>
    </div>
  )

  if (blocked) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <p className="text-stone-500">このプロフィールは表示できません。</p>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-stone-100">
          <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-stone-800 flex-1">プロフィール</h1>
        {!isMe && myProfile && (
          <button
            onClick={() => setShowBlockReport(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            title="ブロック・通報"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.display_name} className="w-20 h-20 rounded-full object-cover border-4 border-goen-green-100" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-goen-green-700 flex items-center justify-center text-white font-bold text-3xl">
            {(profile.display_name || '?')[0]}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-stone-800">{profile.display_name}</h2>
          {profile.handle_name && <p className="text-stone-400 text-sm">@{profile.handle_name}</p>}
          <div className="flex gap-1.5 mt-1 flex-wrap">
            {mutual && <Badge variant="depth1">直接つながり</Badge>}
            {lineage && lineage.origin_depth > 1 && lineage.promoted_to_direct && (
              <Badge variant="gold">元{lineage.origin_depth}段</Badge>
            )}
          </div>
        </div>
      </div>

      {profile.catch_copy && (
        <p className="text-stone-600 mb-4">{profile.catch_copy}</p>
      )}

      {profile.how_i_can_help && (
        <div className="bg-goen-green-50 rounded-2xl p-4 mb-4 border border-goen-green-100">
          <p className="text-xs font-bold text-goen-green-600 mb-1.5">私が役に立てること</p>
          <p className="text-stone-800 font-medium">{profile.how_i_can_help}</p>
        </div>
      )}

      {profile.useful_for && (
        <div className="bg-stone-50 rounded-xl p-3 mb-3">
          <p className="text-xs font-bold text-stone-500 mb-1">役に立てる方</p>
          <p className="text-stone-700 text-sm">{profile.useful_for}</p>
        </div>
      )}

      {profile.what_we_can_do && (
        <div className="bg-stone-50 rounded-xl p-3 mb-3">
          <p className="text-xs font-bold text-stone-500 mb-1">つながると何ができるか</p>
          <p className="text-stone-700 text-sm">{profile.what_we_can_do}</p>
        </div>
      )}

      {profile.offer_tags && profile.offer_tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {profile.offer_tags.map(tag => <Badge key={tag} variant="green">{tag}</Badge>)}
        </div>
      )}

      {(profile.website_url || profile.youtube_url || profile.instagram_url) && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {profile.website_url && <ExternalLink href={profile.website_url} className="text-goen-blue-600 text-sm font-medium hover:underline">🌐 HP</ExternalLink>}
          {profile.youtube_url && <ExternalLink href={profile.youtube_url} className="text-red-600 text-sm font-medium hover:underline">▶ YouTube</ExternalLink>}
          {profile.instagram_url && <ExternalLink href={profile.instagram_url} className="text-pink-600 text-sm font-medium hover:underline">📸 Instagram</ExternalLink>}
        </div>
      )}

      {mutual && (
        <div className="mb-4">
          <p className="text-sm font-bold text-stone-600 mb-2">連絡先</p>
          <ContactSection profile={profile} isMutual={mutual} />
        </div>
      )}

      {lineage && (
        <div className="mb-4">
          <LineageRecord lineage={lineage} viewerIsRoot />
        </div>
      )}

      {!isMe && myProfile && !mutual && (
        <div className="fixed bottom-20 inset-x-4 max-w-lg mx-auto">
          {requestSent || pending ? (
            <div className="bg-goen-green-50 border border-goen-green-200 rounded-2xl p-4 text-center text-goen-green-700 font-medium">
              {requestSent ? '申請を送りました。承認をお待ちください。' : '申請中です。承認をお待ちください。'}
            </div>
          ) : (
            <Button variant="primary" fullWidth size="lg" onClick={() => setShowRequestModal(true)}>
              つながり申請を送る
            </Button>
          )}
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="つながり申請">
        <p className="text-stone-600 text-sm mb-4">
          {profile.display_name} さんにつながり申請を送ります。<br />
          承認後に直接つながりになります。
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">メッセージ（任意）</label>
          <textarea
            rows={3}
            value={requestMessage}
            onChange={e => setRequestMessage(e.target.value)}
            placeholder="ご縁のきっかけや自己紹介など、一言添えると承認されやすいです。"
            className="w-full rounded-xl border-stone-300 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setShowRequestModal(false)}>キャンセル</Button>
          <Button variant="primary" fullWidth onClick={handleSendRequest} loading={requestLoading}>申請する</Button>
        </div>
      </Modal>

      <BlockReportModal
        isOpen={showBlockReport}
        onClose={() => setShowBlockReport(false)}
        myProfileId={myProfile?.id}
        targetProfile={profile}
      />
    </div>
  )
}
