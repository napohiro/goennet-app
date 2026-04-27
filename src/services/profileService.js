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

export async function getMyProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('[Goen Net] getMyProfile getUser error:', userError)
    throw userError
  }
  if (!user) throw new Error('未認証です')
  console.log('[Goen Net] getMyProfile: 検索する auth_user_id =', user.id)
  const { data, error } = await supabase
    .from('goennet_members')
    .select('*')
    .eq('auth_user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('[Goen Net] getMyProfile error:', error)
    throw error
  }
  return data
}

export async function getProfileById(profileId) {
  const { data, error } = await supabase
    .from('goennet_members')
    .select('id, display_name, handle_name, avatar_url, catch_copy, how_i_can_help, useful_for, what_we_can_do, offer_tags, website_url, youtube_url, instagram_url, contact_visibility, lineage_visibility, network_visibility, is_public, created_at')
    .eq('id', profileId)
    .eq('is_public', true)
    .eq('is_deleted', false)
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
    .eq('is_deleted', false)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createProfile(profileData) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('[Goen Net] createProfile getUser error:', userError)
    throw userError
  }
  if (!user) throw new Error('未認証です')
  const payload = {
    auth_user_id: user.id,
    ...sanitizeProfileData(profileData),
    is_deleted: false,
    deleted_at: null,
  }
  console.log('[Goen Net] createProfile: auth_user_id =', user.id, 'payload =', payload)
  const { data, error } = await supabase
    .from('goennet_members')
    .upsert(payload, { onConflict: 'auth_user_id' })
    .select()
    .single()
  if (error) {
    console.error('[Goen Net] createProfile error:', error)
    console.log('[Goen Net] createProfile error detail:', JSON.stringify(error, null, 2))
    throw error
  }
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
  if (error) {
    console.error('[Goen Net] updateProfile error:', error)
    throw error
  }
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

export async function deleteMyProfile() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('未認証です')

  const { data: profile, error: profileError } = await supabase
    .from('goennet_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (profileError) throw profileError
  if (!profile) throw new Error('削除するプロフィールが見つかりません')

  const pid = profile.id
  console.log('[Goen Net] deleteMyProfile: soft delete start, profile.id =', pid)

  // つながりを無効化
  await supabase
    .from('goennet_direct_connections')
    .update({ is_active: false })
    .or(`profile_a_id.eq.${pid},profile_b_id.eq.${pid}`)

  // ご縁履歴を無効化
  await supabase
    .from('goennet_connection_lineage')
    .update({ is_active: false })
    .or(`root_profile_id.eq.${pid},target_profile_id.eq.${pid}`)

  // 保留中の申請をキャンセル
  await supabase
    .from('goennet_connection_requests')
    .update({ status: 'cancelled', responded_at: new Date().toISOString() })
    .or(`requester_profile_id.eq.${pid},owner_profile_id.eq.${pid}`)
    .eq('status', 'pending')

  // プロフィールを soft delete
  const { error: deleteError } = await supabase
    .from('goennet_members')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', pid)
  if (deleteError) {
    console.error('[Goen Net] deleteMyProfile error:', deleteError)
    throw deleteError
  }

  console.log('[Goen Net] deleteMyProfile: done, profile.id =', pid)
}
