'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerTransactionDocument } from '@/app/actions/transaction-docs'
import { DOC_CATEGORIES } from '@/lib/transactions/types'

// Upload para o bucket PRIVADO transaction-docs (path: transaction_id/arquivo).
// Aceita pdf, imagens, docx/xlsx; limite de 25MB é imposto pelo bucket.
export default function DocUploader({
  transactionId,
  revalidate,
}: {
  transactionId: string
  revalidate: string
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState('outro')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      const safeName = file.name.replace(/[^\w.\-()À-ſ ]/g, '_')
      const path = `${transactionId}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('transaction-docs').upload(path, file)
      if (uploadError) throw new Error(uploadError.message)

      const form = new FormData()
      form.set('transaction_id', transactionId)
      form.set('name', file.name)
      form.set('category', category)
      form.set('storage_path', path)
      form.set('revalidate', revalidate)
      await registerTransactionDocument(form)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no upload.')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={busy}
          style={{ padding: '7px 10px', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit' }}
        >
          {DOC_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,application/pdf,image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
          style={{ fontSize: 13 }}
        />
      </div>
      {busy && <span style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)' }}>Enviando…</span>}
      {error && <span style={{ fontSize: 12.5, color: '#A03030' }}>{error}</span>}
      <span style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)' }}>PDF, imagens, DOCX/XLSX · máx. 25MB</span>
    </div>
  )
}
