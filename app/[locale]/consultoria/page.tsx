import { useTranslations } from 'next-intl'
import { headers } from 'next/headers'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/Reveal'
import PlansSection from '@/components/PlansSection'

export default function ConsultoriaPage() {
  const t = useTranslations('consultoria')
  const finalCta = useTranslations('final_cta')
  const faqs = t.raw('faqs') as Array<{ q: string; a: string }>

  // Geo-based currency: BR → R$, US → US$, everywhere else → € (Vercel sets this header in prod)
  const country = headers().get('x-vercel-ip-country') || ''
  const detected: 'brl' | 'eur' | 'usd' = country === 'BR' ? 'brl' : country === 'US' ? 'usd' : 'eur'

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

      {/* Plans (currency auto-detected by geo + manual switcher) */}
      <PlansSection detected={detected} />

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
            <NewsletterForm placeholder={finalCta('placeholder')} cta={finalCta('cta')} />
          </div>
        </Reveal>
      </section>

      <Footer />
    </>
  )
}
