import type { Step, Transaction } from '@/lib/admin/types'
import { TX_STATUS_LABELS } from '@/lib/admin/types'

// Bloco 5 — status PROVISÓRIO do portal. Único ponto do portal que lê o modelo
// de etapas atual. Sem timeline, sem barra de progresso: será substituído pela
// timeline real quando a Parte D (templates por país + custo por etapa) chegar.
export default function TransactionStatus({
  transaction,
  steps,
}: {
  transaction: Pick<Transaction, 'status' | 'updated_at'>
  steps: Pick<Step, 'title' | 'status' | 'order_index'>[]
}) {
  const next = [...steps].sort((a, b) => a.order_index - b.order_index).find((s) => s.status !== 'done')
  const label =
    transaction.status !== 'active'
      ? TX_STATUS_LABELS[transaction.status]
      : next
        ? next.status === 'in_progress'
          ? `Em andamento: ${next.title}`
          : `Próxima etapa: ${next.title}`
        : 'Todas as etapas concluídas'

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(11,18,48,0.10)',
        borderRadius: 12,
        padding: 20,
        display: 'grid',
        gap: 6,
      }}
    >
      <h2
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(11,18,48,0.60)',
        }}
      >
        Status
      </h2>
      <strong style={{ fontSize: 17, fontWeight: 800 }}>{label}</strong>
      <span style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.55)' }}>
        Última atualização: {new Date(transaction.updated_at).toLocaleDateString('pt-BR')}
      </span>
    </div>
  )
}
