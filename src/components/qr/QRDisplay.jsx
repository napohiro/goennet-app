import { QRCodeSVG } from 'qrcode.react'
import Button from '../common/Button'

export default function QRDisplay({ url, profileName }) {
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `${profileName} のご縁QR - Goen Net`,
        text: 'Goen Net でつながりませんか？',
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      alert('URLをコピーしました！')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <QRCodeSVG
          value={url}
          size={200}
          bgColor="#ffffff"
          fgColor="#0f5530"
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-stone-500 text-center break-all px-4">{url}</p>
      <p className="text-sm text-stone-600 text-center">
        QRを読み込んでも、すぐにはつながりません。<br />
        申請→承認のご縁つながりです。
      </p>
      <Button variant="gold" onClick={handleShare} size="md">
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        QRを共有する
      </Button>
    </div>
  )
}
