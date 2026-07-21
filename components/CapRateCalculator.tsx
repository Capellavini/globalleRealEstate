'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

// Calculadora de cap rate — mesmos três cálculos da planilha do usuário
// ("Calculadora de Cap Rate.xlsx", aba Cap Rate):
//   1. preço + aluguel        → cap rate mensal (aluguel/preço) e anual (×12)
//   2. preço + cap rate anual → aluguel mensal (preço × taxa / 12)
//   3. aluguel + cap rate     → preço máximo (aluguel × 12 / taxa anual)
// Cap rate BRUTO, como na planilha — sem custos/impostos/vacância.

type Mode = 'caprate' | 'rent' | 'price'
const LOCALE_TAGS: Record<string, string> = { pt: 'pt-PT', en: 'en-US', es: 'es-ES', it: 'it-IT' }

export default function CapRateCalculator() {
  const t = useTranslations('calculadora')
  const locale = useLocale()
  const tag = LOCALE_TAGS[locale] ?? 'pt-PT'

  const [mode, setMode] = useState<Mode>('caprate')
  const [currency, setCurrency] = useState<'EUR' | 'BRL' | 'USD'>('EUR')
  const [price, setPrice] = useState('')
  const [rent, setRent] = useState('')
  const [capRate, setCapRate] = useState('')

  const num = (v: string) => {
    const n = Number(v.replace(/\s/g, '').replace(',', '.'))
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const priceN = num(price)
  const rentN = num(rent)
  const capN = num(capRate)

  const money = (v: number) =>
    new Intl.NumberFormat(tag, { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
  const pct = (v: number, digits = 2) => `${(v * 100).toLocaleString(tag, { maximumFractionDigits: digits })}%`

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
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 16px',
    borderRadius: 11,
    border: '1px solid rgba(11,18,48,0.14)',
    background: '#fff',
    color: 'var(--color-ink-dark)',
    fontSize: 17,
    outline: 'none',
    fontFamily: 'var(--font-body)',
  }

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

      {/* Moeda */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>{t('currency_label')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['EUR', 'BRL', 'USD'] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={currency === c}
              onClick={() => setCurrency(c)}
              style={{
                padding: '7px 14px',
                borderRadius: 100,
                fontSize: 13,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${currency === c ? 'var(--color-blue)' : 'rgba(11,18,48,0.14)'}`,
                background: currency === c ? 'rgba(30,167,232,0.12)' : '#fff',
                color: currency === c ? '#0E6FA3' : 'var(--color-ink-dark-dim)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Entradas */}
      <div style={{ display: 'grid', gap: 18, marginBottom: 26 }}>
        {mode !== 'price' && (
          <div>
            <label htmlFor="calc-price" style={labelStyle}>
              {t('price_label')} ({currency})
            </label>
            <input id="calc-price" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="450 000" style={fieldStyle} />
          </div>
        )}
        {mode !== 'rent' && (
          <div>
            <label htmlFor="calc-rent" style={labelStyle}>
              {t('rent_label')} ({currency})
            </label>
            <input id="calc-rent" type="text" inputMode="decimal" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="2 500" style={fieldStyle} />
          </div>
        )}
        {mode !== 'caprate' && (
          <div>
            <label htmlFor="calc-cap" style={labelStyle}>
              {t('caprate_label')}
            </label>
            <input id="calc-cap" type="text" inputMode="decimal" value={capRate} onChange={(e) => setCapRate(e.target.value)} placeholder="7" style={fieldStyle} />
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
