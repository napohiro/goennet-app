import { supabase } from '../lib/supabase'

export async function blockUser(blockerProfileId, blockedProfileId, reason = '') {
  const { data, error } = await supabase
    .from('goennet_blocks')
    .insert({ blocker_profile_id: blockerProfileId, blocked_profile_id: blockedProfileId, reason })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function unblockUser(blockerProfileId, blockedProfileId) {
  const { error } = await supabase
    .from('goennet_blocks')
    .delete()
    .eq('blocker_profile_id', blockerProfileId)
    .eq('blocked_profile_id', blockedProfileId)
  if (error) throw error
}

export async function isBlocked(myProfileId, otherProfileId) {
  const { data } = await supabase
    .from('goennet_blocks')
    .select('id')
    .or(`and(blocker_profile_id.eq.${myProfileId},blocked_profile_id.eq.${otherProfileId}),and(blocker_profile_id.eq.${otherProfileId},blocked_profile_id.eq.${myProfileId})`)
    .maybeSingle()
  return !!data
}

export async function getBlockedProfiles(myProfileId) {
  const { data, error } = await supabase
    .from('goennet_blocks')
    .select('*, blocked:goennet_members!blocked_profile_id(id, display_name, handle_name, avatar_url)')
    .eq('blocker_profile_id', myProfileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function reportUser(reporterProfileId, reportedProfileId, reason, details = '') {
  const { data, error } = await supabase
    .from('goennet_reports')
    .insert({
      reporter_profile_id: reporterProfileId,
      reported_profile_id: reportedProfileId,
      reason,
      details,
      status: 'open',
    })
    .select()
    .single()
  if (error) throw error
  return data
}
