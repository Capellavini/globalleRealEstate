import { createClient } from '@/lib/supabase/server'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import { addRevenue, cycleRevenueStatus, deleteRevenue } from '@/app/actions/process-steps'
import {
  formatAmount,
  NEXT_REVENUE_STATUS,
  REVENUE_STATUS_LABELS,
  sumByCurrency,
  type ProcessStep,
  type TransactionRevenue,
} from '@/lib/transactions/types'

// Receita Globalle — INTERNA (RLS team-only). Nunca renderizada no portal.

import { cardStyle } from '@/lib/ui/style'

const card: React.CSSProperties = { ...cardStyle, border: '1px solid rgba(232,184,109,0.5)' }

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

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export default async function RevenueSection({ transactionId }: { transactionId: string }) {
  const supabase = createClient()
  const [{ data: revenuesData }, { data: stepsData }] = await Promise.all([
    supabase.from('transaction_revenues').select('*').eq('transaction_id', transactionId).order('created_at'),
    supabase.from('transaction_steps').select('id, name, sort_order').eq('transaction_id', transactionId).order('sort_order'),
  ])
  const revenues = (revenuesData ?? []) as TransactionRevenue[]
  const steps = (stepsData ?? []) as Pick<ProcessStep, 'id' | 'name' | 'sort_order'>[]
  const stepName = new Map(steps.map((s) => [s.id, s.name]))
  const pending = revenues.filter((r) => r.status !== 'recebido')

  return (
    <div style={card}>
      <h2
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#8A6320',
          marginBottom: 4,
        }}
      >
        Receita Globalle
      </h2>
      <p style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)', marginBottom: 12 }}>
        Interno — invisível para cliente e advogado (RLS team-only).
      </p>

      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {revenues.length === 0 && <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>Nenhum lançamento ainda.</p>}
        {revenues.map((revenue) => (
          <div key={revenue.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, borderBottom: '1px solid rgba(11,18,48,0.06)', paddingBottom: 6 }}>
            <span>
              <strong>{revenue.label}</strong>
              {revenue.step_id && <span style={{ color: 'rgba(11,18,48,0.55)' }}> · {stepName.get(revenue.step_id) ?? 'etapa'}</span>}
              {revenue.expected_at && revenue.status !== 'recebido' && (
                <span style={{ color: 'rgba(11,18,48,0.5)' }}> · previsto {fmtDate(revenue.expected_at)}</span>
              )}
              {revenue.received_at && <span style={{ color: '#1E7A44' }}> · recebido {fmtDate(revenue.received_at)}</span>}
            </span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <strong>{formatAmount(Number(revenue.amount), revenue.currency)}</strong>
              <form action={cycleRevenueStatus}>
                <input type="hidden" name="id" value={revenue.id} />
                <input type="hidden" name="transaction_id" value={transactionId} />
                <input type="hidden" name="next" value={NEXT_REVENUE_STATUS[revenue.status]} />
                <button
                  type="submit"
                  title="Clique para avançar o status"
                  style={{
                    ...smallBtn,
                    fontSize: 11,
                    padding: '2px 9px',
                    borderRadius: 999,
                    border: 'none',
                    background:
                      revenue.status === 'recebido' ? 'rgba(43,160,90,0.16)' : revenue.status === 'faturado' ? 'rgba(30,167,232,0.16)' : 'rgba(232,184,109,0.25)',
                    color: revenue.status === 'recebido' ? '#1E7A44' : revenue.status === 'faturado' ? '#0E6FA3' : '#8A6320',
                  }}
                >
                  {REVENUE_STATUS_LABELS[revenue.status]}
                </button>
              </form>
              <form action={deleteRevenue}>
                <input type="hidden" name="id" value={revenue.id} />
                <input type="hidden" name="transaction_id" value={transactionId} />
                <ConfirmSubmitButton message={`Excluir a receita "${revenue.label}"?`} style={{ padding: '2px 8px', fontSize: 11 }}>
                  ×
                </ConfirmSubmitButton>
              </form>
            </span>
          </div>
        ))}
        {revenues.length > 0 && (
          <div style={{ fontSize: 12.5, textAlign: 'right', color: 'rgba(11,18,48,0.65)' }}>
            a receber: <strong>{pending.length ? sumByCurrency(pending) : '—'}</strong> · total:{' '}
            <strong>{sumByCurrency(revenues)}</strong>
          </div>
        )}
      </div>

      <form action={addRevenue} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="hidden" name="transaction_id" value={transactionId} />
        <input name="label" type="text" required placeholder="+ receita (honorários, comissão…)" style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
        <input name="amount" type="number" step="any" required placeholder="valor" style={{ ...inputStyle, width: 90 }} />
        <select name="currency" defaultValue="EUR" style={inputStyle}>
          <option value="EUR">EUR</option>
          <option value="BRL">BRL</option>
          <option value="USD">USD</option>
        </select>
        <select name="step_id" defaultValue="" style={inputStyle}>
          <option value="">sem etapa</option>
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.name}
            </option>
          ))}
        </select>
        <input name="expected_at" type="date" style={inputStyle} title="Data prevista" />
        <button type="submit" style={smallBtn}>
          Lançar
        </button>
      </form>
    </div>
  )
}
