import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/Reveal'
import Icon, { type IconName } from '@/components/Icon'

type Feature = { icon: IconName; title: string; body: string }

// Página dedicada à newsletter — porta de entrada gratuita pro ecossistema
// Globalle. Reachable só por link direto por enquanto (mesmo padrão de
// /corretores e /comunidade): não entra no menu, mas o botão "Assinar
// Newsletter" do Header e os CTAs secundários de /profissionais apontam
// pra cá. Ver memória globalle-public-site-roadmap.
export default function NewsletterPage() {
  const t = useTranslations('newsletter_page')
  const locale = useLocale()
  const features = t.raw('features') as Feature[]

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill priority style={{ objectFit: 'cover', opacity: 0.4 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,36,0.6) 0%, rgba(7,11,36,0.8) 55%, var(--color-navy) 100%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', padding: '170px 28px 90px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
              <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('label')}</span>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5.2vw, 58px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '20px 0' }}>
            {t('headline')}
          </h1>
          <p style={{ color: 'var(--color-ink-dim)', fontSize: 18, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 40px' }}>
            {t('subheadline')}
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <NewsletterForm placeholder={t('form_placeholder')} cta={t('form_cta')} />
          </div>
        </div>
      </section>

      {/* O que você recebe */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '90px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 48, maxWidth: 640 }}>
              {t('features_title')}
            </h2>
          </Reveal>

          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div style={{ borderTop: '1px solid var(--color-line-dark)', paddingTop: 22, height: '100%' }}>
                  <span style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(30,167,232,0.1)', border: '1px solid rgba(30,167,232,0.2)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon name={f.icon} size={22} />
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 14.5, lineHeight: 1.7 }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Porta de entrada pro ecossistema */}
      <section style={{ background: 'var(--color-navy)', padding: '90px 28px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
              <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('bridge_label')}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.6vw, 38px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 18 }}>
              {t('bridge_headline')}
            </h2>
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 16.5, lineHeight: 1.7, marginBottom: 32, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('bridge_body')}
            </p>
            <Link
              href={`/${locale}/corretores`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--color-blue-bright)', textDecoration: 'none',
                fontSize: 15.5, fontWeight: 700, fontFamily: 'var(--font-display)',
              }}
            >
              {t('bridge_cta')} <Icon name="arrowUpRight" size={16} strokeWidth={2} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '100px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill style={{ objectFit: 'cover', opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(7,11,36,0.6) 0%, var(--color-navy) 75%)' }} />
        </div>
        <Reveal>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.2vw, 34px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 32 }}>
              {t('final_headline')}
            </h2>
            <NewsletterForm placeholder={t('form_placeholder')} cta={t('form_cta')} />
          </div>
        </Reveal>
      </section>

      <Footer />

      <style>{`
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        @media (max-width: 820px) { .features-grid { grid-template-columns: 1fr 1fr; gap: 32px; } }
        @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
