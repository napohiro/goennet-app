import { DEPTH_COLORS, MAX_DEPTH } from '../lib/constants'

export function calculateCircularLayout(nodes, centerX, centerY, baseRadius = 100) {
  const depthGroups = {}
  nodes.forEach(node => {
    const d = node.depth
    if (!depthGroups[d]) depthGroups[d] = []
    depthGroups[d].push(node)
  })

  const positioned = []
  Object.entries(depthGroups).forEach(([depth, group]) => {
    const d = Number(depth)
    if (d === 0) {
      positioned.push({ ...group[0], x: centerX, y: centerY })
      return
    }
    const radius = baseRadius * d
    const angleStep = (2 * Math.PI) / group.length
    group.forEach((node, i) => {
      const angle = i * angleStep - Math.PI / 2
      positioned.push({
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      })
    })
  })

  return positioned
}

export function getNodeColor(depth) {
  if (depth === 0) return DEPTH_COLORS.self
  return DEPTH_COLORS[Math.min(depth, MAX_DEPTH)] || DEPTH_COLORS[MAX_DEPTH]
}

export function getDepthLabel(depth) {
  if (depth === 0) return 'あなた'
  if (depth === 1) return '直接'
  return `${depth}段階`
}
