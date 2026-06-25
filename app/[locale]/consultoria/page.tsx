import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'

function SectionLabel({ text }: { text: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11, fontWeight: 700, letterSpacing: '2px',
      textTransform: 'uppercase',
      color: 'var(--color-blue)',
      background: 'rgba(30,167,232,0.12)',
      border: '1px solid rgba(30,167,232,0.25)',
      padding: '5px 12px', borderRadius: 20, marginBottom: 20,
    }}>
      {text}
    </span>
  )
}

export default function ConsultoriaPage() {
  const t = useTranslations('consultoria')
  const finalCta = useTranslations('final_cta')

  const plans = t.raw('plans') as Array<{
    id: string; name: string; price: string; period: string;
    description: string; features: string[]; cta: string; popular: boolean;
  }>
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>

  return (
    <>
      <Header />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #070B24 0%, #0d1535 100%)',
        padding: '140px 24px 96px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,167,232,0.12) 0%, transparent 70%)',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionLabel text={t('label')} />
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800, color: '#F5F7FA',
            letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
          }}>
            {t('headline')}
          </h1>
          <p style={{ color: 'rgba(245,247,250,0.6)', fontSize: 18, lineHeight: 1.65 }}>
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section style={{ background: 'var(--color-navy)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}>
            {plans.map((plan) => (
              <div key={plan.id} style={{
                background: plan.popular ? 'var(--color-navy-card)' : 'rgba(255,255,255,0.03)',
                border: plan.popular
                  ? '2px solid var(--color-blue)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '40px 32px',
                position: 'relative',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--color-blue)',
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    padding: '5px 16px', borderRadius: 20, whiteSpace: 'nowrap',
                    letterSpacing: '0.5px',
                  }}>
                    ⭐ {t('popular')}
                  </div>
                )}

                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 20, fontWeight: 700, color: '#F5F7FA', marginBottom: 8,
                }}>
                  {plan.name}
                </h3>
                <p style={{ color: 'rgba(245,247,250,0.5)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                  {plan.description}
                </p>

                <div style={{ marginBottom: 32 }}>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: plan.price === 'Sob consulta' || plan.price === 'On request' ? 24 : 40,
                    fontWeight: 800, color: '#F5F7FA',
                  }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ color: 'rgba(245,247,250,0.4)', fontSize: 15 }}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        background: 'rgba(30,167,232,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: 'var(--color-blue)',
                      }}>✓</span>
                      <span style={{ color: 'rgba(245,247,250,0.7)', fontSize: 14, lineHeight: 1.55 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a href="mailto:hello@globalle.co" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  padding: '14px 24px', borderRadius: 12,
                  fontSize: 15, fontWeight: 600,
                  background: plan.popular ? 'var(--color-blue)' : 'rgba(255,255,255,0.07)',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  transition: 'all 0.2s',
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        background: 'linear-gradient(180deg, #EAF7FF 0%, #FFFFFF 100%)',
        padding: '96px 24px',
      }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--color-blue)', background: 'rgba(30,167,232,0.1)',
              border: '1px solid rgba(30,167,232,0.25)',
              padding: '5px 12px', borderRadius: 20, marginBottom: 20,
            }}>
              {t('faq_label')}
            </span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              fontWeight: 800, color: '#0B1230', letterSpacing: '-0.5px',
            }}>
              {t('faq_headline')}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid rgba(11,18,48,0.08)',
                borderRadius: 16, padding: '28px 32px',
                boxShadow: '0 1px 12px rgba(11,18,48,0.05)',
              }}>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 16, fontWeight: 700,
                  color: '#0B1230', marginBottom: 12,
                }}>
                  {faq.q}
                </h4>
                <p style={{ color: 'rgba(11,18,48,0.6)', fontSize: 14, lineHeight: 1.7 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--color-navy)', padding: '96px 24px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(24px, 3.5vw, 44px)',
            fontWeight: 800, color: '#F5F7FA', letterSpacing: '-1px', marginBottom: 16,
          }}>
            {finalCta('headline')}
          </h2>
          <p style={{ color: 'rgba(245,247,250,0.6)', fontSize: 16, lineHeight: 1.65, marginBottom: 36 }}>
            {finalCta('subheadline')}
          </p>
          <NewsletterForm placeholder={finalCta('placeholder')} cta={finalCta('cta')} />
        </div>
      </section>

      <Footer />
    </>
  )
}
