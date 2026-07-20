import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/admin/Badge'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import { deleteTransaction, updateTransactionNotes, updateTransactionStatus } from '@/app/actions/transactions'
import ParticipantsSection from '@/components/transactions/ParticipantsSection'
import DocumentsSection from '@/components/transactions/DocumentsSection'
import CommentsSection from '@/components/transactions/CommentsSection'
import ProcessTimeline from '@/components/transactions/ProcessTimeline'
import RevenueSection from '@/components/transactions/RevenueSection'
import { THESIS_COLORS, THESIS_LABELS, TX_STATUS_LABELS, type Transaction, type TransactionStatus } from '@/lib/admin/types'
import { countryFlag } from '@/lib/portfolio/types'

import { cardStyle as card } from '@/lib/ui/style'

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

const smallBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  color: '#0B1230',
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(11,18,48,0.60)',
  marginBottom: 14,
}

type TxRow = Transaction & { properties: { title: string; country_code: string } | null }

// 1 transação ativa por cliente (v1): mostra a ativa embutida por inteiro;
// transações passadas (fechadas/canceladas) ficam como links de histórico.
export default async function TransactionSection({
  clientId,
  basePath,
  costFilter,
  docCategory,
}: {
  clientId: string
  basePath: string
  costFilter?: string
  docCategory?: string
}) {
  const supabase = createClient()
  const { data: txData } = await supabase
    .from('transactions')
    .select('*, properties(title, country_code)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  const transactions = (txData ?? []) as unknown as TxRow[]
  const active = transactions.find((t) => t.status === 'active')
  const past = transactions.filter((t) => t.id !== active?.id)

  if (!active) {
    return (
      <div>
        <h2 style={sectionTitle}>Transação</h2>
        <div style={{ ...card, border: '1px dashed rgba(11,18,48,0.2)', textAlign: 'center', color: 'rgba(11,18,48,0.55)', fontSize: 13.5 }}>
          Nenhuma transação ativa — nasce ao clicar “Avançar” num imóvel nas Opções.
        </div>
        {past.length > 0 && (
          <div style={{ marginTop: 12, display: 'grid', gap: 6 }}>
            {past.map((tx) => (
              <Link key={tx.id} href={`/admin/transactions/${tx.id}`} style={{ fontSize: 12.5, color: '#0E6FA3', textDecoration: 'none' }}>
                {tx.properties?.title ?? tx.client_name} — {TX_STATUS_LABELS[tx.status]} →
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const thesisColors = THESIS_COLORS[active.thesis]

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h2 style={sectionTitle}>Transação</h2>
        <div style={{ ...card, display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 17, fontWeight: 800 }}>
                {active.properties && <>{countryFlag(active.properties.country_code)} </>}
                {active.properties?.title ?? active.client_name}
              </strong>
              <Badge bg={thesisColors.bg} fg={thesisColors.fg}>
                {THESIS_LABELS[active.thesis]}
              </Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {(Object.keys(TX_STATUS_LABELS) as TransactionStatus[]).map((status) => (
                <form key={status} action={updateTransactionStatus}>
                  <input type="hidden" name="id" value={active.id} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    type="submit"
                    style={{
                      ...smallBtn,
                      ...(active.status === status ? { background: '#070B24', color: '#fff', border: '1px solid #070B24' } : {}),
                    }}
                  >
                    {TX_STATUS_LABELS[status]}
                  </button>
                </form>
              ))}
            </div>
          </div>

          <form action={updateTransactionNotes} style={{ display: 'grid', gap: 8 }}>
            <input type="hidden" name="id" value={active.id} />
            <textarea
              name="notes"
              defaultValue={active.notes ?? ''}
              rows={3}
              placeholder="Notas gerais da transação…"
              style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
            />
            <div>
              <button type="submit" style={smallBtn}>
                Salvar notas
              </button>
            </div>
          </form>

          <form action={deleteTransaction} style={{ textAlign: 'right' }}>
            <input type="hidden" name="id" value={active.id} />
            <ConfirmSubmitButton message={`Excluir esta transação? Etapas e documentos serão excluídos junto.`}>
              Excluir transação
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <ProcessTimeline transactionId={active.id} basePath={basePath} costFilter={costFilter} />
      <RevenueSection transactionId={active.id} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
        <DocumentsSection transactionId={active.id} canManage basePath={basePath} filterCategory={docCategory} />
        <div style={{ display: 'grid', gap: 24 }}>
          <ParticipantsSection transactionId={active.id} canManage />
          <CommentsSection transactionId={active.id} basePath={basePath} />
        </div>
      </div>

      {past.length > 0 && (
        <div>
          <h3 style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(11,18,48,0.5)', marginBottom: 6 }}>Transações anteriores</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            {past.map((tx) => (
              <Link key={tx.id} href={`/admin/transactions/${tx.id}`} style={{ fontSize: 12.5, color: '#0E6FA3', textDecoration: 'none' }}>
                {tx.properties?.title ?? tx.client_name} — {TX_STATUS_LABELS[tx.status]} →
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
