import { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { REPORT_REASONS } from '../../lib/constants'
import { blockUser, reportUser } from '../../services/safetyService'

export default function BlockReportModal({ isOpen, onClose, myProfileId, targetProfile }) {
  const [mode, setMode] = useState('menu')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)

  function reset() {
    setMode('menu')
    setReason('')
    setDetails('')
    setDone(null)
  }

  async function handleBlock() {
    setLoading(true)
    try {
      await blockUser(myProfileId, targetProfile.id, reason)
      setDone('block')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReport() {
    if (!reason) { alert('理由を選択してください'); return }
    setLoading(true)
    try {
      await reportUser(myProfileId, targetProfile.id, reason, details)
      setDone('report')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    reset()
    onClose()
  }

  if (!targetProfile) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="安全設定">
      {done === 'block' && (
        <div className="text-center py-4">
          <p className="text-lg font-bold text-stone-800 mb-2">ブロックしました</p>
          <p className="text-stone-500 text-sm mb-4">{targetProfile.display_name} さんはあなたのプロフィールや申請を見られなくなります。</p>
          <Button variant="primary" onClick={handleClose} fullWidth>閉じる</Button>
        </div>
      )}
      {done === 'report' && (
        <div className="text-center py-4">
          <p className="text-lg font-bold text-stone-800 mb-2">通報しました</p>
          <p className="text-stone-500 text-sm mb-4">ご報告ありがとうございます。運営が確認します。</p>
          <Button variant="primary" onClick={handleClose} fullWidth>閉じる</Button>
        </div>
      )}

      {!done && mode === 'menu' && (
        <div className="space-y-3">
          <p className="text-stone-600 text-sm">{targetProfile.display_name} さんへの操作を選択してください。</p>
          <button
            onClick={() => setMode('block')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-xl">🚫</div>
            <div>
              <p className="font-semibold text-stone-800">ブロックする</p>
              <p className="text-xs text-stone-500">相手からの申請・表示を遮断します</p>
            </div>
          </button>
          <button
            onClick={() => setMode('report')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-100 hover:bg-red-50 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xl">⚠️</div>
            <div>
              <p className="font-semibold text-red-700">通報する</p>
              <p className="text-xs text-stone-500">問題のある行動を運営に報告します</p>
            </div>
          </button>
        </div>
      )}

      {!done && mode === 'block' && (
        <div className="space-y-4">
          <p className="text-stone-600 text-sm">{targetProfile.display_name} さんをブロックしますか？</p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">理由（任意）</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="例：不審なメッセージが来た"
              className="w-full rounded-xl border-stone-300"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setMode('menu')}>戻る</Button>
            <Button variant="danger" fullWidth onClick={handleBlock} loading={loading}>ブロックする</Button>
          </div>
        </div>
      )}

      {!done && mode === 'report' && (
        <div className="space-y-4">
          <p className="text-stone-600 text-sm">{targetProfile.display_name} さんを通報します。</p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">通報理由 <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              {REPORT_REASONS.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-stone-700">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">詳細（任意）</label>
            <textarea
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="詳しい状況を教えてください"
              className="w-full rounded-xl border-stone-300"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setMode('menu')}>戻る</Button>
            <Button variant="danger" fullWidth onClick={handleReport} loading={loading}>通報する</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
