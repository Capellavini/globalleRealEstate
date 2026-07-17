import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import { countryFlag } from '@/lib/portfolio/types'
import { TX_STATUS_LABELS, type Step, type Transaction } from '@/lib/admin/types'

export const dynamic = 'force-dynamic'

type Row = Transaction & {
  properties: { title: string; country_code: string } | null
  steps: Pick<Step, 'title' | 'status' | 'order_index'>[]
  transaction_documents: { id: string }[]
}

function statusText(tx: Row): string {
  if (tx.status !== 'active') return TX_STATUS_LABELS[tx.status]
  const next = [...tx.steps].sort((a, b) => a.order_index - b.order_index).find((s) => s.status !== 'done')
  return next ? next.title : 'Etapas concluídas'
}

// Lista das transações em que o usuário participa (RLS decide o que aparece).
export default async function TransacoesPage() {
  const { user } = await getSessionProfile()
  if (!user) redirect('/admin/login')

  const supabase = createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*, properties(title, country_code), steps(title, status, order_index), transaction_documents(id)')
    .order('created_at', { ascending: false })

  const transactions = (data ?? []) as unknown as Row[]

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Minhas transações</h1>

      {transactions.length === 0 && (
        <div
          style={{
            background: '#fff',
            border: '1px dashed rgba(11,18,48,0.15)',
            borderRadius: 12,
            padding: 48,
            textAlign: 'center',
            color: 'rgba(11,18,48,0.6)',
            fontSize: 14,
          }}
        >
          Você ainda não participa de nenhuma transação.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {transactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/transacoes/${tx.id}`}
            style={{
              background: '#fff',
              border: '1px solid rgba(11,18,48,0.10)',
              borderRadius: 12,
              padding: 20,
              textDecoration: 'none',
              color: '#0B1230',
              display: 'grid',
              gap: 8,
            }}
          >
            <strong style={{ fontSize: 16, fontWeight: 800 }}>
              {tx.properties ? (
                <>
                  {countryFlag(tx.properties.country_code)} {tx.properties.title}
                </>
              ) : (
                tx.client_name
              )}
            </strong>
            <span style={{ fontSize: 13, color: 'rgba(11,18,48,0.7)' }}>{statusText(tx)}</span>
            <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.5)' }}>
              {tx.transaction_documents.length} documento{tx.transaction_documents.length === 1 ? '' : 's'}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
