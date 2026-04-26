import { supabase } from '../lib/supabase'
import { MAX_DEPTH } from '../lib/constants'
import { throwSupabaseError } from '../lib/supabaseError'

export async function getLineage(rootProfileId, targetProfileId) {
  const { data, error } = await supabase
    .from('goennet_connection_lineage')
    .select('*')
    .eq('root_profile_id', rootProfileId)
    .eq('target_profile_id', targetProfileId)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throwSupabaseError('getLineage', error)
  return data
}

export async function getMyLineages(profileId) {
  const { data, error } = await supabase
    .from('goennet_connection_lineage')
    .select('*, target:goennet_members!target_profile_id(id, display_name, handle_name, avatar_url)')
    .eq('root_profile_id', profileId)
    .eq('is_active', true)
    .order('current_depth', { ascending: true })
  if (error) throwSupabaseError('getMyLineages', error)
  return data
}

export async function buildNetworkGraph(myProfileId, maxDepth = MAX_DEPTH) {
  const visited = new Set([myProfileId])
  const nodes = [{ profileId: myProfileId, depth: 0, path: [myProfileId] }]
  const edges = []
  const queue = [{ profileId: myProfileId, depth: 0, path: [myProfileId] }]

  while (queue.length > 0) {
    const current = queue.shift()
    if (current.depth >= maxDepth) continue

    const { data: conns, error: connErr } = await supabase
      .from('goennet_direct_connections')
      .select('profile_a_id, profile_b_id, profile_a:goennet_members!profile_a_id(id, display_name, handle_name, avatar_url, catch_copy), profile_b:goennet_members!profile_b_id(id, display_name, handle_name, avatar_url, catch_copy)')
      .or(`profile_a_id.eq.${current.profileId},profile_b_id.eq.${current.profileId}`)
      .eq('is_active', true)

    if (connErr) throwSupabaseError('buildNetworkGraph', connErr)
    if (!conns) continue

    for (const conn of conns) {
      const partnerId = conn.profile_a_id === current.profileId
        ? conn.profile_b_id
        : conn.profile_a_id
      const partnerProfile = conn.profile_a_id === current.profileId
        ? conn.profile_b
        : conn.profile_a

      if (!visited.has(partnerId)) {
        visited.add(partnerId)
        const newDepth = current.depth + 1
        const newPath = [...current.path, partnerId]
        nodes.push({ profileId: partnerId, depth: newDepth, path: newPath, profile: partnerProfile })
        edges.push({ from: current.profileId, to: partnerId, depth: newDepth })
        queue.push({ profileId: partnerId, depth: newDepth, path: newPath })
      }
    }
  }

  return { nodes, edges }
}

export async function updateLineageOnPromotion(rootProfileId, targetProfileId, directConnectionId) {
  const { data: existing } = await supabase
    .from('goennet_connection_lineage')
    .select('id, origin_depth, path_display_text')
    .eq('root_profile_id', rootProfileId)
    .eq('target_profile_id', targetProfileId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('goennet_connection_lineage')
      .update({
        current_depth: 1,
        promoted_to_direct: true,
        promoted_at: new Date().toISOString(),
        direct_connection_id: directConnectionId,
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('goennet_connection_lineage')
      .insert({
        root_profile_id: rootProfileId,
        target_profile_id: targetProfileId,
        origin_depth: 1,
        current_depth: 1,
        path_profile_ids: [rootProfileId, targetProfileId],
        path_display_text: '直接つながり',
        promoted_to_direct: true,
        promoted_at: new Date().toISOString(),
        direct_connection_id: directConnectionId,
        is_active: true,
      })
  }
}

export function formatLineageText(lineage, profiles = {}) {
  if (!lineage) return null
  const { path_profile_ids, path_display_text, lineage_visibility, origin_depth, current_depth, promoted_to_direct } = lineage

  if (lineage_visibility === 'private') return null

  if (lineage_visibility === 'summary_only') {
    const via = origin_depth - 1
    if (promoted_to_direct && origin_depth > 1) {
      return `${via}名を介したご縁から出会い、現在は直接つながっています。`
    }
    return `${via}名を介したご縁でつながっています。`
  }

  if (path_display_text) return path_display_text
  return null
}
