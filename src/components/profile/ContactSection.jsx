import ExternalLink from '../common/ExternalLinkConfirm'

export default function ContactSection({ profile, isMutual }) {
  if (!isMutual && profile.contact_visibility !== 'public') {
    return (
      <div className="bg-stone-50 rounded-xl p-4 text-center">
        <p className="text-stone-500 text-sm">
          {profile.contact_visibility === 'private'
            ? '連絡先は非公開です。'
            : '連絡先は相互承認後に表示されます。'}
        </p>
      </div>
    )
  }

  const contacts = [
    { key: 'line_contact', label: 'LINE', icon: '💬' },
    { key: 'email_contact', label: 'メール', icon: '✉️' },
    { key: 'phone_contact', label: '電話', icon: '📞' },
  ].filter(c => profile[c.key])

  if (contacts.length === 0) return null

  return (
    <div className="space-y-2">
      {contacts.map(c => (
        <div key={c.key} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3">
          <span className="text-xl">{c.icon}</span>
          <div>
            <p className="text-xs text-stone-400 font-medium">{c.label}</p>
            <p className="text-stone-700 font-medium">{profile[c.key]}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
