'use client'

import { useState } from 'react'
import { getDocumentDownloadUrl } from '@/app/actions/transaction-docs'

export default function DownloadButton({ docId }: { docId: string }) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    setBusy(true)
    try {
      const { url } = await getDocumentDownloadUrl(docId)
      window.open(url, '_blank', 'noopener')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao baixar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      style={{
        background: 'none',
        border: '1px solid rgba(30,167,232,0.4)',
        borderRadius: 6,
        color: '#0E6FA3',
        padding: '5px 12px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: busy ? 'wait' : 'pointer',
      }}
    >
      {busy ? '…' : 'Baixar'}
    </button>
  )
}
