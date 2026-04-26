import { useState } from 'react'
import { useMyProfile } from '../../hooks/useProfile'
import { useConnectionRequests } from '../../hooks/useConnections'
import ConnectionRequestCard from '../../components/connections/ConnectionRequestCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'

export default function ConnectionRequestsPage() {
  const { profile } = useMyProfile()
  const { incoming, outgoing, loading, approve, reject } = useConnectionRequests(profile?.id)
  const [tab, setTab] = useState('incoming')

  if (loading) return <LoadingSpinner />

  const tabs = [
    { key: 'incoming', label: '届いた申請', count: incoming.filter(r => r.status === 'pending').length },
    { key: 'outgoing', label: '送った申請', count: null },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">つながり申請</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              tab === t.key
                ? 'bg-goen-green-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${tab === t.key ? 'bg-goen-gold-300 text-goen-green-900' : 'bg-goen-green-700 text-white'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'incoming' && (
        <div className="space-y-3">
          {incoming.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-stone-400">届いた申請はありません</p>
            </div>
          ) : (
            incoming.map(req => (
              <ConnectionRequestCard
                key={req.id}
                request={req}
                type="incoming"
                onApprove={approve}
                onReject={reject}
              />
            ))
          )}
        </div>
      )}

      {tab === 'outgoing' && (
        <div className="space-y-3">
          {outgoing.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-stone-400">送った申請はありません</p>
            </div>
          ) : (
            outgoing.map(req => (
              <ConnectionRequestCard
                key={req.id}
                request={req}
                type="outgoing"
                onApprove={() => {}}
                onReject={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
