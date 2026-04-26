import { supabase } from '../lib/supabase'
import { APP_URL } from '../lib/authConfig'

function generateToken() {
  return crypto.randomUUID()
}

export async function getOrCreateInviteToken(profileId) {
  const { data: existing, error: selectErr } = await supabase
    .from('goennet_qr_invites')
    .select('*')
    .eq('owner_profile_id', profileId)
    .or('is_active.eq.true,is_active.is.null')
    .maybeSingle()

  if (selectErr) {
    console.error('[qrService] getOrCreateInviteToken SELECT failed:', selectErr)
    throw selectErr
  }
  if (existing) return existing

  const token = generateToken()
  const { data, error } = await supabase
    .from('goennet_qr_invites')
    .insert({
      owner_profile_id: profileId,
      invite_token: token,
      is_active: true,
      used_count: 0,
    })
    .select()
    .single()
  if (error) {
    console.error('[qrService] getOrCreateInviteToken INSERT failed:', error)
    throw error
  }
  console.log('[qrService] new invite token created:', token, 'for profile:', profileId)
  return data
}

export async function createTimedInviteToken(profileId, expiresInHours = 24, maxUses = null) {
  const token = generateToken()
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('goennet_qr_invites')
    .insert({
      owner_profile_id: profileId,
      invite_token: token,
      expires_at: expiresAt,
      max_uses: maxUses,
      is_active: true,
      used_count: 0,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getInviteByToken(token) {
  // Step 1: fetch invite row
  const { data: invite, error: inviteErr } = await supabase
    .from('goennet_qr_invites')
    .select('*')
    .eq('invite_token', token)
    .or('is_active.eq.true,is_active.is.null')
    .maybeSingle()
  if (inviteErr) {
    console.error('[qrService] getInviteByToken SELECT invite failed:', inviteErr)
    throw inviteErr
  }
  if (!invite) {
    console.warn('[qrService] getInviteByToken: no invite found for token:', token)
    return null
  }

  // Step 2: fetch owner profile separately
  const { data: owner, error: ownerErr } = await supabase
    .from('goennet_members')
    .select('id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help, useful_for, what_we_can_do, offer_tags, website_url, youtube_url, instagram_url, is_public')
    .eq('id', invite.owner_profile_id)
    .maybeSingle()
  if (ownerErr) {
    console.error('[qrService] getInviteByToken SELECT owner failed:', ownerErr)
    throw ownerErr
  }
  if (!owner) {
    console.warn('[qrService] getInviteByToken: owner profile not found for id:', invite.owner_profile_id)
  }

  return { ...invite, owner }
}

export function getInviteUrl(token) {
  return `${APP_URL}/invite/${token}`
}

export async function incrementUsedCount(inviteId) {
  await supabase.rpc('increment_invite_used_count', { invite_id: inviteId })
}
