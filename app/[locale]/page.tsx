import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Image from 'next/image'

const CARD_COLORS: Record<string, string> = {
  yellow: '#F5C518',
  pink: '#E8387A',
  orange: '#F97316',
  blue: '#1EA7E8',
}

function SectionLabel({ text, dark = true }: { text: string; dark?: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: dark ? 'var(--color-blue)' : 'var(--color-blue)',
      background: dark ? 'rgba(30,167,232,0.12)' : 'rgba(30,167,232,0.1)',
      border: '1px solid rgba(30,167,232,0.25)',
      padding: '5px 12px',
      borderRadius: 20,
      marginBottom: 20,
    }}>
      {text}
    </span>
  )
}

export default function HomePage() {
  const t = useTranslations()

  const values = t.raw('mvv.values') as Array<{ icon: string; title: string; body: string }>
  const valueCards = t.raw('value_props.cards') as Array<{ color: string; title: string; body: string }>

  return (
    <>
      <Header />

      {/* ─── HERO ─────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 24px 80px',
      }}>
        {/* Background gradient + city photo overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(135deg, #070B24 0%, #0d1535 60%, #111b3a 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,167,232,0.15) 0%, transparent 70%)',
          zIndex: 0,
        }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '6px 16px',
            marginBottom: 32,
            fontSize: 13,
            color: 'rgba(245,247,250,0.7)',
          }}>
            <span>🌍</span>
            <span>{t('hero.badge')}</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            color: '#F5F7FA',
            marginBottom: 24,
          }}>
            {t('hero.headline')}
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(245,247,250,0.65)',
            lineHeight: 1.65,
            marginBottom: 48,
            maxWidth: 580,
            margin: '0 auto 48px',
          }}>
            {t('hero.subheadline')}
          </p>

          <div id="newsletter" style={{ maxWidth: 520, margin: '0 auto' }}>
            <NewsletterForm placeholder={t('hero.cta_placeholder')} cta={t('hero.cta')} />
          </div>

          {/* Scroll indicator */}
          <div style={{ marginTop: 64, opacity: 0.4, fontSize: 13, color: '#F5F7FA' }}>
            ↓ {t('hero.scroll')}
          </div>
        </div>
      </section>

      {/* ─── APPROACH ─────────────────────────────────── */}
      <section id="sobre" style={{
        background: 'linear-gradient(180deg, #EAF7FF 0%, #FFFFFF 100%)',
        padding: '96px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionLabel text={t('approach.label')} dark={false} />
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              color: '#0B1230',
              letterSpacing: '-1px',
              lineHeight: 1.15,
            }}>
              {t('approach.headline')}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 48,
            marginBottom: 64,
          }}>
            {/* City image */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 300 }}>
              <Image
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80"
                alt="Global city skyline"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Two text cols */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0B1230',
                  marginBottom: 12,
                }}>
                  {t('approach.col1_title')}
                </h3>
                <p style={{ color: 'rgba(11,18,48,0.65)', lineHeight: 1.7, fontSize: 15 }}>
                  {t('approach.col1_body')}
                </p>
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0B1230',
                  marginBottom: 12,
                }}>
                  {t('approach.col2_title')}
                </h3>
                <p style={{ color: 'rgba(11,18,48,0.65)', lineHeight: 1.7, fontSize: 15 }}>
                  {t('approach.col2_body')}
                </p>
              </div>
            </div>
          </div>

          {/* Quote block */}
          <blockquote style={{
            background: 'linear-gradient(135deg, rgba(30,167,232,0.08), rgba(30,167,232,0.03))',
            border: '1px solid rgba(30,167,232,0.2)',
            borderLeft: '4px solid var(--color-blue)',
            borderRadius: 16,
            padding: '32px 40px',
            maxWidth: 760,
            margin: '0 auto',
          }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(16px, 2vw, 20px)',
              fontWeight: 600,
              color: '#0B1230',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              &ldquo;{t('approach.quote')}&rdquo;
            </p>
          </blockquote>
        </div>
      </section>

      {/* ─── MANIFESTO ────────────────────────────────── */}
      <section id="manifesto" style={{
        background: 'var(--color-navy)',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: -300, right: -200,
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,167,232,0.08) 0%, transparent 70%)',
        }} />

        <div style={{ maxWidth: 740, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionLabel text={t('manifesto.label')} />
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            fontWeight: 800,
            color: '#F5F7FA',
            lineHeight: 1.2,
            marginBottom: 48,
            letterSpacing: '-0.5px',
          }}>
            {t('manifesto.headline')}
          </h2>

          {(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'] as const).map((key, i) => (
            <p key={key} style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: i === 1 ? 'rgba(245,247,250,0.5)' : 'rgba(245,247,250,0.72)',
              marginBottom: 24,
              fontStyle: i === 1 ? 'italic' : 'normal',
            }}>
              {t(`manifesto.${key}`)}
            </p>
          ))}

          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--color-blue)',
            marginTop: 40,
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            {t('manifesto.closing')}
          </p>
        </div>
      </section>

      {/* ─── MISSION / VISION / VALUES ────────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #EAF7FF 100%)',
        padding: '96px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionLabel text={t('mvv.label')} dark={false} />
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#0B1230',
              letterSpacing: '-1px',
            }}>
              {t('mvv.headline')}
            </h2>
          </div>

          {/* Mission + Vision */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 64,
          }}>
            {(['mission', 'vision'] as const).map(key => (
              <div key={key} style={{
                background: '#fff',
                border: '1px solid rgba(11,18,48,0.08)',
                borderRadius: 20,
                padding: '36px',
                boxShadow: '0 2px 20px rgba(11,18,48,0.05)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(30,167,232,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, marginBottom: 20,
                }}>
                  {key === 'mission' ? '🎯' : '🔭'}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 20, fontWeight: 700,
                  color: '#0B1230', marginBottom: 12,
                }}>
                  {t(`mvv.${key}_title`)}
                </h3>
                <p style={{ color: 'rgba(11,18,48,0.65)', lineHeight: 1.7, fontSize: 15 }}>
                  {t(`mvv.${key}_body`)}
                </p>
              </div>
            ))}
          </div>

          {/* Values */}
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 22, fontWeight: 800, color: '#0B1230',
            textAlign: 'center', marginBottom: 32,
          }}>
            {t('mvv.values_title')}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {values.map((v, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid rgba(11,18,48,0.07)',
                borderRadius: 16,
                padding: '28px',
                boxShadow: '0 1px 12px rgba(11,18,48,0.04)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 15, fontWeight: 700,
                  color: '#0B1230', marginBottom: 8,
                }}>
                  {v.title}
                </h4>
                <p style={{ color: 'rgba(11,18,48,0.6)', fontSize: 13, lineHeight: 1.65 }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPS ──────────────────────────────── */}
      <section style={{
        background: 'var(--color-navy)',
        padding: '96px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <SectionLabel text={t('value_props.label')} />
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#F5F7FA',
              letterSpacing: '-1px',
            }}>
              {t('value_props.headline')}
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {valueCards.map((card, i) => {
              const color = CARD_COLORS[card.color] || 'var(--color-blue)'
              return (
                <div key={i} style={{
                  background: 'var(--color-navy-card)',
                  border: `1px solid ${color}30`,
                  borderTop: `3px solid ${color}`,
                  borderRadius: 20,
                  padding: '36px 28px',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `${color}20`,
                    border: `1px solid ${color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, marginBottom: 20,
                  }}>
                    {['🌍', '🎭', '🏆', '🤝'][i]}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 17, fontWeight: 700,
                    color: '#F5F7FA', marginBottom: 12,
                  }}>
                    {card.title}
                  </h3>
                  <p style={{ color: 'rgba(245,247,250,0.6)', fontSize: 14, lineHeight: 1.7 }}>
                    {card.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ─────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #EAF7FF 0%, #FFFFFF 100%)',
        padding: '96px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <SectionLabel text={t('products.label')} dark={false} />
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#0B1230',
              letterSpacing: '-1px',
            }}>
              {t('products.headline')}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[
              {
                side: 'left',
                icon: '📰',
                title: t('products.newsletter_title'),
                body: t('products.newsletter_body'),
                cta: t('products.newsletter_cta'),
                href: '#newsletter',
                img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=80',
                accent: '#1EA7E8',
              },
              {
                side: 'right',
                icon: '🎙️',
                title: t('products.podcast_title'),
                body: t('products.podcast_body'),
                cta: t('products.podcast_cta'),
                href: '#',
                img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=700&q=80',
                accent: '#E8387A',
              },
              {
                side: 'left',
                icon: '🧭',
                title: t('products.consultoria_title'),
                body: t('products.consultoria_body'),
                cta: t('products.consultoria_cta'),
                href: '/consultoria',
                img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80',
                accent: '#F97316',
              },
            ].map((product, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 48,
                alignItems: 'center',
                direction: product.side === 'right' ? 'rtl' : 'ltr',
              }}>
                <div style={{
                  position: 'relative', borderRadius: 20, overflow: 'hidden', height: 280,
                  direction: 'ltr',
                }}>
                  <Image src={product.img} alt={product.title} fill style={{ objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${product.accent}30, transparent)`,
                  }} />
                </div>

                <div style={{ direction: 'ltr' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: `${product.accent}12`,
                    border: `1px solid ${product.accent}30`,
                    borderRadius: 12, padding: '8px 16px',
                    marginBottom: 20,
                  }}>
                    <span style={{ fontSize: 20 }}>{product.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: product.accent, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      {product.title}
                    </span>
                  </div>

                  <p style={{ color: 'rgba(11,18,48,0.65)', lineHeight: 1.75, fontSize: 15, marginBottom: 28 }}>
                    {product.body}
                  </p>

                  <a href={product.href} style={{
                    display: 'inline-block',
                    background: product.accent,
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '12px 24px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    {product.cta} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────── */}
      <section style={{
        background: 'var(--color-navy)',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(30,167,232,0.12) 0%, transparent 70%)',
        }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(28px, 4vw, 50px)',
            fontWeight: 800,
            color: '#F5F7FA',
            letterSpacing: '-1px',
            marginBottom: 20,
          }}>
            {t('final_cta.headline')}
          </h2>
          <p style={{
            color: 'rgba(245,247,250,0.6)',
            fontSize: 17,
            lineHeight: 1.65,
            marginBottom: 40,
          }}>
            {t('final_cta.subheadline')}
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <NewsletterForm placeholder={t('final_cta.placeholder')} cta={t('final_cta.cta')} />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
