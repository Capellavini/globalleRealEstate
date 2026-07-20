import { createClient } from '@/lib/supabase/server'
import { addCriterion, createThesis, deleteCriterion, toggleThesisActive, updateThesis } from '@/app/actions/theses'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import ThesisCascadeFields from '@/components/portfolio/ThesisCascadeFields'
import { isStructuredPropertyType, REGIONS_BY_COUNTRY } from '@/lib/thesis-options'
import { OBJECTIVE_LABELS, type Thesis, type ThesisObjective } from '@/lib/portfolio/types'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
      <span>
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'rgba(11,18,48,0.5)' }}> — {hint}</span>}
      </span>
      {children}
    </label>
  )
}

// Sem tese ativa = CTA da página (criar aqui mesmo). Com tese = edição inline
// + critérios do fit. Nunca uma página própria de tese.
export default async function ThesisSection({ clientId }: { clientId: string }) {
  const supabase = createClient()
  const { data: thesisData } = await supabase
    .from('theses')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!thesisData) {
    return (
      <div style={{ ...card, border: '1px dashed rgba(11,18,48,0.2)' }}>
        <h2
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(11,18,48,0.60)',
            marginBottom: 4,
          }}
        >
          Tese
        </h2>
        <p style={{ fontSize: 13.5, color: 'rgba(11,18,48,0.6)', marginBottom: 16 }}>
          Ainda sem tese de investimento. Defina-a para liberar as Opções deste cliente.
        </p>
        <form action={createThesis} style={{ display: 'grid', gap: 14 }}>
          <input type="hidden" name="client_id" value={clientId} />
          <Field label="Título">
            <input name="title" type="text" required placeholder="Apartamento para arrendar no Porto" style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Objetivo">
              <select name="objective" required defaultValue="" style={inputStyle}>
                <option value="" disabled>
                  selecione…
                </option>
                {(Object.keys(OBJECTIVE_LABELS) as ThesisObjective[]).map((o) => (
                  <option key={o} value={o}>
                    {OBJECTIVE_LABELS[o]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Moeda">
              <select name="budget_currency" defaultValue="EUR" style={inputStyle}>
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
              </select>
            </Field>
            <Field label="Orçamento mín.">
              <input name="budget_min" type="number" step="any" style={inputStyle} />
            </Field>
            <Field label="Orçamento máx.">
              <input name="budget_max" type="number" step="any" style={inputStyle} />
            </Field>
          </div>
          <ThesisCascadeFields />
          <Field label="Yield mínimo (%)" hint="relevante para renda">
            <input name="min_yield" type="number" step="any" style={inputStyle} />
          </Field>
          <Field label="Critérios qualitativos" hint="um por linha — viram as linhas do fit">
            <textarea
              name="criteria"
              rows={3}
              placeholder={'Máx. 15 min a pé do metro\nPrédio com elevador'}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Field>
          <Field label="Notas">
            <textarea name="notes" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <div>
            <button
              type="submit"
              style={{ padding: '11px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Criar tese
            </button>
          </div>
        </form>
      </div>
    )
  }

  const thesis = thesisData as Thesis
  const { data: criteria } = await supabase.from('thesis_criteria').select('*').eq('thesis_id', thesis.id).order('sort_order')

  const knownRegions = Object.values(REGIONS_BY_COUNTRY).flat()
  const cities = thesis.target_cities ?? []
  const initialRegions = cities.filter((c) => knownRegions.includes(c))
  const initialOtherRegion = cities.filter((c) => !knownRegions.includes(c)).join(', ')
  const legacyTypes = (thesis.property_types ?? []).filter((t) => !isStructuredPropertyType(t))

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <details style={card}>
        <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(11,18,48,0.60)',
                marginRight: 10,
              }}
            >
              Tese
            </span>
            <strong style={{ fontSize: 14.5 }}>{thesis.title}</strong>
          </span>
          <span style={{ fontSize: 12, color: '#0E6FA3', fontWeight: 600 }}>editar</span>
        </summary>

        <form action={updateThesis} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <input type="hidden" name="id" value={thesis.id} />
          <input type="hidden" name="client_id" value={clientId} />
          <Field label="Título">
            <input name="title" type="text" required defaultValue={thesis.title} style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Objetivo">
              <select name="objective" required defaultValue={thesis.objective} style={inputStyle}>
                {(Object.keys(OBJECTIVE_LABELS) as ThesisObjective[]).map((o) => (
                  <option key={o} value={o}>
                    {OBJECTIVE_LABELS[o]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Moeda">
              <select name="budget_currency" defaultValue={thesis.budget_currency} style={inputStyle}>
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
              </select>
            </Field>
            <Field label="Orçamento mín.">
              <input name="budget_min" type="number" step="any" defaultValue={thesis.budget_min ?? ''} style={inputStyle} />
            </Field>
            <Field label="Orçamento máx.">
              <input name="budget_max" type="number" step="any" defaultValue={thesis.budget_max ?? ''} style={inputStyle} />
            </Field>
          </div>
          <ThesisCascadeFields
            initialCountries={thesis.target_countries}
            initialRegions={initialRegions}
            initialOtherRegion={initialOtherRegion}
            initialTypes={thesis.property_types ?? []}
          />
          {legacyTypes.length > 0 && (
            <p style={{ fontSize: 12, color: '#8A5B00', margin: 0 }}>
              Tipos antigos ({legacyTypes.join(', ')}) não seguem o novo formato — remarque acima; ao salvar, valem só
              as seleções novas.
            </p>
          )}
          <Field label="Yield mínimo (%)">
            <input name="min_yield" type="number" step="any" defaultValue={thesis.min_yield ?? ''} style={inputStyle} />
          </Field>
          <Field label="Notas">
            <textarea name="notes" rows={2} defaultValue={thesis.notes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="submit"
              style={{ padding: '10px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Salvar tese
            </button>
            <form action={toggleThesisActive}>
              <input type="hidden" name="id" value={thesis.id} />
              <input type="hidden" name="client_id" value={clientId} />
              <input type="hidden" name="active" value="false" />
              <button
                type="submit"
                style={{ fontSize: 12.5, background: 'none', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 6, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(11,18,48,0.7)' }}
              >
                Desativar tese
              </button>
            </form>
          </div>
        </form>

        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Critérios do fit</h3>
          <p style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)', marginBottom: 10 }}>
            Requisitos qualitativos além dos filtros — viram linhas avaliáveis (✓ / ~ / ✗) nos imóveis.
          </p>
          <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
            {(criteria ?? []).map((criterion: any) => (
              <div key={criterion.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(11,18,48,0.07)', paddingBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{criterion.label}</span>
                <form action={deleteCriterion}>
                  <input type="hidden" name="id" value={criterion.id} />
                  <input type="hidden" name="client_id" value={clientId} />
                  <ConfirmSubmitButton message={`Excluir o critério "${criterion.label}"?`}>Excluir</ConfirmSubmitButton>
                </form>
              </div>
            ))}
            {(criteria ?? []).length === 0 && <p style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.5)' }}>Nenhum critério ainda.</p>}
          </div>
          <form action={addCriterion} style={{ display: 'flex', gap: 8 }}>
            <input type="hidden" name="thesis_id" value={thesis.id} />
            <input type="hidden" name="client_id" value={clientId} />
            <input type="text" name="label" required placeholder="Novo critério…" style={{ ...inputStyle, flex: 1 }} />
            <button
              type="submit"
              style={{ padding: '9px 14px', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, background: 'none', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Adicionar
            </button>
          </form>
        </div>
      </details>
    </div>
  )
}
