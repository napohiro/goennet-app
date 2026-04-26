export const MAX_DEPTH = 5

export const DEPTH_LABELS = {
  1: '直接つながり',
  2: '2段階',
  3: '3段階',
  4: '4段階',
  5: '5段階',
}

export const DEPTH_COLORS = {
  self: '#0f5530',
  1: '#1a8a52',
  2: '#2da86a',
  3: '#63c495',
  4: '#2563eb',
  5: '#60a5fa',
}

export const DEPTH_TAILWIND = {
  1: 'bg-goen-green-700 text-white',
  2: 'bg-goen-green-500 text-white',
  3: 'bg-goen-green-300 text-goen-green-900',
  4: 'bg-goen-blue-600 text-white',
  5: 'bg-goen-blue-500 text-white',
}

export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
}

export const SOURCE_TYPE = {
  QR: 'qr',
  MANUAL: 'manual',
  INVITE: 'invite',
}

export const CONTACT_VISIBILITY = {
  PRIVATE: 'private',
  MUTUAL_ONLY: 'mutual_only',
  PUBLIC: 'public',
}

export const LINEAGE_VISIBILITY = {
  PRIVATE: 'private',
  SUMMARY_ONLY: 'summary_only',
  DETAILED: 'detailed',
}

export const NETWORK_VISIBILITY = {
  DIRECT_ONLY: 'direct_only',
  DEPTH_3: 'depth_3',
  DEPTH_5: 'depth_5',
}

export const REPORT_STATUS = {
  OPEN: 'open',
  REVIEWING: 'reviewing',
  CLOSED: 'closed',
}

export const REPORT_REASONS = [
  'スパム・なりすまし',
  '不適切なコンテンツ',
  '嫌がらせ・ハラスメント',
  '詐欺・フィッシング',
  'その他',
]
