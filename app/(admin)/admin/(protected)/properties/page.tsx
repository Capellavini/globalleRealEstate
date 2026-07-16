import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createProperty, addToPortfolio } from '@/app/actions/properties'
import PropertyFormFields from '@/components/portfolio/PropertyFormFields'
import { countryFlag, formatMoney, type Property } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

export default async function PropertiesPage() {
  const supabase = createClient()
  const [{ data: properties, error }, { data: theses }] = await Promise.all([
    supabase.from('properties').select('*').order('created_at', { ascending: false }),
    supabase
      .from('theses')
      .select('id, title, is_active, profiles!theses_client_id_fkey(full_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Imóveis</h1>
      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro: {error.message} — a migration do portfólio já rodou?</p>}

      <details style={{ ...card, marginBottom: 24 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+ Cadastrar imóvel</summary>
        <form action={createProperty} style={{ display: 'grid', gap: 16, marginTop: 16 }}>
          <PropertyFormFields />
          <div>
            <button
              type="submit"
              style={{ padding: '11px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Criar imóvel
            </button>
          </div>
        </form>
      </details>

      <div style={{ display: 'grid', gap: 12 }}>
        {(properties ?? []).map((row) => {
          const property = row as Property
          return (
            <div key={property.id} style={{ ...card, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: 84,
                  height: 60,
                  borderRadius: 8,
                  flexShrink: 0,
                  background: property.cover_photo_url
                    ? `url(${property.cover_photo_url}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #0E1530, #131B38)',
                }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <Link href={`/admin/properties/${property.id}`} style={{ fontWeight: 700, color: '#0B1230', textDecoration: 'none', fontSize: 15 }}>
                  {property.title}
                </Link>
                <div style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)', marginTop: 2 }}>
                  {countryFlag(property.country_code)} {property.city} · {formatMoney(Number(property.asking_price), property.currency)} · {property.property_type}
                </div>
              </div>

              <form action={addToPortfolio} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="hidden" name="property_id" value={property.id} />
                <select
                  name="thesis_id"
                  required
                  defaultValue=""
                  style={{ padding: '7px 10px', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', maxWidth: 230 }}
                >
                  <option value="" disabled>
                    adicionar ao portfólio de…
                  </option>
                  {(theses ?? []).map((thesis: any) => (
                    <option key={thesis.id} value={thesis.id}>
                      {thesis.profiles?.full_name ?? '—'} — {thesis.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  style={{ padding: '7px 14px', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  Adicionar
                </button>
              </form>
            </div>
          )
        })}
        {!error && (properties ?? []).length === 0 && (
          <div style={{ ...card, textAlign: 'center', color: 'rgba(11,18,48,0.6)', fontSize: 14, border: '1px dashed rgba(11,18,48,0.15)' }}>
            Nenhum imóvel cadastrado ainda.
          </div>
        )}
      </div>
    </>
  )
}
