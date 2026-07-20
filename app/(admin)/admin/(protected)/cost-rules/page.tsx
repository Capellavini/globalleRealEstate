import { createClient } from '@/lib/supabase/server'
import { createCostRule, updateCostRule, deleteCostRule } from '@/app/actions/cost-rules'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import type { CostRule } from '@/lib/costs/engine'
import { COUNTRY_NAMES, countryFlag, OBJECTIVE_LABELS } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

import { cardStyle as card } from '@/lib/ui/style'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 13,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 600, color: 'rgba(11,18,48,0.7)' }}>
      {label}
      {children}
    </label>
  )
}

function RuleFields({ rule }: { rule?: CostRule }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
      <Field label="País (ISO)">
        <input name="country_code" required defaultValue={rule?.country_code ?? ''} placeholder="PT" style={inputStyle} />
      </Field>
      <Field label="Município (vazio = nacional)">
        <input name="municipality" defaultValue={rule?.municipality ?? ''} placeholder="São Paulo" style={inputStyle} />
      </Field>
      <Field label="Rótulo do custo">
        <input name="cost_label" required defaultValue={rule?.cost_label ?? ''} placeholder="IMT, ITBI…" style={inputStyle} />
      </Field>
      <Field label="Tipo de cálculo">
        <select name="calc_type" required defaultValue={rule?.calc_type ?? ''} style={inputStyle}>
          <option value="" disabled>
            selecione…
          </option>
          <option value="flat">flat (valor fixo)</option>
          <option value="percent">percent (% do preço)</option>
          <option value="brackets">brackets (escalões)</option>
        </select>
      </Field>
      <Field label="Valor fixo (flat)">
        <input name="flat_amount" type="number" step="any" defaultValue={rule?.flat_amount ?? ''} style={inputStyle} />
      </Field>
      <Field label="Taxa (percent, ex.: 0.008)">
        <input name="percent_rate" type="number" step="any" defaultValue={rule?.percent_rate ?? ''} style={inputStyle} />
      </Field>
      <Field label="Objetivo (vazio = todos)">
        <select name="applies_to_objective" defaultValue={rule?.applies_to_objective ?? ''} style={inputStyle}>
          <option value="">todos</option>
          {Object.entries(OBJECTIVE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Moeda">
        <input name="currency" required defaultValue={rule?.currency ?? ''} placeholder="EUR" style={inputStyle} />
      </Field>
      <Field label="Vigente desde">
        <input name="valid_from" type="date" required defaultValue={rule?.valid_from ?? ''} style={inputStyle} />
      </Field>
      <Field label="Vigente até (vazio = aberto)">
        <input name="valid_to" type="date" defaultValue={rule?.valid_to ?? ''} style={inputStyle} />
      </Field>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label='Escalões (JSON, para brackets) — [{"up_to": 100000, "marginal_rate": 0.02, "deduction": 0}]; up_to null = sem teto'>
          <textarea
            name="brackets"
            rows={3}
            defaultValue={rule?.brackets ? JSON.stringify(rule.brackets, null, 1) : ''}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Space Mono', monospace", fontSize: 12 }}
          />
        </Field>
      </div>
    </div>
  )
}

export default async function CostRulesPage() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cost_rules')
    .select('*')
    .order('country_code')
    .order('cost_label')
    .order('valid_from', { ascending: false })

  const rules = (data ?? []) as CostRule[]
  const countries = [...new Set(rules.map((r) => r.country_code))]
  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Regras de custo por país</h1>
      <p style={{ fontSize: 13.5, color: 'rgba(11,18,48,0.6)', marginBottom: 20, maxWidth: 640 }}>
        O motor de custos usa estas regras (vigentes na data) para estimar o custo total de aquisição. Regra municipal
        sobrepõe a nacional; regra com objetivo específico sobrepõe a genérica. Atualizou o ITBI? Edite aqui — nada é
        hardcoded.
      </p>
      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro: {error.message} — a migration + seed já rodaram?</p>}

      <details style={{ ...card, marginBottom: 24 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+ Nova regra</summary>
        <form action={createCostRule} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <RuleFields />
          <div>
            <button
              type="submit"
              style={{ padding: '10px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Criar regra
            </button>
          </div>
        </form>
      </details>

      {countries.map((country) => (
        <section key={country} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
            {countryFlag(country)} {COUNTRY_NAMES[country] ?? country}
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {rules
              .filter((r) => r.country_code === country)
              .map((rule) => {
                const expired = rule.valid_to !== null && rule.valid_to < today
                return (
                  <details key={rule.id} style={{ ...card, padding: '14px 20px', opacity: expired ? 0.55 : 1 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 13.5, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <strong>{rule.cost_label}</strong>
                      {rule.municipality && (
                        <span style={{ fontSize: 11.5, background: 'rgba(30,167,232,0.14)', color: '#0E6FA3', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>
                          {rule.municipality}
                        </span>
                      )}
                      {rule.applies_to_objective && (
                        <span style={{ fontSize: 11.5, background: 'rgba(11,18,48,0.07)', borderRadius: 999, padding: '2px 8px' }}>
                          {OBJECTIVE_LABELS[rule.applies_to_objective as keyof typeof OBJECTIVE_LABELS] ?? rule.applies_to_objective}
                        </span>
                      )}
                      <span style={{ color: 'rgba(11,18,48,0.55)', fontSize: 12.5 }}>
                        {rule.calc_type === 'percent' && `${((rule.percent_rate ?? 0) * 100).toFixed(2).replace('.', ',')}%`}
                        {rule.calc_type === 'flat' && `${rule.currency} ${rule.flat_amount}`}
                        {rule.calc_type === 'brackets' && `${(rule.brackets ?? []).length} escalões`}
                        {' · desde '}
                        {rule.valid_from}
                        {expired && ' · EXPIRADA'}
                      </span>
                    </summary>
                    <form action={updateCostRule} style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                      <input type="hidden" name="id" value={rule.id} />
                      <RuleFields rule={rule} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                          type="submit"
                          style={{ padding: '9px 16px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          Salvar regra
                        </button>
                      </div>
                    </form>
                    <form action={deleteCostRule} style={{ textAlign: 'right', marginTop: 8 }}>
                      <input type="hidden" name="id" value={rule.id} />
                      <ConfirmSubmitButton message={`Excluir a regra "${rule.cost_label}"? Prefira encerrar a vigência (vigente até).`}>
                        Excluir
                      </ConfirmSubmitButton>
                    </form>
                  </details>
                )
              })}
          </div>
        </section>
      ))}
    </>
  )
}
