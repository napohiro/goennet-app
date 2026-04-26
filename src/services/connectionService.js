import { supabase } from '../lib/supabase'
import { throwSupabaseError } from '../lib/supabaseError'

export async function sendConnectionRequest(requesterId, receiverId, message = '', sourceType = 'manual') {
  const { data: existing } = await supabase
    .from('goennet_connection_requests')
    .select('id, status')
    .or(`and(requester_profile_id.eq.${requesterId},receiver_profile_id.eq.${receiverId}),and(requester_profile_id.eq.${receiverId},receiver_profile_id.eq.${requesterId})`)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) throw new Error('既に申請が送られています')

  const { data, error } = await supabase
    .from('goennet_connection_requests')
    .insert({
      requester_profile_id: requesterId,
      receiver_profile_id: receiverId,
      message,
      source_type: sourceType,
      status: 'pending',
    })
    .select()
    .single()
  if (error) throwSupabaseError('sendConnectionRequest', error)
  return data
}

export async function getIncomingRequests(profileId) {
  const { data, error } = await supabase
    .from('goennet_connection_requests')
    .select('*, requester:goennet_members!requester_profile_id(id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help)')
    .eq('receiver_profile_id', profileId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throwSupabaseError('getIncomingRequests', error)
  return data
}

export async function getOutgoingRequests(profileId) {
  const { data, error } = await supabase
    .from('goennet_connection_requests')
    .select('*, receiver:goennet_members!receiver_profile_id(id, display_name, handle_name, avatar_url, catch_copy)')
    .eq('requester_profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throwSupabaseError('getOutgoingRequests', error)
  return data
}

export async function approveRequest(requestId, myProfileId) {
  const { data: req, error: reqErr } = await supabase
    .from('goennet_connection_requests')
    .select('*')
    .eq('id', requestId)
    .single()
  if (reqErr) throwSupabaseError('approveRequest/fetchRequest', reqErr)

  const { error: updateErr } = await supabase
    .from('goennet_connection_requests')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', requestId)
  if (updateErr) throwSupabaseError('approveRequest/updateStatus', updateErr)

  // profile_a_id = 申請者, profile_b_id = 受信者（承認者）
  const { data: conn, error: connErr } = await supabase
    .from('goennet_direct_connections')
    .insert({
      profile_a_id: req.requester_profile_id,
      profile_b_id: req.receiver_profile_id,
      source_request_id: requestId,
      source_type: req.source_type,
      is_active: true,
    })
    .select()
    .single()
  if (connErr) throwSupabaseError('approveRequest/insertDirectConnection', connErr)

  await supabase
    .from('goennet_connection_lineage')
    .insert({
      root_profile_id: req.requester_profile_id,
      target_profile_id: req.receiver_profile_id,
      origin_depth: 1,
      current_depth: 1,
      path_profile_ids: [req.requester_profile_id, req.receiver_profile_id],
      path_display_text: '直接つながり',
      promoted_to_direct: true,
      promoted_at: new Date().toISOString(),
      direct_connection_id: conn.id,
      is_active: true,
    })

  return conn
}

export async function rejectRequest(requestId) {
  const { error } = await supabase
    .from('goennet_connection_requests')
    .update({ status: 'rejected', responded_at: new Date().toISOString() })
    .eq('id', requestId)
  if (error) throwSupabaseError('rejectRequest', error)
}

export async function getDirectConnections(profileId) {
  const { data, error } = await supabase
    .from('goennet_direct_connections')
    .select('*, profile_a:goennet_members!profile_a_id(id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help), profile_b:goennet_members!profile_b_id(id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help)')
    .or(`profile_a_id.eq.${profileId},profile_b_id.eq.${profileId}`)
    .eq('is_active', true)
  if (error) throwSupabaseError('getDirectConnections', error)
  return data.map(conn => ({
    ...conn,
    partner: conn.profile_a_id === profileId ? conn.profile_b : conn.profile_a,
  }))
}

export async function checkMutualConnection(myProfileId, otherProfileId) {
  const { data, error } = await supabase
    .from('goennet_direct_connections')
    .select('id')
    .or(`and(profile_a_id.eq.${myProfileId},profile_b_id.eq.${otherProfileId}),and(profile_a_id.eq.${otherProfileId},profile_b_id.eq.${myProfileId})`)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throwSupabaseError('checkMutualConnection', error)
  return !!data
}

export async function checkPendingRequest(myProfileId, otherProfileId) {
  const { data, error } = await supabase
    .from('goennet_connection_requests')
    .select('id, status')
    .or(`and(requester_profile_id.eq.${myProfileId},receiver_profile_id.eq.${otherProfileId}),and(requester_profile_id.eq.${otherProfileId},receiver_profile_id.eq.${myProfileId})`)
    .eq('status', 'pending')
    .maybeSingle()
  if (error) throwSupabaseError('checkPendingRequest', error)
  return data
}
