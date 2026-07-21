import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import LanguageSelect from '@/components/LanguageSelect'
import Logo from '@/components/Logo'
import Reveal from '@/components/Reveal'
import Icon from '@/components/Icon'

// Home gateway: dois caminhos — Investidores (/investidores) e
// Profissionais Imobiliários (/profissionais, a antiga home).
// Sem o Header do site (nav Sobre/Manifesto e CTA de newsletter ficam nas
// páginas internas): só o logo grande centralizado + seletor de idioma no
// canto. O idioma inicial é detectado pelo middleware do next-intl
// (Accept-Language do navegador); o seletor é o override manual.
export default function HomePage() {
  const t = useTranslations('gateway')
  const locale = useLocale()

  const paths = [
    {
      key: 'investors',
      href: `/${locale}/investidores`,
      title: t('investors_title'),
      body: t('investors_body'),
      cta: t('investors_cta'),
      icon: 'advisory' as const,
    },
    {
      key: 'pros',
      href: `/${locale}/profissionais`,
      title: t('pros_title'),
      body: t('pros_body'),
      cta: t('pros_cta'),
      icon: 'community' as const,
    },
  ]

  return (
    <>
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill priority style={{ objectFit: 'cover', opacity: 0.45 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,36,0.6) 0%, rgba(7,11,36,0.8) 55%, var(--color-navy) 100%)' }} />
        </div>

        {/* Seletor de idioma no canto */}
        <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 2 }}>
          <LanguageSelect />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '110px 28px 90px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
              <Logo height={58} priority />
            </div>
            <span className="kicker" style={{ color: 'var(--color-ink-faint)', display: 'block', marginBottom: 18 }}>{t('tagline')}</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4.4vw, 48px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.06 }}>
              {t('headline')}
            </h1>
          </div>

          <div className="gateway-grid">
            {paths.map((p, i) => (
              <Reveal key={p.key} delay={i * 100}>
                <Link
                  href={p.href}
                  className="gateway-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: '36px 30px',
                    borderRadius: 20,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--color-line)',
                    textDecoration: 'none',
                    transition: 'border-color 0.25s, background 0.25s, transform 0.25s',
                  }}
                >
                  <span style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(30,167,232,0.12)', border: '1px solid rgba(30,167,232,0.25)', color: 'var(--color-blue-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Icon name={p.icon} size={26} />
                  </span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 2.4vw, 26px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.015em', lineHeight: 1.2, marginBottom: 14 }}>
                    {p.title}
                  </h2>
                  <p style={{ color: 'var(--color-ink-dim)', fontSize: 15.5, lineHeight: 1.7, marginBottom: 28, flex: 1 }}>{p.body}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--color-blue-bright)', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {p.cta} <Icon name="arrow" size={16} strokeWidth={2} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .gateway-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: stretch; }
        .gateway-card:hover { border-color: rgba(30,167,232,0.5) !important; background: rgba(30,167,232,0.07) !important; transform: translateY(-3px); }
        @media (max-width: 760px) { .gateway-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
