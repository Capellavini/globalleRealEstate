import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/Reveal'
import Icon from '@/components/Icon'
import { detectCurrency, type Currency } from '@/lib/currency'

// Pre-launch: keep the page out of search engines until the official launch.
export const metadata: Metadata = { robots: { index: false, follow: false } }

type Plan = {
  id: string; name: string; price: Record<Currency, string>; period: string;
  description: string; features: string[]; cta: string; popular: boolean;
}

export default function ConsultoriaPage() {
  const t = useTranslations('consultoria')
  const finalCta = useTranslations('final_cta')
  const plans = t.raw('plans') as Plan[]
  const currency = detectCurrency()

  return (
    <>
      <Header />

      {/* Hero with skyline illustration (no people) */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/skyline.jpg" alt="" fill priority style={{ objectFit: 'cover', objectPosition: 'center 70%', opacity: 0.45 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--color-navy) 0%, rgba(7,11,36,0.7) 45%, var(--color-navy) 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '170px 28px 90px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
              <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('label')}</span>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5.2vw, 58px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '20px 0' }}>
            {t('headline')}
          </h1>
          <p style={{ color: 'var(--color-ink-dim)', fontSize: 18, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            {t('subheadline')}
          </p>
          <p className="serif-i" style={{ color: 'var(--color-gold)', fontSize: 'clamp(17px, 2.2vw, 21px)', lineHeight: 1.5, maxWidth: 600, margin: '28px auto 0' }}>
            {t('positioning')}
          </p>
        </div>
      </section>

      {/* Plans (3 — currency auto by geo) */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '40px 28px 100px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="plans-grid">
            {plans.map((plan, i) => {
              const priceStr = plan.price[currency]
              const isCustom = priceStr === 'Sob consulta'
              return (
                <Reveal key={plan.id} delay={i * 80}>
                  <div style={{
                    position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
                    background: plan.popular ? 'linear-gradient(180deg, #FFFFFF 0%, var(--color-paper) 100%)' : 'var(--color-paper-2)',
                    border: plan.popular ? '1px solid rgba(30,167,232,0.5)' : '1px solid var(--color-line-dark)',
                    borderRadius: 18, padding: '34px 26px',
                    boxShadow: plan.popular ? '0 24px 60px -24px rgba(30,167,232,0.35)' : 'none',
                  }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-blue)', color: '#04121f', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', padding: '5px 14px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="curation" size={13} strokeWidth={2} /> {t('popular')}
                      </div>
                    )}

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 14, minHeight: 48 }}>{plan.name}</h3>

                    <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--color-line-dark)' }}>
                      <span className="serif" style={{ fontSize: isCustom ? 26 : 40, fontWeight: 600, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em' }}>{priceStr}</span>
                      {plan.period && !isCustom && <span style={{ color: 'var(--color-ink-dark-dim)', fontSize: 15, fontFamily: 'var(--font-mono)' }}> {plan.period}</span>}
                    </div>

                    <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{plan.description}</p>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 13, flex: 1 }}>
                      {plan.features.map((f, j) => (
                        <li key={j} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, color: 'var(--color-blue)', display: 'flex', marginTop: 1 }}><Icon name="check" size={17} strokeWidth={2.2} /></span>
                          <span style={{ color: 'var(--color-ink-dark-dim)', fontSize: 14, lineHeight: 1.55 }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <a href="mailto:hello@globalleinsights.com" style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                      padding: '13px 18px', borderRadius: 11, fontSize: 14.5, fontWeight: 700, fontFamily: 'var(--font-display)', textDecoration: 'none',
                      background: plan.popular ? 'var(--color-blue)' : 'transparent',
                      border: plan.popular ? 'none' : '1px solid var(--color-line-dark)',
                      color: plan.popular ? '#04121f' : 'var(--color-ink-dark)',
                    }}>
                      {plan.cta} <Icon name="arrow" size={16} strokeWidth={2} />
                    </a>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '100px 28px', textAlign: 'center', overflow: 'hidden' }}>
        <Reveal>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.6vw, 44px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 16 }}>
              {finalCta('headline')}
            </h2>
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 16.5, lineHeight: 1.6, marginBottom: 36 }}>{finalCta('subheadline')}</p>
            <NewsletterForm placeholder={finalCta('placeholder')} cta={finalCta('cta')} />
          </div>
        </Reveal>
      </section>

      <Footer />

      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch; }
        @media (max-width: 820px) { .plans-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; } }
      `}</style>
    </>
  )
}
