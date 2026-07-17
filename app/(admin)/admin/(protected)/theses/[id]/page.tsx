import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateThesis, toggleThesisActive, addCriterion, deleteCriterion } from '@/app/actions/theses'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import ThesisCascadeFields from '@/components/portfolio/ThesisCascadeFields'
import { isStructuredPropertyType, REGIONS_BY_COUNTRY } from '@/lib/thesis-options'
import { OBJECTIVE_LABELS, type Thesis, type ThesisObjective } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
      {label}
      {children}
    </label>
  )
}

export default async function ThesisDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [{ data: thesisData }, { data: criteria }] = await Promise.all([
    supabase.from('theses').select('*, profiles!theses_client_id_fkey(full_name)').eq('id', params.id).maybeSingle(),
    supabase.from('thesis_criteria').select('*').eq('thesis_id', params.id).order('sort_order'),
  ])
  if (!thesisData) notFound()
  const thesis = thesisData as Thesis & { profiles: { full_name: string } | null }

  // Valores antigos (Fase 1) → estado inicial da cascata.
  const knownRegions = Object.values(REGIONS_BY_COUNTRY).flat()
  const cities = thesis.target_cities ?? []
  const initialRegions = cities.filter((c) => knownRegions.includes(c))
  const initialOtherRegion = cities.filter((c) => !knownRegions.includes(c)).join(', ')
  const legacyTypes = (thesis.property_types ?? []).filter((t) => !isStructuredPropertyType(t))

  return (
    <div style={{ maxWidth: 760 }}>
      <Link href="/admin/theses" style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        ← Teses
      </Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, margin: '12px 0 20px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>
          {thesis.profiles?.full_name ?? '—'} <span style={{ color: 'rgba(11,18,48,0.5)', fontWeight: 400 }}>· {thesis.title}</span>
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href={`/admin/portfolios/${thesis.id}`} style={{ fontSize: 13, color: '#0E6FA3', fontWeight: 600, textDecoration: 'none' }}>
            Ver kanban →
          </Link>
          <form action={toggleThesisActive}>
            <input type="hidden" name="id" value={thesis.id} />
            <input type="hidden" name="active" value={thesis.is_active ? 'false' : 'true'} />
            <button
              type="submit"
              style={{ fontSize: 12.5, background: 'none', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(11,18,48,0.7)' }}
            >
              {thesis.is_active ? 'Desativar tese' : 'Reativar tese'}
            </button>
          </form>
        </div>
      </div>

      <form action={updateThesis} style={{ ...card, display: 'grid', gap: 14, marginBottom: 24 }}>
        <input type="hidden" name="id" value={thesis.id} />
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
            Tipos antigos desta tese ({legacyTypes.join(', ')}) não seguem o novo formato — remarque nas opções acima;
            ao salvar, valem só as seleções novas.
          </p>
        )}
        <Field label="Yield mínimo (%)">
          <input name="min_yield" type="number" step="any" defaultValue={thesis.min_yield ?? ''} style={inputStyle} />
        </Field>
        <Field label="Notas">
          <textarea name="notes" rows={3} defaultValue={thesis.notes ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
        </Field>
        <div>
          <button
            type="submit"
            style={{ padding: '11px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Salvar tese
          </button>
        </div>
      </form>

      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Critérios do fit</h2>
        <p style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.55)', marginBottom: 14 }}>
          Requisitos qualitativos além dos filtros — cada um vira uma linha avaliável (✓ / ~ / ✗) nos imóveis.
        </p>
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          {(criteria ?? []).map((criterion: any) => (
            <div key={criterion.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(11,18,48,0.07)', paddingBottom: 8 }}>
              <span style={{ fontSize: 13.5 }}>{criterion.label}</span>
              <form action={deleteCriterion}>
                <input type="hidden" name="id" value={criterion.id} />
                <input type="hidden" name="thesis_id" value={thesis.id} />
                <ConfirmSubmitButton message={`Excluir o critério "${criterion.label}"? As avaliações dele somem.`}>
                  Excluir
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
          {(criteria ?? []).length === 0 && <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>Nenhum critério ainda.</p>}
        </div>
        <form action={addCriterion} style={{ display: 'flex', gap: 8 }}>
          <input type="hidden" name="thesis_id" value={thesis.id} />
          <input type="text" name="label" required placeholder="Novo critério…" style={{ ...inputStyle, flex: 1 }} />
          <button
            type="submit"
            style={{ padding: '10px 16px', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, background: 'none', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  )
}
