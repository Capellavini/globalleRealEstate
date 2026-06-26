import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/Reveal'
import Icon from '@/components/Icon'

export default function ConsultoriaPage() {
  const t = useTranslations('consultoria')
  const finalCta = useTranslations('final_cta')
  const locale = useLocale()

  const plans = t.raw('plans') as Array<{
    id: string; name: string; price: string; period: string;
    description: string; features: string[]; cta: string; popular: boolean;
  }>
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>

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
          <p style={{ color: 'var(--color-ink-dim)', fontSize: 18, lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section style={{ background: 'var(--color-navy)', padding: '40px 28px 100px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div className="plans-grid">
            {plans.map((plan, i) => {
              const isCustom = plan.price === 'Sob consulta' || plan.price === 'On request'
              return (
                <Reveal key={plan.id} delay={i * 80}>
                  <div style={{
                    position: 'relative', height: '100%',
                    background: plan.popular ? 'linear-gradient(180deg, var(--color-navy-4) 0%, var(--color-navy-3) 100%)' : 'rgba(255,255,255,0.025)',
                    border: plan.popular ? '1px solid rgba(30,167,232,0.5)' : '1px solid var(--color-line)',
                    borderRadius: 22, padding: '40px 32px',
                    boxShadow: plan.popular ? '0 24px 60px -24px rgba(30,167,232,0.5)' : 'none',
                  }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-blue)', color: '#04121f', fontSize: 11.5, fontWeight: 700, fontFamily: 'var(--font-display)', padding: '5px 16px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="curation" size={13} strokeWidth={2} /> {t('popular')}
                      </div>
                    )}

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 10 }}>{plan.name}</h3>
                    <p style={{ color: 'var(--color-ink-dim)', fontSize: 14, marginBottom: 26, lineHeight: 1.6, minHeight: 44 }}>{plan.description}</p>

                    <div style={{ marginBottom: 30, paddingBottom: 26, borderBottom: '1px solid var(--color-line)' }}>
                      <span className="serif" style={{ fontSize: isCustom ? 28 : 46, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{plan.price}</span>
                      {plan.period && <span style={{ color: 'var(--color-ink-faint)', fontSize: 15, fontFamily: 'var(--font-mono)' }}> {plan.period}</span>}
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 34px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {plan.features.map((f, j) => (
                        <li key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ flexShrink: 0, color: 'var(--color-blue-bright)', display: 'flex', marginTop: 1 }}><Icon name="check" size={18} strokeWidth={2.2} /></span>
                          <span style={{ color: 'var(--color-ink-dim)', fontSize: 14, lineHeight: 1.55 }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <a href="mailto:hello@globalle.co" style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                      padding: '14px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', textDecoration: 'none',
                      background: plan.popular ? 'var(--color-blue)' : 'transparent',
                      border: plan.popular ? 'none' : '1px solid var(--color-line-strong)',
                      color: plan.popular ? '#04121f' : 'var(--color-ink)',
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

      {/* FAQ */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
              <span className="kicker" style={{ color: 'var(--color-ink-dark-dim)' }}>{t('faq_label')}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.6vw, 40px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 48 }}>
              {t('faq_headline')}
            </h2>
          </Reveal>

          <div>
            {faqs.map((faq, i) => (
              <Reveal key={i}>
                <div style={{ borderTop: '1px solid var(--color-line-dark)', padding: '28px 0' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 17.5, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 12, display: 'flex', gap: 14 }}>
                    <span className="serif-i" style={{ color: 'var(--color-blue)', fontSize: 16 }}>0{i + 1}</span>
                    {faq.q}
                  </h4>
                  <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 15, lineHeight: 1.7, paddingLeft: 30 }}>{faq.a}</p>
                </div>
              </Reveal>
            ))}
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
            <NewsletterForm placeholder={finalCta('placeholder')} cta={finalCta('cta')} note={locale === 'pt' ? 'Grátis. Sem spam.' : 'Free. No spam.'} />
          </div>
        </Reveal>
      </section>

      <Footer />

      <style>{`
        .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; }
        @media (max-width: 900px) { .plans-grid { grid-template-columns: 1fr; max-width: 440px; margin: 0 auto; } }
      `}</style>
    </>
  )
}
