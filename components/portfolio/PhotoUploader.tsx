'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { addPhoto } from '@/app/actions/properties'

// Upload para o bucket público 'property-photos' direto do browser (equipe),
// depois grava a URL no imóvel via server action.
export default function PhotoUploader({ propertyId }: { propertyId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const supabase = createClient()
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: uploadError } = await supabase.storage.from('property-photos').upload(path, file)
        if (uploadError) throw new Error(uploadError.message)
        const { data } = supabase.storage.from('property-photos').getPublicUrl(path)
        await addPhoto(propertyId, data.publicUrl, false)
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no upload.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={busy}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ fontSize: 13 }}
      />
      {busy && <span style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)' }}>Enviando…</span>}
      {error && <span style={{ fontSize: 12.5, color: '#A03030' }}>{error} (o bucket property-photos existe?)</span>}
    </div>
  )
}
