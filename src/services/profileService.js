import { supabase } from '../lib/supabase'

// goennet_members テーブルの書き込み可能カラム（完全一致リスト）
const PROFILE_COLUMNS = [
  'display_name', 'handle_name', 'avatar_url', 'catch_copy',
  'how_i_can_help', 'useful_for', 'what_we_can_do', 'offer_tags',
  'website_url', 'youtube_url', 'instagram_url',
  'line_contact', 'email_contact', 'phone_contact',
  'contact_visibility', 'lineage_visibility', 'network_visibility',
  'is_public',
]

// 許可カラムだけ抽出し、任意テキスト欄の空文字を null に変換する
function sanitizeProfileData(data) {
  const payload = {}
  for (const col of PROFILE_COLUMNS) {
    if (!(col in data)) continue
    const v = data[col]
    // handle_name など unique カラムの空文字 → null（一意制約対策）
    const isOptionalText = typeof v === 'string' && col !== 'display_name'
    payload[col] = isOptionalText && v.trim() === '' ? null : v
  }
  return payload
}

export async function getMyProfile(authUserId) {
  const { data, error } = await supabase
    .from('goennet_members')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getProfileById(profileId) {
  const { data, error } = await supabase
    .from('goennet_members')
    .select('id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help, useful_for, what_we_can_do, offer_tags, website_url, youtube_url, instagram_url, contact_visibility, lineage_visibility, network_visibility, is_public, created_at')
    .eq('id', profileId)
    .eq('is_public', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function getProfileByHandle(handleName) {
  const { data, error } = await supabase
    .from('goennet_members')
    .select('id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help, useful_for, what_we_can_do, offer_tags, website_url, youtube_url, instagram_url, contact_visibility, lineage_visibility, network_visibility, is_public')
    .eq('handle_name', handleName)
    .eq('is_public', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProfile(authUserId, profileData) {
  const payload = { auth_user_id: authUserId, ...sanitizeProfileData(profileData) }
  console.log('[Goen Net] createProfile payload:', payload)
  const { data, error } = await supabase
    .from('goennet_members')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(profileId, profileData) {
  const payload = { ...sanitizeProfileData(profileData), updated_at: new Date().toISOString() }
  console.log('[Goen Net] updateProfile payload:', payload)
  const { data, error } = await supabase
    .from('goennet_members')
    .update(payload)
    .eq('id', profileId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getContactInfo(profileId) {
  const { data, error } = await supabase
    .from('goennet_members')
    .select('line_contact, email_contact, phone_contact, contact_visibility')
    .eq('id', profileId)
    .maybeSingle()
  if (error) throw error
  return data
}
