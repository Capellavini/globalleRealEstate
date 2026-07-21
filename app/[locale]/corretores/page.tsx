import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/Reveal'
import Icon, { type IconName } from '@/components/Icon'

type Feature = { icon: IconName; title: string; body: string }

// LP de corretores/imobiliárias — programa pago (newsletter + consultoria +
// rede + parceiros), captação simples via NewsletterForm (Beehiiv). Por
// pedido do usuário, sem vínculo com o CRM ainda — isso vem numa fase
// posterior, quando a estrutura de parceiros for desenhada (ver memória
// globalle-public-site-roadmap).
export default function CorretoresPage() {
  const t = useTranslations('corretores')
  const features = t.raw('features') as Feature[]

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/skyline.jpg" alt="" fill priority style={{ objectFit: 'cover', objectPosition: 'center 70%', opacity: 0.4 }} />
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
        </div>
      </section>

      {/* O que você tem acesso */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '90px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 48, maxWidth: 640 }}>
              {t('features_title')}
            </h2>
          </Reveal>

          <div className="features-grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
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

      {/* Preço + formulário */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '100px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill style={{ objectFit: 'cover', opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(7,11,36,0.6) 0%, var(--color-navy) 75%)' }} />
        </div>

        <Reveal>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <span className="kicker" style={{ color: 'var(--color-ink-faint)', display: 'block', marginBottom: 14 }}>{t('price_label')}</span>
            <div style={{ marginBottom: 6 }}>
              <span className="serif" style={{ fontSize: 52, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>{t('price')}</span>
              <span style={{ color: 'var(--color-ink-dim)', fontSize: 17, fontFamily: 'var(--font-mono)' }}> {t('price_period')}</span>
            </div>
            <p style={{ color: 'var(--color-ink-faint)', fontSize: 13.5, marginBottom: 48 }}>{t('price_note')}</p>

            <div style={{ height: 1, background: 'var(--color-line)', marginBottom: 44 }} />

            <span className="kicker" style={{ color: 'var(--color-ink-faint)', display: 'block', marginBottom: 12 }}>{t('form_label')}</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.2vw, 34px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 14 }}>
              {t('form_headline')}
            </h2>
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 15.5, lineHeight: 1.6, marginBottom: 32 }}>{t('form_subheadline')}</p>

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
