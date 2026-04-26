export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function truncate(str, maxLen = 60) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

export function handleNameDisplay(handleName) {
  return handleName ? `@${handleName}` : ''
}

export function contactVisibilityLabel(val) {
  const map = { private: '非公開', mutual_only: '相互承認後のみ', public: '公開' }
  return map[val] || val
}

export function lineageVisibilityLabel(val) {
  const map = { private: '非公開', summary_only: '要約のみ', detailed: '詳細表示' }
  return map[val] || val
}

export function networkVisibilityLabel(val) {
  const map = { direct_only: '直接のみ', depth_3: '3段階まで', depth_5: '5段階まで' }
  return map[val] || val
}
