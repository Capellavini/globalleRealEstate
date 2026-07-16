import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/admin/Badge'
import {
  formatDate,
  THESIS_COLORS,
  THESIS_LABELS,
  TX_STATUS_COLORS,
  TX_STATUS_LABELS,
  type Step,
  type Transaction,
} from '@/lib/admin/types'
import { countryFlag } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

type TransactionRow = Transaction & {
  property_id: string | null
  steps: Step[]
  properties: { country_code: string } | null
}

// Fase do processo = primeira etapa não concluída (1–4); tudo feito ou
// transação fechada/cancelada → coluna final.
const PHASE_COLUMNS = [
  { key: '1', label: '01 · Entender o perfil' },
  { key: '2', label: '02 · Definir a tese' },
  { key: '3', label: '03 · Curar os ativos' },
  { key: '4', label: '04 · Executar e acompanhar' },
  { key: 'done', label: 'Concluídas' },
] as const

function phaseOf(tx: TransactionRow): string {
  if (tx.status !== 'active') return 'done'
  const next = [...tx.steps].sort((a, b) => a.order_index - b.order_index).find((s) => s.status !== 'done')
  if (!next) return 'done'
  return String(Math.min(next.order_index, 4))
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, steps(*), properties(country_code)')
    .order('created_at', { ascending: false })

  const transactions = (data ?? []) as TransactionRow[]

  return (
    <>
      <style>{`
        .tx-cols { display: grid; grid-template-columns: repeat(5, minmax(210px, 1fr)); gap: 12px; align-items: start; }
        @media (max-width: 860px) { .tx-cols { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Transações</h1>
        <Link
          href="/admin/transactions/new"
          style={{
            background: '#070B24',
            color: '#fff',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + Nova transação
        </Link>
      </div>

      {error && (
        <p style={{ color: '#A03030', fontSize: 14 }}>Erro ao carregar transações: {error.message}</p>
      )}

      {!error && transactions.length === 0 && (
        <div
          style={{
            background: '#fff',
            border: '1px dashed rgba(11,18,48,0.15)',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            color: 'rgba(11,18,48,0.60)',
            fontSize: 14,
          }}
        >
          Nenhuma transação ainda. Crie a primeira com “Nova transação”.
        </div>
      )}

      {transactions.length > 0 && (
        <div className="tx-cols">
          {PHASE_COLUMNS.map((column) => {
            const cards = transactions.filter((tx) => phaseOf(tx) === column.key)
            return (
              <div
                key={column.key}
                style={{
                  background: column.key === 'done' ? 'rgba(43,160,90,0.05)' : 'rgba(11,18,48,0.03)',
                  border: '1px solid rgba(11,18,48,0.08)',
                  borderRadius: 12,
                  padding: 10,
                  display: 'grid',
                  gap: 10,
                  alignContent: 'start',
                  minHeight: 120,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(11,18,48,0.55)',
                    padding: '2px 4px',
                  }}
                >
                  {column.label} <span style={{ color: 'rgba(11,18,48,0.35)' }}>({cards.length})</span>
                </div>

                {cards.map((tx) => {
                  const thesis = THESIS_COLORS[tx.thesis]
                  const status = TX_STATUS_COLORS[tx.status]
                  return (
                    <Link
                      key={tx.id}
                      href={`/admin/transactions/${tx.id}`}
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
                        {column.key === 'done' && (
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
