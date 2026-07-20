import { createClient } from '@/lib/supabase/server'
import { PROCESS_STATUS_COLORS, type ProcessStepStatus } from '@/lib/transactions/types'

// Item 5 da Parte D — timeline do cliente/advogado. Lê SOMENTE a view
// transaction_steps_public (sem notes; custos e receitas nem existem para o
// papel do participante — RLS). "Não se aplica" não aparece.

type PublicStep = {
  id: string
  transaction_id: string
  name: string
  sort_order: number
  status: ProcessStepStatus
  started_at: string | null
  completed_at: string | null
  description: string | null
}

const STATUS_ICON: Record<string, string> = {
  concluida: '✓',
  em_andamento: '●',
  pendente: '○',
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export default async function ClientTimeline({ transactionId }: { transactionId: string }) {
  const supabase = createClient()
  const { data } = await supabase
    .from('transaction_steps_public')
    .select('*')
    .eq('transaction_id', transactionId)
    .order('sort_order')

  const steps = ((data ?? []) as PublicStep[]).filter((s) => s.status !== 'nao_se_aplica')
  const done = steps.filter((s) => s.status === 'concluida').length
  const current = steps.find((s) => s.status === 'em_andamento') ?? steps.find((s) => s.status === 'pendente')
  const progress = steps.length ? Math.round((done / steps.length) * 100) : 0

  if (steps.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 20 }}>
        <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>As etapas do processo aparecerão aqui em breve.</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <h2
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(11,18,48,0.60)',
          }}
        >
          Etapas do processo
        </h2>
        <span style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)' }}>
          {current ? `etapa ${steps.indexOf(current) + 1} de ${steps.length}` : `${steps.length} de ${steps.length} concluídas`}
        </span>
      </div>

      {/* barra de progresso */}
      <div style={{ height: 6, background: 'rgba(11,18,48,0.07)', borderRadius: 999, marginBottom: 18 }}>
        <div style={{ height: 6, width: `${progress}%`, background: '#1EA7E8', borderRadius: 999, transition: 'width .3s' }} />
      </div>

      <div style={{ display: 'grid' }}>
        {steps.map((step, index) => {
          const colors = PROCESS_STATUS_COLORS[step.status]
          const isCurrent = step.status === 'em_andamento'
          return (
            <div key={step.id} style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: 12 }}>
              <div style={{ display: 'grid', justifyItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: colors.fg, lineHeight: '22px' }}>
                  {STATUS_ICON[step.status] ?? '○'}
                </span>
                {index < steps.length - 1 && (
                  <span style={{ width: 1, flex: 1, minHeight: 14, background: 'rgba(11,18,48,0.12)' }} />
                )}
              </div>
              <div style={{ paddingBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14, color: isCurrent ? '#0E6FA3' : step.status === 'pendente' ? 'rgba(11,18,48,0.55)' : '#0B1230' }}>
                    {step.name}
                  </strong>
                  {(step.started_at || step.completed_at) && (
                    <span style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)' }}>
                      {fmtDate(step.started_at)}
                      {step.completed_at ? ` → ${fmtDate(step.completed_at)}` : ''}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)', marginTop: 2 }}>{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
