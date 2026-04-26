import Card from '../common/Card'
import Badge from '../common/Badge'

export default function LineageRecord({ lineage, viewerIsRoot = false }) {
  if (!lineage) return null

  const { current_depth, origin_depth, promoted_to_direct, path_display_text, lineage_visibility } = lineage

  if (lineage_visibility === 'private' && !viewerIsRoot) return null

  const showDetail = lineage_visibility === 'detailed' || viewerIsRoot
  const via = (origin_depth || 1) - 1

  return (
    <Card className="bg-goen-green-50 border-goen-green-100">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full bg-goen-green-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-goen-green-800 mb-1">ご縁の記録</p>

          <div className="flex gap-2 flex-wrap mb-2">
            <Badge variant="depth1">現在 {current_depth === 1 ? '直接' : `${current_depth}段階`}</Badge>
            {promoted_to_direct && origin_depth > 1 && (
              <Badge variant="gold">元{origin_depth}段階</Badge>
            )}
          </div>

          {showDetail && path_display_text ? (
            <p className="text-sm text-goen-green-700">{path_display_text}</p>
          ) : lineage_visibility === 'summary_only' || !showDetail ? (
            <p className="text-sm text-goen-green-700">
              {via > 0
                ? `${via}名を介したご縁から出会いました。${promoted_to_direct ? '現在は直接つながっています。' : ''}`
                : '直接つながっています。'}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
