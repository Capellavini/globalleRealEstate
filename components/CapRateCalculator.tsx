'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

// Calculadora de cap rate — mesmos três cálculos da planilha do usuário
// ("Calculadora de Cap Rate.xlsx", aba Cap Rate):
//   1. preço + aluguel        → cap rate anual (aluguel×12/preço) e rentabilidade mensal
//   2. preço + cap rate anual → aluguel mensal (preço × taxa / 12)
//   3. aluguel + cap rate     → preço máximo (aluguel × 12 / taxa anual)
// Cap rate BRUTO, como na planilha — sem custos/impostos/vacância.
// v1 só em BRL, com máscara de dinheiro estilo banco (dígitos preenchem
// a partir dos centavos: 1.000.000,00).

type Mode = 'caprate' | 'rent' | 'price'

function formatBRL(digits: string): string {
  if (!digits) return ''
  const cents = Number(digits)
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function moneyValue(digits: string): number | null {
  if (!digits) return null
  const v = Number(digits) / 100
  return v > 0 ? v : null
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-ink-dark-dim)',
  marginBottom: 10,
}
const fieldWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 11,
  border: '1px solid rgba(11,18,48,0.14)',
  background: '#fff',
  overflow: 'hidden',
}
const prefixStyle: React.CSSProperties = {
  padding: '13px 0 13px 16px',
  fontSize: 17,
  color: 'rgba(11,18,48,0.45)',
  fontFamily: 'var(--font-body)',
  flexShrink: 0,
}
const fieldStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '13px 16px 13px 8px',
  border: 'none',
  background: 'transparent',
  color: 'var(--color-ink-dark)',
  fontSize: 17,
  outline: 'none',
  fontFamily: 'var(--font-body)',
}

// Fora do componente principal: definido dentro, seria um tipo novo a cada
// render e o input desmontaria/perderia o foco a cada tecla.
function MoneyInput({ id, digits, onDigits, placeholder }: { id: string; digits: string; onDigits: (d: string) => void; placeholder: string }) {
  return (
    <div style={fieldWrap}>
      <span style={prefixStyle}>R$</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={formatBRL(digits)}
        onChange={(e) => onDigits(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 15))}
        placeholder={placeholder}
        style={fieldStyle}
      />
    </div>
  )
}

export default function CapRateCalculator() {
  const t = useTranslations('calculadora')

  const [mode, setMode] = useState<Mode>('caprate')
  const [priceDigits, setPriceDigits] = useState('')
  const [rentDigits, setRentDigits] = useState('')
  const [capRate, setCapRate] = useState('')

  const priceN = moneyValue(priceDigits)
  const rentN = moneyValue(rentDigits)
  const capParsed = Number(capRate.replace(/\s/g, '').replace(',', '.'))
  const capN = Number.isFinite(capParsed) && capParsed > 0 ? capParsed : null

  const money = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pct = (v: number, digits = 2) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: digits })}%`

  let results: { label: string; value: string; highlight?: boolean }[] = []
  if (mode === 'caprate' && priceN && rentN) {
    const monthly = rentN / priceN
    results = [
      { label: t('result_caprate_annual'), value: pct(monthly * 12), highlight: true },
      { label: t('result_caprate_monthly'), value: pct(monthly) },
    ]
  } else if (mode === 'rent' && priceN && capN) {
    const monthlyRent = (priceN * (capN / 100)) / 12
    results = [
      { label: t('result_rent_monthly'), value: money(monthlyRent), highlight: true },
      { label: t('result_rent_annual'), value: money(monthlyRent * 12) },
    ]
  } else if (mode === 'price' && rentN && capN) {
    results = [{ label: t('result_price'), value: money((rentN * 12) / (capN / 100)), highlight: true }]
  }

  const modes: { id: Mode; title: string; hint: string }[] = [
    { id: 'caprate', title: t('mode_caprate'), hint: t('mode_caprate_hint') },
    { id: 'rent', title: t('mode_rent'), hint: t('mode_rent_hint') },
    { id: 'price', title: t('mode_price'), hint: t('mode_price_hint') },
  ]

  return (
    <div style={{ background: 'rgba(11,18,48,0.02)', border: '1px solid rgba(11,18,48,0.1)', borderRadius: 18, padding: 26 }}>
      {/* Seletor de modo */}
      <div className="calc-modes" style={{ display: 'grid', gap: 10, marginBottom: 26 }}>
        {modes.map((m) => {
          const active = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={active}
              onClick={() => setMode(m.id)}
              style={{
                textAlign: 'left',
                padding: '13px 15px',
                borderRadius: 12,
                border: `1px solid ${active ? 'var(--color-blue)' : 'rgba(11,18,48,0.12)'}`,
                background: active ? 'rgba(30,167,232,0.1)' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700, color: active ? '#0E6FA3' : 'var(--color-ink-dark)', marginBottom: 3 }}>
                {m.title}
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--color-ink-dark-dim)' }}>{m.hint}</span>
            </button>
          )
        })}
      </div>

      {/* Entradas */}
      <div style={{ display: 'grid', gap: 18, marginBottom: 26 }}>
        {mode !== 'price' && (
          <div>
            <label htmlFor="calc-price" style={labelStyle}>
              {t('price_label')}
            </label>
            <MoneyInput id="calc-price" digits={priceDigits} onDigits={setPriceDigits} placeholder="1.000.000,00" />
          </div>
        )}
        {mode !== 'rent' && (
          <div>
            <label htmlFor="calc-rent" style={labelStyle}>
              {t('rent_label')}
            </label>
            <MoneyInput id="calc-rent" digits={rentDigits} onDigits={setRentDigits} placeholder="5.000,00" />
          </div>
        )}
        {mode !== 'caprate' && (
          <div>
            <label htmlFor="calc-cap" style={labelStyle}>
              {t('caprate_label')}
            </label>
            <div style={fieldWrap}>
              <input
                id="calc-cap"
                type="text"
                inputMode="decimal"
                value={capRate}
                onChange={(e) => setCapRate(e.target.value)}
                placeholder="7"
                style={{ ...fieldStyle, padding: '13px 8px 13px 16px' }}
              />
              <span style={{ ...prefixStyle, padding: '13px 16px 13px 0' }}>%</span>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(11,18,48,0.1)', paddingTop: 22, display: 'grid', gap: 14 }}>
          {results.map((r) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, color: 'var(--color-ink-dark-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {r.label}
              </span>
              <span
                className="serif"
                style={{
                  fontSize: r.highlight ? 34 : 20,
                  fontWeight: 600,
                  color: r.highlight ? '#0E6FA3' : 'var(--color-ink-dark)',
                  letterSpacing: '-0.01em',
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: 22, fontSize: 12.5, lineHeight: 1.6, color: 'var(--color-ink-dark-dim)' }}>{t('disclaimer')}</p>

      <style>{`
        @media (min-width: 640px) { .calc-modes { grid-template-columns: 1fr 1fr 1fr; } }
      `}</style>
    </div>
  )
}
