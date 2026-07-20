import { createClient } from '@/lib/supabase/server'
import { type Profile } from '@/lib/portfolio/types'
import { sumByCurrency, type ProcessStepStatus } from '@/lib/transactions/types'
import FunnelBoard, { type FunnelCard } from '@/components/admin/FunnelBoard'

export const dynamic = 'force-dynamic'

// 7 colunas do funil comercial — visão de cliente, não de etapa de processo.
// "Due Diligence" agrega TODAS as subetapas do processo (Reserva, Due
// diligence, CPCV/Compromisso, Financiamento, Escritura, Registro) até o
// fechamento; a subetapa exata aparece como legenda no card.
const COLUMNS = ['Lead', 'Tese definida', 'Buscando imóveis', 'Proposta', 'Due Diligence', 'Fechado', 'Perdido'] as const

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

  const cards: FunnelCard[] = []
  const revenueTxByColumn = new Map<string, TxRow[]>()

  for (const client of clients) {
    const thesisId = thesisByClient.get(client.id)
    const items = thesisId ? itemsByThesis.get(thesisId) ?? [] : []
    const txs = (txByClient.get(client.id) ?? []).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    const active = txs.find((t) => t.status === 'active')
    const closed = txs.find((t) => t.status === 'closed')
    const cancelled = txs.find((t) => t.status === 'cancelled')

    let column: (typeof COLUMNS)[number]
    let subLabel: string | null = null
    let property: { title: string; country_code: string } | null = null
    let revenueTx: TxRow | null = null

    if (active) {
      const step = currentStepName(active)
      column = step === 'Proposta' ? 'Proposta' : 'Due Diligence'
      subLabel = column === 'Due Diligence' ? step : null
      property = active.properties
      revenueTx = active
    } else if (closed) {
      column = 'Fechado'
      property = closed.properties
      revenueTx = closed
    } else if (cancelled) {
      column = 'Perdido'
      property = cancelled.properties
      revenueTx = cancelled
    } else if (thesisId && items.length > 0) {
      column = 'Buscando imóveis'
      subLabel = `${items.length} imóve${items.length === 1 ? 'l' : 'is'}`
    } else if (thesisId) {
      column = 'Tese definida'
    } else {
      column = 'Lead'
    }

    cards.push({
      clientId: client.id,
      clientName: client.full_name,
      column,
      subLabel,
      propertyTitle: property?.title ?? null,
      propertyCountry: property?.country_code ?? null,
    })

    if (revenueTx) {
      const list = revenueTxByColumn.get(column) ?? []
      list.push(revenueTx)
      revenueTxByColumn.set(column, list)
    }
  }

  const revenueByColumn: Record<string, string> = {}
  for (const [column, txs] of revenueTxByColumn) {
    const entries = txs.flatMap((tx) => tx.transaction_revenues.filter((r) => r.status !== 'recebido'))
    if (entries.length) revenueByColumn[column] = sumByCurrency(entries)
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Funil</h1>
        <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>
          Clientes por estágio comercial — previsibilidade de faturamento. Arraste entre Proposta, Due Diligence,
          Fechado e Perdido.
        </p>
      </div>

      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro ao carregar: {error.message}</p>}

      {!error && clients.length === 0 && (
        <div style={{ background: '#fff', border: '1px dashed rgba(11,18,48,0.15)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'rgba(11,18,48,0.60)', fontSize: 14 }}>
          Nenhum cliente ainda.
        </div>
      )}

      {clients.length > 0 && <FunnelBoard columns={COLUMNS} initialCards={cards} revenueByColumn={revenueByColumn} />}
    </>
  )
}
