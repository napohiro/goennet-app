import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'

export default function ExternalLink({ href, children, className = '' }) {
  const [showConfirm, setShowConfirm] = useState(false)

  function handleClick(e) {
    e.preventDefault()
    setShowConfirm(true)
  }

  function handleConfirm() {
    window.open(href, '_blank', 'noopener,noreferrer')
    setShowConfirm(false)
  }

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="外部サイトへ移動">
        <p className="text-stone-600 mb-2">以下の外部サイトを開きます。よろしいですか？</p>
        <p className="text-sm font-mono bg-stone-100 rounded-lg p-2 mb-5 break-all text-stone-700">{href}</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setShowConfirm(false)}>キャンセル</Button>
          <Button variant="primary" fullWidth onClick={handleConfirm}>開く</Button>
        </div>
      </Modal>
    </>
  )
}
