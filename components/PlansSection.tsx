'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from './Icon'
import Reveal from './Reveal'

type Cur = 'brl' | 'eur' | 'usd'

const CURRENCIES: { id: Cur; sym: string; region: string }[] = [
  { id: 'brl', sym: 'R$', region: 'Brasil' },
  { id: 'eur', sym: '€', region: 'Europa' },
  { id: 'usd', sym: 'US$', region: 'Internacional' },
]

type Plan = {
  id: string
  name: string
  price: Record<Cur, string>
  period: string
  description: string
  features: string[]
  cta: string
  popular: boolean
}

export default function PlansSection({ detected }: { detected: Cur }) {
  const t = useTranslations('consultoria')
  const plans = t.raw('plans') as Plan[]
  const [cur, setCur] = useState<Cur>(detected)

  return (
    <section style={{ background: 'var(--color-navy)', padding: '40px 28px 100px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Currency switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div role="group" aria-label="Moeda" style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-line)', borderRadius: 12 }}>
            {CURRENCIES.map(c => {
              const active = cur === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCur(c.id)}
                  aria-pressed={active}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: active ? 'var(--color-blue)' : 'transparent',
                    color: active ? '#04121f' : 'var(--color-ink-dim)',
                    fontFamily: 'var(--font-display)', fontSize: 13.5, transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{c.sym}</span>
                  <span style={{ fontWeight: 500, opacity: 0.85 }}>{c.region}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="plans-grid">
          {plans.map((plan, i) => {
            const priceStr = plan.price[cur]
            const isCustom = priceStr === 'Sob consulta'
            return (
              <Reveal key={plan.id} delay={i * 70}>
                <div style={{
                  position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
                  background: plan.popular ? 'linear-gradient(180deg, var(--color-navy-4) 0%, var(--color-navy-3) 100%)' : 'rgba(255,255,255,0.025)',
                  border: plan.popular ? '1px solid rgba(30,167,232,0.5)' : '1px solid var(--color-line)',
                  borderRadius: 18, padding: '30px 22px',
                  boxShadow: plan.popular ? '0 24px 60px -24px rgba(30,167,232,0.5)' : 'none',
                }}>
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-blue)', color: '#04121f', fontSize: 10.5, fontWeight: 700, fontFamily: 'var(--font-display)', padding: '5px 12px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="curation" size={12} strokeWidth={2} /> {t('popular')}
                    </div>
                  )}

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18.5, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 14, minHeight: 48 }}>{plan.name}</h3>

                  <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--color-line)' }}>
                    <span className="serif" style={{ fontSize: isCustom ? 24 : 38, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{priceStr}</span>
                    {plan.period && !isCustom && <span style={{ color: 'var(--color-ink-faint)', fontSize: 14, fontFamily: 'var(--font-mono)' }}> {plan.period}</span>}
                  </div>

                  <p style={{ color: 'var(--color-ink-dim)', fontSize: 13.5, marginBottom: 22, lineHeight: 1.6 }}>{plan.description}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0, color: 'var(--color-blue-bright)', display: 'flex', marginTop: 1 }}><Icon name="check" size={16} strokeWidth={2.2} /></span>
                        <span style={{ color: 'var(--color-ink-dim)', fontSize: 13.5, lineHeight: 1.55 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="mailto:hello@globalle.co" style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7,
                    padding: '12px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-display)', textDecoration: 'none',
                    background: plan.popular ? 'var(--color-blue)' : 'transparent',
                    border: plan.popular ? 'none' : '1px solid var(--color-line-strong)',
                    color: plan.popular ? '#04121f' : 'var(--color-ink)',
                  }}>
                    {plan.cta} <Icon name="arrow" size={15} strokeWidth={2} />
                  </a>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>

      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; align-items: stretch; }
        @media (max-width: 1024px) { .plans-grid { grid-template-columns: repeat(2, 1fr); max-width: 720px; margin: 0 auto; } }
        @media (max-width: 560px) { .plans-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; } }
      `}</style>
    </section>
  )
}
