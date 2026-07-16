import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProperty, deleteProperty, removePhoto } from '@/app/actions/properties'
import PropertyFormFields from '@/components/portfolio/PropertyFormFields'
import PhotoUploader from '@/components/portfolio/PhotoUploader'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import type { Property } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('properties').select('*').eq('id', params.id).maybeSingle()
  if (!data) notFound()
  const property = data as Property
  const photos: string[] = Array.isArray(property.photos) ? property.photos : []

  return (
    <div style={{ maxWidth: 760 }}>
      <Link href="/admin/properties" style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        ← Imóveis
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '12px 0 20px' }}>{property.title}</h1>

      <form action={updateProperty} style={{ ...card, display: 'grid', gap: 16, marginBottom: 24 }}>
        <input type="hidden" name="id" value={property.id} />
        <PropertyFormFields property={property} />
        <div>
          <button
            type="submit"
            style={{ padding: '11px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Salvar alterações
          </button>
        </div>
      </form>

      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Fotos</h2>
        {photos.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {photos.map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: 130, height: 92, objectFit: 'cover', borderRadius: 8 }} />
                <form action={removePhoto} style={{ position: 'absolute', top: 4, right: 4 }}>
                  <input type="hidden" name="id" value={property.id} />
                  <input type="hidden" name="url" value={url} />
                  <button
                    type="submit"
                    title="Remover foto"
                    style={{ background: 'rgba(7,11,36,0.75)', color: '#fff', border: 'none', borderRadius: 6, width: 22, height: 22, cursor: 'pointer', fontSize: 12 }}
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
        <PhotoUploader propertyId={property.id} />
      </div>

      <form action={deleteProperty} style={{ textAlign: 'right' }}>
        <input type="hidden" name="id" value={property.id} />
        <ConfirmSubmitButton message={`Excluir "${property.title}"? Se estiver em algum portfólio, a exclusão falha.`}>
          Excluir imóvel
        </ConfirmSubmitButton>
      </form>
    </div>
  )
}
