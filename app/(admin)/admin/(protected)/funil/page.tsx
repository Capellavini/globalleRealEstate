import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { countryFlag, type Profile } from '@/lib/portfolio/types'
import { sumByCurrency, type ProcessStepStatus } from '@/lib/transactions/types'

export const dynamic = 'force-dynamic'

// 7 colunas do funil comercial — visão de cliente, não de etapa de processo.
// "Due Diligence" agrega TODAS as subetapas do processo (Reserva, Due
// diligence, CPCV/Compromisso, Financiamento, Escritura, Registro) até o
// fechamento; a subetapa exata aparece como legenda no card.
const COLUMNS = ['Lead', 'Tese definida', 'Buscando imóveis', 'Proposta', 'Due Diligence', 'Fechado', 'Perdido'] as const
type Column = (typeof COLUMNS)[number]

const COLUMN_COLORS: Record<Column, { bg: string; fg: string }> = {
  Lead: { bg: 'rgba(11,18,48,0.03)', fg: 'rgba(11,18,48,0.55)' },
  'Tese definida': { bg: 'rgba(11,18,48,0.03)', fg: 'rgba(11,18,48,0.55)' },
  'Buscando imóveis': { bg: 'rgba(30,167,232,0.05)', fg: '#0E6FA3' },
  Proposta: { bg: 'rgba(30,167,232,0.05)', fg: '#0E6FA3' },
  'Due Diligence': { bg: 'rgba(30,167,232,0.05)', fg: '#0E6FA3' },
  Fechado: { bg: 'rgba(43,160,90,0.05)', fg: '#1E7A44' },
  Perdido: { bg: 'rgba(194,61,61,0.04)', fg: '#A03030' },
}

type ThesisRow = { id: string; client_id: string }
type ItemRow = { thesis_id: string; status: string }
type TxRow = {
  id: string
  client_id: string
  status: string
  created_at: string
  properties: { title: string; country_code: string } | null
  transaction_steps: { name: string; sort_order: number; status: ProcessStepStatus }[]
  transaction_revenues: { amount: number; currency: string; status: string }[]
}

function currentStepName(tx: TxRow): string | null {
  const steps = [...tx.transaction_steps].sort((a, b) => a.sort_order - b.sort_order)
  const current = steps.find((s) => s.status === 'em_andamento') ?? steps.find((s) => s.status === 'pendente')
  return current?.name ?? null
}

