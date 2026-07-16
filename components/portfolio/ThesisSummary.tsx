import {
  countryFlag,
  formatMoney,
  OBJECTIVE_LABELS,
  type Thesis,
} from '@/lib/portfolio/types'

// Resumo da tese — contexto permanente no topo do kanban.
export default function ThesisSummary({ thesis, clientName }: { thesis: Thesis; clientName?: string }) {
  const budget =
    thesis.budget_min || thesis.budget_max
      ? `${formatMoney(thesis.budget_min, thesis.budget_currency)} – ${formatMoney(thesis.budget_max, thesis.budget_currency)}`
      : 'Sem orçamento definido'

  const chip: React.CSSProperties = {
    background: 'rgba(11,18,48,0.06)',
    borderRadius: 999,
    padding: '4px 12px',
    fontSize: 12.5,
    whiteSpace: 'nowrap',
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(11,18,48,0.10)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 19, fontWeight: 800 }}>{thesis.title}</h1>
        {clientName && <span style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>· {clientName}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ ...chip, background: 'rgba(30,167,232,0.14)', color: '#0E6FA3', fontWeight: 700 }}>
          {OBJECTIVE_LABELS[thesis.objective]}
        </span>
        <span style={chip}>{budget}</span>
        <span style={chip}>
          {thesis.target_countries.map((c) => `${countryFlag(c)} ${c}`).join('  ')}
        </span>
        {!!thesis.target_cities?.length && <span style={chip}>{thesis.target_cities.join(', ')}</span>}
        {!!thesis.property_types?.length && <span style={chip}>{thesis.property_types.join(', ')}</span>}
        {thesis.min_yield !== null && <span style={chip}>yield ≥ {thesis.min_yield}%</span>}
      </div>
    </div>
  )
}
