import { useState } from 'react'
import Button from '../common/Button'

const VISIBILITY_OPTS_CONTACT = [
  { value: 'private', label: '非公開' },
  { value: 'mutual_only', label: '相互承認後のみ（推奨）' },
  { value: 'public', label: '全体公開' },
]
const VISIBILITY_OPTS_LINEAGE = [
  { value: 'private', label: '非公開' },
  { value: 'summary_only', label: '要約のみ（推奨）' },
  { value: 'detailed', label: '詳細表示' },
]
const VISIBILITY_OPTS_NETWORK = [
  { value: 'direct_only', label: '直接つながりのみ' },
  { value: 'depth_3', label: '3段階まで' },
  { value: 'depth_5', label: '5段階まで' },
]

const INITIAL = {
  display_name: '',
  handle_name: '',
  catch_copy: '',
  how_i_can_help: '',
  useful_for: '',
  what_we_can_do: '',
  offer_tags_str: '',
  website_url: '',
  youtube_url: '',
  instagram_url: '',
  line_contact: '',
  email_contact: '',
  phone_contact: '',
  contact_visibility: 'mutual_only',
  lineage_visibility: 'summary_only',
  network_visibility: 'direct_only',
  is_public: true,
}

function profileToForm(profile) {
  if (!profile) return INITIAL
  // DB レコードを安全にフォーム用データへ変換する
  // id / auth_user_id / created_at / updated_at など余分なカラムは含めない
  return {
    display_name:        profile.display_name        || '',
    handle_name:         profile.handle_name         || '',
    catch_copy:          profile.catch_copy          || '',
    how_i_can_help:      profile.how_i_can_help      || '',
    useful_for:          profile.useful_for          || '',
    what_we_can_do:      profile.what_we_can_do      || '',
    offer_tags_str:      (profile.offer_tags || []).join('、'),
    website_url:         profile.website_url         || '',
    youtube_url:         profile.youtube_url         || '',
    instagram_url:       profile.instagram_url       || '',
    line_contact:        profile.line_contact        || '',
    email_contact:       profile.email_contact       || '',
    phone_contact:       profile.phone_contact       || '',
    contact_visibility:  profile.contact_visibility  || 'mutual_only',
    lineage_visibility:  profile.lineage_visibility  || 'summary_only',
    network_visibility:  profile.network_visibility  || 'direct_only',
    is_public:           profile.is_public !== undefined ? profile.is_public : true,
  }
}

export default function ProfileForm({ profile, onSubmit, loading }) {
  const [form, setForm] = useState(() => profileToForm(profile))

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = {
      ...form,
      offer_tags: form.offer_tags_str
        ? form.offer_tags_str.split(/[、,，\s]+/).filter(Boolean)
        : [],
    }
    delete data.offer_tags_str
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h3 className="text-sm font-bold text-goen-green-700 uppercase tracking-wide mb-3">基本情報</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">表示名 <span className="text-red-500">*</span></label>
            <input
              required
              value={form.display_name}
              onChange={e => set('display_name', e.target.value)}
              placeholder="例：田中 花子"
              className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">ハンドルネーム（英数字）</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-50 text-stone-500">@</span>
              <input
                value={form.handle_name}
                onChange={e => set('handle_name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="hanako_tanaka"
                className="flex-1 rounded-r-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">キャッチコピー</label>
            <input
              value={form.catch_copy}
              onChange={e => set('catch_copy', e.target.value)}
              placeholder="例：地域をつなぐ福祉の橋渡し役"
              className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-goen-green-700 uppercase tracking-wide mb-3">ご縁のポイント</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">私が役に立てること</label>
            <textarea
              rows={3}
              value={form.how_i_can_help}
              onChange={e => set('how_i_can_help', e.target.value)}
              placeholder="例：中小企業の販路開拓や補助金申請のサポートが得意です。"
              className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">どんな人の役に立てるか</label>
            <textarea
              rows={2}
              value={form.useful_for}
              onChange={e => set('useful_for', e.target.value)}
              placeholder="例：新規事業を始めたい経営者、副業を考えている会社員"
              className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">つながると何ができるか</label>
            <textarea
              rows={2}
              value={form.what_we_can_do}
              onChange={e => set('what_we_can_do', e.target.value)}
              placeholder="例：適切な支援機関や専門家をご紹介できます。"
              className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">紹介できる人・分野（カンマ区切り）</label>
            <input
              value={form.offer_tags_str}
              onChange={e => set('offer_tags_str', e.target.value)}
              placeholder="例：税理士、IT支援、補助金、農業"
              className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-goen-green-700 uppercase tracking-wide mb-3">公開リンク</h3>
        <div className="space-y-3">
          {[
            { key: 'website_url', label: 'ホームページ', placeholder: 'https://example.com' },
            { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
            { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
              <input
                type="url"
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-goen-green-700 uppercase tracking-wide mb-1">連絡先（任意・初期非公開）</h3>
        <p className="text-xs text-stone-500 mb-3">連絡先は公開範囲の設定に従って表示されます。</p>
        <div className="space-y-3">
          {[
            { key: 'line_contact', label: 'LINE ID', placeholder: 'line_id' },
            { key: 'email_contact', label: 'メールアドレス', placeholder: 'email@example.com' },
            { key: 'phone_contact', label: '電話番号', placeholder: '090-xxxx-xxxx' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border-stone-300 focus:ring-goen-green-500 focus:border-goen-green-500"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-goen-green-700 uppercase tracking-wide mb-3">公開範囲設定</h3>
        <div className="space-y-4">
          {[
            { key: 'contact_visibility', label: '連絡先の公開範囲', opts: VISIBILITY_OPTS_CONTACT },
            { key: 'lineage_visibility', label: 'ご縁履歴の公開範囲', opts: VISIBILITY_OPTS_LINEAGE },
            { key: 'network_visibility', label: 'ネットワークの公開範囲', opts: VISIBILITY_OPTS_NETWORK },
          ].map(({ key, label, opts }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
              <div className="space-y-1.5">
                {opts.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={key}
                      value={opt.value}
                      checked={form[key] === opt.value}
                      onChange={() => set(key, opt.value)}
                      className="text-goen-green-700 focus:ring-goen-green-500"
                    />
                    <span className="text-sm text-stone-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={e => set('is_public', e.target.checked)}
              className="rounded text-goen-green-700 focus:ring-goen-green-500"
            />
            <span className="text-sm text-stone-700">プロフィールを公開する</span>
          </label>
        </div>
      </section>

      <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
        保存する
      </Button>
    </form>
  )
}
