import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/admin/Badge'
import {
  formatDate,
  THESIS_COLORS,
  THESIS_LABELS,
  TX_STATUS_COLORS,
  TX_STATUS_LABELS,
  type Transaction,
} from '@/lib/admin/types'
import { countryFlag } from '@/lib/portfolio/types'
import { sumByCurrency, type ProcessStepStatus } from '@/lib/transactions/types'

export const dynamic = 'force-dynamic'

type TransactionRow = Transaction & {
  property_id: string | null
  client_id: string | null
  properties: { country_code: string } | null
  transaction_steps: { name: string; sort_order: number; status: ProcessStepStatus }[]
  transaction_revenues: { amount: number; currency: string; status: string }[]
}

const DONE_KEY = '__done__'

// Coluna da transação = sua etapa em_andamento (senão a 1ª pendente).
function columnOf(tx: TransactionRow, firstColumn: string | undefined): string {
  if (tx.status !== 'active') return DONE_KEY
  const steps = [...tx.transaction_steps].sort((a, b) => a.sort_order - b.sort_order)
  const current = steps.find((s) => s.status === 'em_andamento') ?? steps.find((s) => s.status === 'pendente')
  if (!current) return steps.length ? DONE_KEY : (firstColumn ?? DONE_KEY)
  return current.name
}

// Visão CRM: lente por fase do processo (previsibilidade de faturamento),
// complementar ao pipeline por cliente em /admin/clientes.
export default async function FunilPage() {
  const supabase = createClient()

  const [{ data: txData, error }, { data: templateSteps }] = await Promise.all([
    supabase
      .from('transactions')
      .select(
        '*, properties(country_code), transaction_steps(name, sort_order, status), transaction_revenues(amount, currency, status)'
      )
      .order('created_at', { ascending: false }),
    supabase.from('template_steps').select('name, sort_order'),
  ])

  const transactions = (txData ?? []) as unknown as TransactionRow[]

  // Colunas = união dos templates por NOME (a simetria PT/BR foi desenhada
  // pra isso), ordenadas pelo menor sort_order em que o nome aparece.
  const orderByName = new Map<string, number>()
  for (const step of templateSteps ?? []) {
    const current = orderByName.get(step.name)
    if (current === undefined || step.sort_order < current) orderByName.set(step.name, step.sort_order)
  }
  const stepColumns = [...orderByName.entries()]
    .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name)
  const columns = [...stepColumns, DONE_KEY]

  const byColumn = new Map<string, TransactionRow[]>()
  for (const tx of transactions) {
    const key = columnOf(tx, stepColumns[0])
    const list = byColumn.get(key) ?? []
    list.push(tx)
    byColumn.set(key, list)
  }

  // Previsibilidade de faturamento: receita prevista ainda não recebida,
  // somada por coluna (apenas transações ativas).
  function pendingRevenue(cards: TransactionRow[]): string {
    const entries = cards
      .filter((tx) => tx.status === 'active')
      .flatMap((tx) => tx.transaction_revenues.filter((r) => r.status !== 'recebido'))
    return entries.length ? sumByCurrency(entries) : ''
  }

  const visibleColumns = columns.filter((c) => c === DONE_KEY || stepColumns.includes(c))

  return (
    <>
      <style>{`
        .crm-cols { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; padding-bottom: 8px; }
        .crm-col { min-width: 225px; width: 225px; flex-shrink: 0; }
        @media (max-width: 860px) { .crm-col { min-width: 78vw; } }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Funil</h1>
        <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>Transações por fase do processo — previsibilidade de faturamento.</p>
      </div>

      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro ao carregar: {error.message}</p>}

      {!error && transactions.length === 0 && (
        <div style={{ background: '#fff', border: '1px dashed rgba(11,18,48,0.15)', borderRadius: 12, padding: 48, textAlign: 'center', color: 'rgba(11,18,48,0.60)', fontSize: 14 }}>
          Nenhuma transação ainda. Elas nascem do “Avançar” no dossiê do cliente.
        </div>
      )}

      {transactions.length > 0 && (
        <div className="crm-cols">
          {visibleColumns.map((column) => {
            const cards = byColumn.get(column) ?? []
            const revenue = pendingRevenue(cards)
            const isDone = column === DONE_KEY
            return (
              <div
                key={column}
                className="crm-col"
                style={{
                  background: isDone ? 'rgba(43,160,90,0.05)' : 'rgba(11,18,48,0.03)',
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
                      color: 'rgba(11,18,48,0.55)',
                    }}
                  >
                    {isDone ? 'Concluídas' : column} <span style={{ color: 'rgba(11,18,48,0.35)' }}>({cards.length})</span>
                  </span>
                  {revenue && (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A6320' }} title="Receita prevista ainda não recebida">
                      ⏳ {revenue}
                    </span>
                  )}
                </div>

                {cards.map((tx) => {
                  const thesis = THESIS_COLORS[tx.thesis]
                  const status = TX_STATUS_COLORS[tx.status]
                  return (
                    <Link
                      key={tx.id}
                      href={tx.client_id ? `/admin/clientes/${tx.client_id}` : `/admin/transactions/${tx.id}`}
                      style={{
                        background: '#fff',
                        border: '1px solid rgba(11,18,48,0.10)',
                        borderRadius: 10,
                        padding: 14,
                        textDecoration: 'none',
                        color: '#0B1230',
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <strong style={{ fontSize: 14, fontWeight: 700 }}>
                          {tx.properties && (
                            <span title={`Imóvel em ${tx.properties.country_code}`} style={{ marginRight: 6 }}>
                              {countryFlag(tx.properties.country_code)}
                            </span>
                          )}
                          {tx.client_name}
                        </strong>
                        {isDone && (
                          <Badge bg={status.bg} fg={status.fg}>
                            {TX_STATUS_LABELS[tx.status]}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <Badge bg={thesis.bg} fg={thesis.fg}>
                          {THESIS_LABELS[tx.thesis]}
                        </Badge>
                      </div>
                      {tx.target_close_date && (
                        <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)' }}>
                          Data alvo: {formatDate(tx.target_close_date)}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
