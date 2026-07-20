import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import {
  addStepCost,
  cycleCostStatus,
  deleteStepCost,
  setProcessStepStatus,
  updateProcessStepDetails,
} from '@/app/actions/process-steps'
import {
  COST_STATUS_LABELS,
  formatAmount,
  NEXT_COST_STATUS,
  PAID_BY_LABELS,
  PROCESS_STATUS_COLORS,
  PROCESS_STATUS_LABELS,
  sumByCurrency,
  type ProcessStep,
  type ProcessStepStatus,
  type TransactionCost,
} from '@/lib/transactions/types'

// Item 3 da Parte D — timeline editável da equipe: status, datas, notas
// internas e custos DENTRO de cada etapa. Substitui a UI das etapas antigas.

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

const inputStyle: React.CSSProperties = {
  padding: '6px 9px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  fontSize: 12.5,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

const smallBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  color: '#0B1230',
  padding: '5px 10px',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const STATUS_ICON: Record<ProcessStepStatus, string> = {
  concluida: '✓',
  em_andamento: '●',
  pendente: '○',
  nao_se_aplica: '—',
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export default async function ProcessTimeline({
  transactionId,
  basePath,
  costFilter,
}: {
  transactionId: string
  basePath: string
  costFilter?: string // estimado | confirmado | pago
}) {
  const supabase = createClient()
  const [{ data: stepsData }, { data: costsData }] = await Promise.all([
    supabase.from('transaction_steps').select('*').eq('transaction_id', transactionId).order('sort_order'),
    supabase.from('transaction_costs_v2').select('*').eq('transaction_id', transactionId).order('created_at'),
  ])

  const steps = (stepsData ?? []) as ProcessStep[]
  const allCosts = (costsData ?? []) as TransactionCost[]
  const costs = costFilter ? allCosts.filter((c) => c.status === costFilter) : allCosts

  if (steps.length === 0) {
    return (
      <div style={card}>
        <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>
          Sem etapas de processo — a migration-parte-d.sql já rodou? Transações novas ganham as etapas do país
          automaticamente.
        </p>
      </div>
    )
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(11,18,48,0.60)',
          }}
        >
          Processo e custos
        </h2>
        <div style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'baseline' }}>
          <span style={{ color: 'rgba(11,18,48,0.45)' }}>custos:</span>
          <Link href={basePath} style={{ textDecoration: 'none', color: !costFilter ? '#0E6FA3' : 'rgba(11,18,48,0.55)', fontWeight: !costFilter ? 700 : 400 }}>
            todos
          </Link>
          {(Object.keys(COST_STATUS_LABELS) as (keyof typeof COST_STATUS_LABELS)[]).map((status) => (
            <Link
              key={status}
              href={`${basePath}?custos=${status}`}
              style={{ textDecoration: 'none', color: costFilter === status ? '#0E6FA3' : 'rgba(11,18,48,0.55)', fontWeight: costFilter === status ? 700 : 400 }}
            >
              {COST_STATUS_LABELS[status]}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 0 }}>
        {steps.map((step, index) => {
          const colors = PROCESS_STATUS_COLORS[step.status]
          const stepCosts = costs.filter((c) => c.step_id === step.id)
          const na = step.status === 'nao_se_aplica'
          return (
            <div
              key={step.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '26px 1fr',
                gap: 12,
                opacity: na ? 0.55 : 1,
              }}
            >
              {/* trilho vertical */}
              <div style={{ display: 'grid', justifyItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: colors.fg, lineHeight: '22px' }}>
                  {STATUS_ICON[step.status]}
                </span>
                {index < steps.length - 1 && (
                  <span style={{ width: 1, flex: 1, minHeight: 18, background: 'rgba(11,18,48,0.12)' }} />
                )}
              </div>

              <div style={{ paddingBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14.5, textDecoration: na ? 'line-through' : 'none' }}>
                    {String(step.sort_order).padStart(2, '0')} · {step.name}
                  </strong>
                  <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '2px 10px', background: colors.bg, color: colors.fg }}>
                    {PROCESS_STATUS_LABELS[step.status]}
                  </span>
                  {(step.started_at || step.completed_at) && (
                    <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.5)' }}>
                      {fmtDate(step.started_at)}
                      {step.completed_at ? ` → ${fmtDate(step.completed_at)}` : ''}
                    </span>
                  )}
                </div>

                {/* mudar status */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {(['pendente', 'em_andamento', 'concluida', 'nao_se_aplica'] as ProcessStepStatus[])
                    .filter((status) => status !== step.status)
                    .map((status) => (
                      <form key={status} action={setProcessStepStatus}>
                        <input type="hidden" name="id" value={step.id} />
                        <input type="hidden" name="status" value={status} />
                        <button type="submit" style={{ ...smallBtn, fontSize: 11.5, padding: '4px 9px' }}>
                          {PROCESS_STATUS_LABELS[status]}
                        </button>
                      </form>
                    ))}
                </div>

                {/* datas + notas internas */}
                <details style={{ marginTop: 8 }}>
                  <summary style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)', cursor: 'pointer' }}>
                    Datas e notas internas{step.notes ? ' *' : ''}
                  </summary>
                  <form action={updateProcessStepDetails} style={{ display: 'grid', gap: 8, marginTop: 8, maxWidth: 460 }}>
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="transaction_id" value={transactionId} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <label style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.6)', display: 'grid', gap: 3 }}>
                        início
                        <input type="date" name="started_at" defaultValue={step.started_at ?? ''} style={inputStyle} />
                      </label>
                      <label style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.6)', display: 'grid', gap: 3 }}>
                        conclusão
                        <input type="date" name="completed_at" defaultValue={step.completed_at ?? ''} style={inputStyle} />
                      </label>
                    </div>
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={step.notes ?? ''}
                      placeholder="Notas internas da equipe (o cliente nunca vê)…"
                      style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
                    />
                    <div>
                      <button type="submit" style={smallBtn}>
                        Salvar
                      </button>
                    </div>
                  </form>
                </details>

                {/* custos da etapa */}
                <div style={{ marginTop: 10, background: 'rgba(11,18,48,0.03)', borderRadius: 10, padding: '10px 12px' }}>
                  {stepCosts.length > 0 && (
                    <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
                      {stepCosts.map((cost) => (
                        <div key={cost.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5 }}>
                          <span>
                            <strong>{cost.label}</strong>
                            <span style={{ color: 'rgba(11,18,48,0.55)' }}> · {PAID_BY_LABELS[cost.paid_by]}</span>
                            {cost.paid_at && <span style={{ color: 'rgba(11,18,48,0.5)' }}> · pago {fmtDate(cost.paid_at)}</span>}
                          </span>
                          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <strong>{formatAmount(Number(cost.amount), cost.currency)}</strong>
                            <form action={cycleCostStatus}>
                              <input type="hidden" name="id" value={cost.id} />
                              <input type="hidden" name="transaction_id" value={transactionId} />
                              <input type="hidden" name="next" value={NEXT_COST_STATUS[cost.status]} />
                              <button
                                type="submit"
                                title="Clique para avançar o status"
                                style={{
                                  ...smallBtn,
                                  fontSize: 11,
                                  padding: '2px 9px',
                                  borderRadius: 999,
                                  background:
                                    cost.status === 'pago' ? 'rgba(43,160,90,0.16)' : cost.status === 'confirmado' ? 'rgba(30,167,232,0.16)' : 'rgba(11,18,48,0.07)',
                                  color: cost.status === 'pago' ? '#1E7A44' : cost.status === 'confirmado' ? '#0E6FA3' : 'rgba(11,18,48,0.6)',
                                  border: 'none',
                                }}
                              >
                                {COST_STATUS_LABELS[cost.status]}
                              </button>
                            </form>
                            <form action={deleteStepCost}>
                              <input type="hidden" name="id" value={cost.id} />
                              <input type="hidden" name="transaction_id" value={transactionId} />
                              <ConfirmSubmitButton message={`Excluir o custo "${cost.label}"?`} style={{ padding: '2px 8px', fontSize: 11 }}>
                                ×
                              </ConfirmSubmitButton>
                            </form>
                          </span>
                        </div>
                      ))}
                      <div style={{ fontSize: 12, color: 'rgba(11,18,48,0.6)', textAlign: 'right' }}>
                        subtotal: <strong>{sumByCurrency(stepCosts)}</strong>
                      </div>
                    </div>
                  )}
                  <form action={addStepCost} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="hidden" name="transaction_id" value={transactionId} />
                    <input type="hidden" name="step_id" value={step.id} />
                    <input name="label" type="text" required placeholder="+ custo (IMT, sinal, certidões…)" style={{ ...inputStyle, flex: 1, minWidth: 150 }} />
                    <input name="amount" type="number" step="any" required placeholder="valor" style={{ ...inputStyle, width: 90 }} />
                    <select name="currency" defaultValue="EUR" style={inputStyle}>
                      <option value="EUR">EUR</option>
                      <option value="BRL">BRL</option>
                      <option value="USD">USD</option>
                    </select>
                    <select name="paid_by" defaultValue="cliente_direto" style={inputStyle}>
                      <option value="cliente_direto">Cliente direto</option>
                      <option value="via_globalle">Via Globalle</option>
                    </select>
                    <button type="submit" style={smallBtn}>
                      Lançar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ borderTop: '1px solid rgba(11,18,48,0.08)', paddingTop: 10, marginTop: 4, textAlign: 'right', fontSize: 13.5 }}>
        Total de custos{costFilter ? ` (${COST_STATUS_LABELS[costFilter as keyof typeof COST_STATUS_LABELS]})` : ''}:{' '}
        <strong>{costs.length ? sumByCurrency(costs) : '—'}</strong>
      </div>
    </div>
  )
}
