import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/Reveal'
import Icon, { IconName } from '@/components/Icon'

// renders **bold** segments inside a plain string
function withBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 700, color: 'var(--color-ink-dark)' }}>{part.slice(2, -2)}</strong>
      : part
  )
}

function Kicker({ num, label, dark }: { num: string; label: string; dark: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
      <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-gold)', fontStyle: 'italic' }}>{num}</span>
      <span className="kicker" style={{ color: dark ? 'var(--color-ink-faint)' : 'var(--color-ink-dark-dim)' }}>{label}</span>
    </div>
  )
}

export default function HomePage() {
  const t = useTranslations()
  const locale = useLocale()

  const valueCards = t.raw('value_props.cards') as Array<{ icon: IconName; title: string; body: string }>

  return (
    <>
      <Header />

      {/* ═══ HERO ═══ */}
      <section className="grain" style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-navy)' }}>
        {/* bokeh texture */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill priority style={{ objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,36,0.55) 0%, rgba(7,11,36,0.75) 55%, var(--color-navy) 100%)' }} />
        </div>

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto' }}>
          {/* Left: copy */}
          <div className="hero-copy">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5.4vw, 66px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--color-ink)', marginBottom: 26 }}>
              {t('hero.headline')}
            </h1>

            <p style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: 'var(--color-ink-dim)', lineHeight: 1.65, maxWidth: 520, marginBottom: 38 }}>
              {t('hero.subheadline')}
            </p>

            <div id="newsletter" style={{ maxWidth: 540, scrollMarginTop: 100 }}>
              <NewsletterForm
                placeholder={t('hero.cta_placeholder')}
                cta={t('hero.cta')}
              />
            </div>
          </div>

          {/* Right: skyline illustration */}
          <div className="hero-art">
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 520 }}>
              <Image src="/skyline.jpg" alt="" fill style={{ objectFit: 'cover', objectPosition: 'bottom' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, var(--color-navy) 0%, transparent 22%, transparent 80%, var(--color-navy) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--color-navy) 0%, transparent 30%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 01 · APPROACH ═══ */}
      <section id="sobre" style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '110px 28px', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <Kicker num="01" label={t('approach.label')} dark={false} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4.2vw, 50px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', lineHeight: 1.1, maxWidth: 760, marginBottom: 64 }}>
              {t('approach.headline')}
            </h2>
          </Reveal>

          <div className="two-col" style={{ marginBottom: 72 }}>
            {(['col1', 'col2'] as const).map((col, i) => (
              <Reveal key={col} delay={i * 90}>
                <div style={{ borderTop: '2px solid var(--color-ink-dark)', paddingTop: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 14 }}>
                    {t(`approach.${col}_title`)}
                  </h3>
                  <p style={{ color: 'var(--color-ink-dark-dim)', lineHeight: 1.75, fontSize: 16 }}>
                    {t(`approach.${col}_body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <blockquote style={{ margin: 0, maxWidth: 880 }}>
              <p className="serif" style={{ fontSize: 'clamp(22px, 3vw, 33px)', fontWeight: 500, color: 'var(--color-ink-dark)', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
                <span style={{ color: 'var(--color-blue)' }}>“</span>{t('approach.quote')}<span style={{ color: 'var(--color-blue)' }}>”</span>
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ═══ 02 · MANIFESTO ═══ */}
      <section id="manifesto" className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '120px 28px', overflow: 'hidden', scrollMarginTop: 76 }}>
        <div style={{ position: 'absolute', top: 80, right: -40, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(160px, 28vw, 360px)', fontWeight: 600, color: 'rgba(255,255,255,0.018)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>02</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <Reveal>
            <Kicker num="02" label={t('manifesto.label')} dark />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.6vw, 42px)', fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1.16, letterSpacing: '-0.02em', marginBottom: 52 }}>
              {t('manifesto.headline')}
            </h2>
          </Reveal>

          <Reveal>
            <p style={{ fontSize: 20, lineHeight: 1.7, color: 'var(--color-ink)', marginBottom: 26, fontWeight: 400 }}>
              {t('manifesto.p1')}
            </p>
            <p style={{ fontSize: 16.5, lineHeight: 1.8, color: 'var(--color-ink-dim)', marginBottom: 30 }}>
              {t('manifesto.p2')}
            </p>
            <p className="serif-i" style={{ fontSize: 'clamp(22px, 2.6vw, 29px)', lineHeight: 1.4, color: 'var(--color-gold)', marginBottom: 30 }}>
              {t('manifesto.p3')}
            </p>
            {(['p4', 'p5', 'p6'] as const).map(key => (
              <p key={key} style={{ fontSize: 16.5, lineHeight: 1.8, color: 'var(--color-ink-dim)', marginBottom: 22 }}>
                {t(`manifesto.${key}`)}
              </p>
            ))}
          </Reveal>

          <Reveal>
            <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--color-line)' }}>
              <p className="serif-i" style={{ fontSize: 'clamp(24px, 3.2vw, 36px)', fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                {t('manifesto.closing')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 03 · VALUE PROPS ═══ */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper-2) 0%, var(--color-paper) 100%)', padding: '110px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <Kicker num="03" label={t('value_props.label')} dark={false} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4.2vw, 50px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {t('value_props.headline')}
            </h2>
          </Reveal>

          <div className="props-grid" style={{ marginTop: 48 }}>
            {valueCards.map((card, i) => (
              <Reveal key={i} delay={(i % 2) * 90}>
                <div style={{ borderTop: '1px solid var(--color-line-dark)', paddingTop: 28, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(30,167,232,0.1)', border: '1px solid rgba(30,167,232,0.2)', color: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={card.icon} size={26} />
                    </span>
                    <span className="serif-i" style={{ fontSize: 28, color: 'rgba(11,18,48,0.12)', fontWeight: 600 }}>0{i + 1}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18.5, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 12, lineHeight: 1.25 }}>
                    {card.title}
                  </h3>
                  <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 14.5, lineHeight: 1.7 }}>{withBold(card.body)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 04 · PRODUCTS ═══ */}
      <section style={{ background: 'var(--color-navy)', padding: '110px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <Kicker num="04" label={t('products.label')} dark />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4.2vw, 50px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 16 }}>
              {t('products.headline')}
            </h2>
          </Reveal>

          {[
            { key: 'newsletter', icon: 'newsletter', tag: '01', visual: 'newsletter', href: '#newsletter' },
            { key: 'community', icon: 'community', tag: '02', visual: 'community', href: '/comunidade' },
            { key: 'consultoria', icon: 'advisory', tag: '03', visual: 'advisory', href: '/consultoria' },
          ].map((p, i) => (
            <Reveal key={p.key}>
              <div className="product-row" style={{ borderTop: '1px solid var(--color-line)', padding: '48px 0' }}>
                <div className="product-visual" style={{ order: i % 2 === 0 ? 0 : 2 }}>
                  {p.visual === 'newsletter' && (
                    <div style={{ position: 'relative', width: '100%', height: 260, borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-line)', padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-blue-bright)', fontSize: 16 }}>Globalle</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--color-ink-faint)', letterSpacing: '0.1em' }}>#1</span>
                      </div>
                      <div style={{ height: 12, width: '70%', background: 'rgba(255,255,255,0.14)', borderRadius: 4, marginBottom: 12 }} />
                      <div style={{ height: 8, width: '100%', background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 8, width: '92%', background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 8, width: '96%', background: 'rgba(255,255,255,0.07)', borderRadius: 4, marginBottom: 18 }} />
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 8, background: 'var(--color-blue)', color: '#04121f', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                        {locale === 'pt' ? 'Ler análise' : 'Read analysis'} <Icon name="arrow" size={13} strokeWidth={2.2} />
                      </div>
                    </div>
                  )}
                  {p.visual === 'advisory' && (
                    <div style={{ position: 'relative', width: '100%', height: 260, borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 320 220" style={{ width: '78%' }} fill="none">
                        {/* connected network / strategy graph */}
                        {[[60, 60], [160, 40], [260, 80], [110, 130], [220, 160], [60, 170]].map(([x, y], n) => (
                          <g key={n}>
                            {n > 0 && <line x1={[60, 160, 260, 110, 220, 60][n - 1]} y1={[60, 40, 80, 130, 160, 170][n - 1]} x2={x} y2={y} stroke="rgba(30,167,232,0.3)" strokeWidth="1.2" />}
                            <circle cx={x} cy={y} r={n === 1 ? 7 : 5} fill={n === 1 ? '#46BCF6' : 'rgba(30,167,232,0.5)'} />
                            <circle cx={x} cy={y} r={n === 1 ? 14 : 10} stroke="rgba(30,167,232,0.25)" strokeWidth="1" />
                          </g>
                        ))}
                        <line x1="220" y1="160" x2="60" y2="170" stroke="rgba(232,184,109,0.35)" strokeWidth="1.2" />
                        <line x1="160" y1="40" x2="110" y2="130" stroke="rgba(30,167,232,0.3)" strokeWidth="1.2" />
                      </svg>
                    </div>
                  )}
                  {p.visual === 'community' && (
                    <div style={{ position: 'relative', width: '100%', height: 260, borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 320 220" style={{ width: '82%' }} fill="none">
                        <g stroke="rgba(30,167,232,0.28)" strokeWidth="1.2">
                          <line x1="160" y1="110" x2="70" y2="55" /><line x1="160" y1="110" x2="250" y2="60" /><line x1="160" y1="110" x2="55" y2="150" /><line x1="160" y1="110" x2="255" y2="155" /><line x1="160" y1="110" x2="150" y2="40" /><line x1="160" y1="110" x2="160" y2="185" /><line x1="70" y1="55" x2="150" y2="40" /><line x1="250" y1="60" x2="255" y2="155" />
                        </g>
                        {[[160, 110, 16], [70, 55, 11], [250, 60, 11], [55, 150, 10], [255, 155, 10], [150, 40, 9], [160, 185, 10]].map(([x, y, r], n) => (
                          <g key={n}>
                            <circle cx={x} cy={y} r={r + 5} fill="#070B24" />
                            <circle cx={x} cy={y} r={r} fill={n === 0 ? '#46BCF6' : n % 2 ? 'rgba(30,167,232,0.5)' : 'rgba(232,184,109,0.55)'} />
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>

                <div className="product-text" style={{ order: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <span style={{ color: 'var(--color-blue)', display: 'flex' }}><Icon name={p.icon as IconName} size={24} /></span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-dim)' }}>
                      {t(`products.${p.key}_title`)}
                    </span>
                  </div>
                  {p.key === 'community' && (
                    <p className="serif-i" style={{ color: 'var(--color-gold)', fontSize: 19, lineHeight: 1.4, marginBottom: 18, maxWidth: 520 }}>
                      {t('products.community_lead')}
                    </p>
                  )}
                  {t(`products.${p.key}_body`).split('\n\n').map((para, k) => (
                    <p key={k} style={{ color: 'var(--color-ink-dim)', lineHeight: 1.75, fontSize: 16, marginBottom: 18, maxWidth: 480 }}>
                      {para}
                    </p>
                  ))}
                  <Link href={p.href.startsWith('/') ? `/${locale}${p.href}` : `/${locale}/${p.href}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, color: 'var(--color-blue)', textDecoration: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {t(`products.${p.key}_cta`)} <Icon name="arrowUpRight" size={16} strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '120px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/bg-bokeh.jpg" alt="" fill style={{ objectFit: 'cover', opacity: 0.35 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(7,11,36,0.6) 0%, var(--color-navy) 75%)' }} />
        </div>
        <Reveal>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 4.6vw, 52px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 20 }}>
              {t('final_cta.headline')}
            </h2>
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 17.5, lineHeight: 1.6, marginBottom: 40, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('final_cta.subheadline')}
            </p>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <NewsletterForm placeholder={t('final_cta.placeholder')} cta={t('final_cta.cta')} />
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />

      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; min-height: 92vh; padding: 120px 28px 40px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 36px 40px; margin-top: 20px; }
        .props-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 44px 56px; }
        .product-row { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .product-visual { min-width: 0; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; min-height: auto; padding: 150px 28px 36px; }
          .hero-art { display: none; }
          .values-grid { grid-template-columns: 1fr 1fr; }
          .product-row { grid-template-columns: 1fr; gap: 28px; }
          .product-visual { order: 2 !important; }
        }
        @media (max-width: 600px) {
          .two-col { grid-template-columns: 1fr; gap: 32px; }
          .values-grid { grid-template-columns: 1fr; gap: 24px; }
          .props-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </>
  )
}
