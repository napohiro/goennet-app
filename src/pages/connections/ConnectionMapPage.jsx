import { useState, useEffect } from 'react'
import { useMyProfile } from '../../hooks/useProfile'
import { buildNetworkGraph } from '../../services/lineageService'
import NetworkMap from '../../components/connections/NetworkMap'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'

export default function ConnectionMapPage() {
  const { profile, loading: profileLoading } = useMyProfile()
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] })
  const [graphLoading, setGraphLoading] = useState(false)

  useEffect(() => {
    if (!profile) return
    setGraphLoading(true)
    buildNetworkGraph(profile.id, 3)
      .then(data => setGraphData(data))
      .catch(console.error)
      .finally(() => setGraphLoading(false))
  }, [profile?.id])

  if (profileLoading || graphLoading) return <LoadingSpinner text="ネットワークを読み込み中…" />
  if (!profile) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center text-stone-400">
      プロフィールを作成してください
    </div>
  )

  const depthCounts = graphData.nodes.reduce((acc, n) => {
    if (n.depth > 0) acc[n.depth] = (acc[n.depth] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">つながりマップ</h1>
      <p className="text-stone-500 text-sm mb-4">あなたを中心としたご縁のネットワークです。</p>

      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(depthCounts).map(([depth, count]) => (
          <div key={depth} className="flex items-center gap-1.5 bg-stone-50 rounded-full px-3 py-1">
            <Badge variant={`depth${depth}`}>{depth === '1' ? '直接' : `${depth}段`}</Badge>
            <span className="text-sm text-stone-600 font-medium">{count}人</span>
          </div>
        ))}
        {graphData.nodes.length <= 1 && (
          <p className="text-stone-400 text-sm">まだつながりがありません</p>
        )}
      </div>

      {graphData.nodes.length > 0 && (
        <NetworkMap
          nodes={graphData.nodes}
          edges={graphData.edges}
          myProfileId={profile.id}
        />
      )}

      <div className="mt-6 bg-goen-green-50 rounded-2xl p-4 border border-goen-green-100">
        <p className="text-sm font-bold text-goen-green-700 mb-1">ご縁マップについて</p>
        <p className="text-xs text-stone-600 leading-relaxed">
          直接つながりが増えるほどマップが広がります。
          QRコードを共有してご縁を育てましょう。
          ネットワークは最大5段階まで表示できます。
        </p>
      </div>
    </div>
  )
}
