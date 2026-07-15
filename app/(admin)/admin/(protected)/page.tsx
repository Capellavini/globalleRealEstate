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

export const dynamic = 'force-dynamic'

type TransactionWithSteps = Transaction & { steps: Step[] }

function nextPendingStep(steps: Step[]): Step | null {
  return (
    [...steps]
      .sort((a, b) => a.order_index - b.order_index)
      .find((s) => s.status !== 'done') ?? null
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*, steps(*)')
    .order('target_close_date', { ascending: true, nullsFirst: false })

  const transactions = (data ?? []) as TransactionWithSteps[]

  return (
    <>
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
        <p style={{ color: '#A03030', fontSize: 14 }}>
          Erro ao carregar transações: {error.message}
        </p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {transactions.map((tx) => {
          const next = nextPendingStep(tx.steps)
          const thesis = THESIS_COLORS[tx.thesis]
          const status = TX_STATUS_COLORS[tx.status]
          return (
            <Link
              key={tx.id}
              href={`/admin/transactions/${tx.id}`}
              style={{
                background: '#fff',
                border: '1px solid rgba(11,18,48,0.10)',
                borderRadius: 12,
                padding: 20,
                textDecoration: 'none',
                color: '#0B1230',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: 17, fontWeight: 700 }}>{tx.client_name}</strong>
                <Badge bg={status.bg} fg={status.fg}>
                  {TX_STATUS_LABELS[tx.status]}
                </Badge>
              </div>

              <div>
                <Badge bg={thesis.bg} fg={thesis.fg}>
                  {THESIS_LABELS[tx.thesis]}
                </Badge>
              </div>

              <div style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', display: 'grid', gap: 4 }}>
                <span>
                  Próxima etapa:{' '}
                  <strong style={{ color: '#0B1230', fontWeight: 600 }}>
                    {next ? next.title : 'Todas concluídas'}
                  </strong>
                </span>
                <span>
                  Data alvo:{' '}
                  <strong style={{ color: '#0B1230', fontWeight: 600 }}>
                    {formatDate(tx.target_close_date)}
                  </strong>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
