import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  countryFlag,
  formatMoney,
  OBJECTIVE_LABELS,
  type Thesis,
} from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

// Equipe: lista de clientes/teses → clica → kanban.
export default async function PortfoliosPage() {
  const supabase = createClient()
  const { data: theses, error } = await supabase
    .from('theses')
    .select('*, profiles!theses_client_id_fkey(full_name), portfolio_items(status)')
    .order('created_at', { ascending: false })

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Portfólios</h1>
        <Link
          href="/admin/users"
          style={{ background: '#070B24', color: '#fff', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
        >
          + Novo cliente
        </Link>
      </div>

      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro: {error.message} — a migration do portfólio já rodou no Supabase?</p>}

      {!error && (theses ?? []).length === 0 && (
        <div style={{ background: '#fff', border: '1px dashed rgba(11,18,48,0.15)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'rgba(11,18,48,0.6)', fontSize: 14 }}>
          Nenhuma tese ainda. Convide o primeiro cliente em “Novo cliente”.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {(theses ?? []).map((thesisRow) => {
          const thesis = thesisRow as Thesis & { profiles: { full_name: string } | null; portfolio_items: { status: string }[] }
          const items = thesis.portfolio_items ?? []
          const advancing = items.filter((i) => i.status === 'avancar').length
          return (
            <Link
              key={thesis.id}
              href={`/admin/portfolios/${thesis.id}`}
              style={{
                background: '#fff',
                border: '1px solid rgba(11,18,48,0.10)',
                borderRadius: 12,
                padding: 20,
                textDecoration: 'none',
                color: '#0B1230',
                display: 'grid',
                gap: 10,
                opacity: thesis.is_active ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <strong style={{ fontSize: 16, fontWeight: 800 }}>{thesis.profiles?.full_name ?? '—'}</strong>
                {!thesis.is_active && <span style={{ fontSize: 11, color: 'rgba(11,18,48,0.5)' }}>inativa</span>}
              </div>
              <span style={{ fontSize: 13.5, color: 'rgba(11,18,48,0.7)' }}>{thesis.title}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                <span style={{ background: 'rgba(30,167,232,0.14)', color: '#0E6FA3', borderRadius: 999, padding: '3px 10px', fontWeight: 700 }}>
                  {OBJECTIVE_LABELS[thesis.objective]}
                </span>
                <span style={{ background: 'rgba(11,18,48,0.06)', borderRadius: 999, padding: '3px 10px' }}>
                  {thesis.target_countries.map((c) => countryFlag(c)).join(' ')} {formatMoney(thesis.budget_max, thesis.budget_currency)}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)' }}>
                {items.length} imóve{items.length === 1 ? 'l' : 'is'} no funil
                {advancing > 0 && (
                  <strong style={{ color: '#1E7A44' }}> · {advancing} em Avançar</strong>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
