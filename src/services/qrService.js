import { supabase } from '../lib/supabase'
import { APP_URL } from '../lib/authConfig'

function generateToken() {
  return crypto.randomUUID()
}

export async function getOrCreateInviteToken(profileId) {
  const { data: existing } = await supabase
    .from('goennet_qr_invites')
    .select('*')
    .eq('owner_profile_id', profileId)
    .eq('is_active', true)
    .maybeSingle()

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
  if (error) throw error
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
  const { data, error } = await supabase
    .from('goennet_qr_invites')
    .select('*, owner:goennet_members!owner_profile_id(id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help, useful_for, what_we_can_do, offer_tags, website_url, youtube_url, instagram_url, is_public)')
    .eq('invite_token', token)
    .eq('is_active', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export function getInviteUrl(token) {
  return `${APP_URL}/invite/${token}`
}

export async function incrementUsedCount(inviteId) {
  await supabase.rpc('increment_invite_used_count', { invite_id: inviteId })
}
