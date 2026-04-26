import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import { formatDateTime } from '../../utils/formatUtils'

export default function ConnectionRequestCard({ request, type, onApprove, onReject }) {
  const [loading, setLoading] = useState(false)
  const profile = type === 'incoming' ? request.requester : request.receiver

  async function handleApprove() {
    setLoading(true)
    try { await onApprove(request.id) } finally { setLoading(false) }
  }

  async function handleReject() {
    setLoading(true)
    try { await onReject(request.id) } finally { setLoading(false) }
  }

  const statusLabel = { pending: '申請中', accepted: '承認済み', rejected: 'お断り済み' }
  const statusColor = { pending: 'text-amber-600', accepted: 'text-goen-green-700', rejected: 'text-stone-400' }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-goen-green-100 flex items-center justify-center text-goen-green-700 font-bold text-lg">
              {(profile?.display_name || '?')[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-bold text-stone-800">{profile?.display_name}</p>
            <span className={`text-xs font-medium ${statusColor[request.status]}`}>
              {statusLabel[request.status]}
            </span>
          </div>
          {profile?.how_i_can_help && (
            <p className="text-sm text-goen-green-700 mt-0.5">{profile.how_i_can_help}</p>
          )}
          {request.message && (
            <p className="text-sm text-stone-600 mt-1 bg-stone-50 rounded-lg p-2">{request.message}</p>
          )}
          <p className="text-xs text-stone-400 mt-1">{formatDateTime(request.created_at)}</p>
        </div>
      </div>

      {type === 'incoming' && request.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button variant="primary" fullWidth size="sm" onClick={handleApprove} loading={loading}>
            承認する
          </Button>
          <Button variant="secondary" fullWidth size="sm" onClick={handleReject} loading={loading}>
            お断りする
          </Button>
        </div>
      )}
    </Card>
  )
}