export default async function FunilPage() {
  const supabase = createClient()

  const { data: clientsData, error } = await supabase.from('profiles').select('*').eq('role', 'client')
  const clients = (clientsData ?? []) as Profile[]
  const clientIds = clients.map((c) => c.id)

  const [{ data: thesesData }, { data: txData }] = await Promise.all([
    clientIds.length
      ? supabase.from('theses').select('id, client_id').eq('is_active', true).in('client_id', clientIds)
      : Promise.resolve({ data: [] as ThesisRow[] }),
    clientIds.length
      ? supabase
          .from('transactions')
          .select(
            'id, client_id, status, created_at, properties(title, country_code), transaction_steps(name, sort_order, status), transaction_revenues(amount, currency, status)'
          )
          .in('client_id', clientIds)
      : Promise.resolve({ data: [] as TxRow[] }),
  ])

  const thesisByClient = new Map((thesesData ?? []).map((t: ThesisRow) => [t.client_id, t.id]))
  const thesisIds = (thesesData ?? []).map((t: ThesisRow) => t.id)

  const { data: itemsData } = thesisIds.length
    ? await supabase.from('portfolio_items').select('thesis_id, status').in('thesis_id', thesisIds)
    : { data: [] as ItemRow[] }
  const itemsByThesis = new Map<string, ItemRow[]>()
  for (const item of (itemsData ?? []) as ItemRow[]) {
    const list = itemsByThesis.get(item.thesis_id) ?? []
    list.push(item)
    itemsByThesis.set(item.thesis_id, list)
  }

  const txByClient = new Map<string, TxRow[]>()
  for (const tx of (txData ?? []) as unknown as TxRow[]) {
    const list = txByClient.get(tx.client_id) ?? []
    list.push(tx)
    txByClient.set(tx.client_id, list)
  }

  type CardInfo = {
    client: Profile
    column: Column
    subLabel: string | null
    property: { title: string; country_code: string } | null
    revenueTx: TxRow | null
  }

  const cards: CardInfo[] = clients.map((client) => {
    const thesisId = thesisByClient.get(client.id)
    const items = thesisId ? itemsByThesis.get(thesisId) ?? [] : []
    const txs = (txByClient.get(client.id) ?? []).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    const active = txs.find((t) => t.status === 'active')
    const closed = txs.find((t) => t.status === 'closed')
    const cancelled = txs.find((t) => t.status === 'cancelled')

    if (active) {
      const step = currentStepName(active)
      const column: Column = step === 'Proposta' ? 'Proposta' : 'Due Diligence'
      return {
        client,
        column,
        subLabel: column === 'Due Diligence' ? step : null,
        property: active.properties,
        revenueTx: active,
      }
    }
    if (closed) {
      return { client, column: 'Fechado', subLabel: null, property: closed.properties, revenueTx: closed }
    }
    if (cancelled) {
      return { client, column: 'Perdido', subLabel: null, property: cancelled.properties, revenueTx: cancelled }
    }
    if (thesisId && items.length > 0) {
      return { client, column: 'Buscando imóveis', subLabel: `${items.length} imóve${items.length === 1 ? 'l' : 'is'}`, property: null, revenueTx: null }
    }
    if (thesisId) {
      return { client, column: 'Tese definida', subLabel: null, property: null, revenueTx: null }
    }
    return { client, column: 'Lead', subLabel: null, property: null, revenueTx: null }
  })

  const byColumn = new Map<Column, CardInfo[]>()
  for (const c of cards) {
    const list = byColumn.get(c.column) ?? []
    list.push(c)
    byColumn.set(c.column, list)
  }

  function pendingRevenue(list: CardInfo[]): string {
    const entries = list
      .map((c) => c.revenueTx)
      .filter((tx): tx is TxRow => tx !== null)
      .flatMap((tx) => tx.transaction_revenues.filter((r) => r.status !== 'recebido'))
    return entries.length ? sumByCurrency(entries) : ''
  }

  return (
    <>
      <style>{`
        .crm-cols { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; padding-bottom: 8px; }
        .crm-col { min-width: 210px; width: 210px; flex-shrink: 0; }
        @media (max-width: 860px) { .crm-col { min-width: 78vw; } }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Funil</h1>
        <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>Clientes por estágio comercial — previsibilidade de faturamento.</p>
      </div>

      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro ao carregar: {error.message}</p>}

      {!error && clients.length === 0 && (
        <div style={{ background: '#fff', border: '1px dashed rgba(11,18,48,0.15)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'rgba(11,18,48,0.60)', fontSize: 14 }}>
          Nenhum cliente ainda.
        </div>
      )}

      {clients.length > 0 && (
        <div className="crm-cols">
          {COLUMNS.map((column) => {
            const list = byColumn.get(column) ?? []
            const revenue = pendingRevenue(list)
            const colors = COLUMN_COLORS[column]
            return (
              <div
                key={column}
                className="crm-col"
                style={{
                  background: colors.bg,
                  border: '1px solid rgba(11,18,48,0.08)',
                  borderRadius: 12,
                  padding: 10,
                  display: 'grid',
                  gap: 10,
                  alignContent: 'start',
                }}
              >
                <div style={{ padding: '2px 4px', display: 'grid', gap: 2 }}>
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: colors.fg,
                    }}
                  >
                    {column} <span style={{ color: 'rgba(11,18,48,0.35)' }}>({list.length})</span>
                  </span>
                  {revenue && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A6320' }} title="Receita prevista ainda não recebida">
                      ⏳ {revenue}
                    </span>
                  )}
                </div>

                {list.map((c) => (
                  <Link
                    key={c.client.id}
                    href={`/admin/clientes/${c.client.id}`}
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(11,18,48,0.10)',
                      borderRadius: 10,
                      padding: 14,
                      textDecoration: 'none',
                      color: '#0B1230',
                      display: 'grid',
                      gap: 6,
                    }}
                  >
                    <strong style={{ fontSize: 14, fontWeight: 700 }}>{c.client.full_name}</strong>
                    {c.property && (
                      <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.6)' }}>
                        {countryFlag(c.property.country_code)} {c.property.title}
                      </span>
                    )}
                    {c.subLabel && (
                      <span style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.55)' }}>{c.subLabel}</span>
                    )}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
