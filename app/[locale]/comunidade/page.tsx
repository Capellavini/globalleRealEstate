import type { Metadata } from 'next'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'
import Icon, { IconName } from '@/components/Icon'
import { detectCurrency, type Currency } from '@/lib/currency'

// Pre-launch: keep the page out of search engines until the official launch.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function ComunidadePage() {
  const t = useTranslations('comunidade')
  const locale = useLocale()
  const currency = detectCurrency()

  const features = t.raw('features') as Array<{ icon: IconName; title: string; body: string }>
  const planPrice = t.raw('plan_price') as Record<Currency, string>
  const planFeatures = t.raw('plan_features') as string[]

  return (
    <>
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill priority style={{ objectFit: 'cover', opacity: 0.4 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,36,0.7) 0%, rgba(7,11,36,0.82) 55%, var(--color-navy) 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '160px 28px 80px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
            <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('label')}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5.4vw, 60px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.04, marginBottom: 18 }}>
            {t('headline')}
          </h1>
          <p className="serif-i" style={{ fontSize: 'clamp(19px, 2.6vw, 26px)', color: 'var(--color-gold)', lineHeight: 1.35, marginBottom: 36, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
            {t('subheadline')}
          </p>
          <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'left' }}>
            {(['intro1', 'intro2', 'intro3'] as const).map((k, i) => (
              <p key={k} style={{ fontSize: 16.5, lineHeight: 1.75, color: i === 2 ? 'var(--color-ink)' : 'var(--color-ink-dim)', marginBottom: 18, fontWeight: i === 2 ? 500 : 400 }}>
                {t(k)}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ O QUE VOCÊ ENCONTRA ═══ */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 56, maxWidth: 640 }}>
              {t('features_title')}
            </h2>
          </Reveal>

          <div className="comm-features">
            {features.map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 80}>
                <div style={{ borderTop: '1px solid var(--color-line-dark)', paddingTop: 24, height: '100%' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(30,167,232,0.1)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Icon name={f.icon} size={24} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 14.5, lineHeight: 1.65 }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARA QUEM É ═══ */}
      <section style={{ background: 'var(--color-navy)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 20 }}>
              {t('audience_title')}
            </h2>
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 'clamp(18px, 2.4vw, 22px)', lineHeight: 1.6, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('audience_intro')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ POR QUE PARTICIPAR ═══ */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper-2) 0%, var(--color-paper) 100%)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
              <span className="kicker" style={{ color: 'var(--color-ink-dark-dim)' }}>{t('why_title')}</span>
            </div>
          </Reveal>
          <Reveal>
            <p style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink-dark)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
              {t('why_body')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ PLANO / CTA ═══ */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '100px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 460, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(30,167,232,0.12) 0%, transparent 70%)' }} />
        <Reveal>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 440, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(180deg, var(--color-navy-4) 0%, var(--color-navy-3) 100%)', border: '1px solid rgba(30,167,232,0.4)', borderRadius: 22, padding: '40px 34px', boxShadow: '0 30px 70px -30px rgba(30,167,232,0.5)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 12 }}>{t('plan_name')}</h3>
              <div style={{ marginBottom: 26, paddingBottom: 24, borderBottom: '1px solid var(--color-line)' }}>
                <span className="serif" style={{ fontSize: 46, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{planPrice[currency]}</span>
                <span style={{ color: 'var(--color-ink-faint)', fontSize: 16, fontFamily: 'var(--font-mono)' }}> {t('plan_period')}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-dim)', marginBottom: 18 }}>{t('plan_includes')}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {planFeatures.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, color: 'var(--color-blue-bright)', display: 'flex', marginTop: 1 }}><Icon name="check" size={18} strokeWidth={2.2} /></span>
                    <span style={{ color: 'var(--color-ink-dim)', fontSize: 15, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@globalleinsights.com" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '15px 24px', borderRadius: 12, background: 'var(--color-blue)', color: '#04121f', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', textDecoration: 'none' }}>
                {t('plan_cta')} <Icon name="arrow" size={16} strokeWidth={2} />
              </a>
            </div>
            <p className="serif-i" style={{ textAlign: 'center', color: 'var(--color-ink-dim)', fontSize: 16, lineHeight: 1.5, marginTop: 28, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('plan_tagline')}
            </p>
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <Link href={`/${locale}/profissionais#newsletter`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--color-blue-bright)', textDecoration: 'none', fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                {t('newsletter_link')} <Icon name="arrowUpRight" size={15} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />

      <style>{`
        .comm-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px 40px; }
        @media (max-width: 900px) { .comm-features { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 600px) { .comm-features { grid-template-columns: 1fr; gap: 28px; } }
      `}</style>
    </>
  )
}
