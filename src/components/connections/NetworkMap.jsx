import { useMemo, useState, useRef } from 'react'
import { calculateCircularLayout, getNodeColor, getDepthLabel } from '../../utils/networkUtils'
import Badge from '../common/Badge'
import { useNavigate } from 'react-router-dom'

const NODE_R = 28
const DEPTH_BADGE_VARIANT = ['depth1', 'depth2', 'depth3', 'depth4', 'depth5']

export default function NetworkMap({ nodes, edges, myProfileId }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [maxDepth, setMaxDepth] = useState(2)
  const svgRef = useRef(null)

  const W = 340, H = 340
  const CX = W / 2, CY = H / 2

  const filteredNodes = useMemo(() =>
    nodes.filter(n => n.depth <= maxDepth),
    [nodes, maxDepth]
  )
  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.profileId))
    return edges.filter(e => nodeIds.has(e.from) && nodeIds.has(e.to))
  }, [edges, filteredNodes])

  const positioned = useMemo(() =>
    calculateCircularLayout(filteredNodes, CX, CY, 90),
    [filteredNodes, CX, CY]
  )

  const posMap = useMemo(() => {
    const m = {}
    positioned.forEach(n => { m[n.profileId] = n })
    return m
  }, [positioned])

  const selectedNode = selected ? posMap[selected] : null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 flex-wrap justify-center">
        {[1, 2, 3, 4, 5].map(d => (
          <button
            key={d}
            onClick={() => setMaxDepth(d)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              maxDepth === d
                ? 'bg-goen-green-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {d === 1 ? '直接のみ' : `${d}段階まで`}
          </button>
        ))}
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 360 }}>
          {filteredEdges.map((e, i) => {
            const from = posMap[e.from]
            const to = posMap[e.to]
            if (!from || !to) return null
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={getNodeColor(e.depth)}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
            )
          })}

          {positioned.map(node => {
            const color = getNodeColor(node.depth)
            const isSelf = node.profileId === myProfileId
            const isSelected = selected === node.profileId
            const name = isSelf ? 'あなた' : (node.profile?.display_name || '?')
            const initial = name[0]

            return (
              <g
                key={node.profileId}
                transform={`translate(${node.x},${node.y})`}
                onClick={() => {
                  if (isSelf) return
                  setSelected(isSelected ? null : node.profileId)
                }}
                style={{ cursor: isSelf ? 'default' : 'pointer' }}
              >
                <circle
                  r={NODE_R + (isSelected ? 4 : 0)}
                  fill={color}
                  opacity={isSelected ? 1 : 0.85}
                  stroke="white"
                  strokeWidth={isSelf ? 3 : 1.5}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={isSelf ? 14 : 12}
                  fontWeight="bold"
                >
                  {initial}
                </text>
                <text
                  y={NODE_R + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#44403c"
                  fontWeight="500"
                >
                  {name.length > 5 ? name.slice(0, 4) + '…' : name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {selectedNode && selectedNode.profile && (
        <div
          className="w-full bg-white rounded-2xl border border-goen-green-200 p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate(`/profile/${selectedNode.profileId}`)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg"
              style={{ backgroundColor: getNodeColor(selectedNode.depth) }}>
              {(selectedNode.profile.display_name || '?')[0]}
            </div>
            <div>
              <p className="font-bold text-stone-800">{selectedNode.profile.display_name}</p>
              <div className="flex gap-1.5 mt-0.5">
                <Badge variant={DEPTH_BADGE_VARIANT[selectedNode.depth - 1] || 'gray'}>
                  {getDepthLabel(selectedNode.depth)}
                </Badge>
              </div>
            </div>
            <svg className="w-4 h-4 text-stone-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {selectedNode.profile.how_i_can_help && (
            <p className="text-sm text-goen-green-700 mt-2">{selectedNode.profile.how_i_can_help}</p>
          )}
        </div>
      )}

      <div className="flex gap-4 flex-wrap justify-center text-xs text-stone-500">
        {[1, 2, 3, 4, 5].map(d => (
          <div key={d} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor(d) }} />
            {getDepthLabel(d)}
          </div>
        ))}
      </div>
    </div>
  )
}
