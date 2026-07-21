import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import Reveal from '@/components/Reveal'
import Icon from '@/components/Icon'

type WhatItem = { title: string; body: string }
type ObjectiveItem = { value: string; title: string; body: string }

export default function InvestidoresPage() {
  const t = useTranslations('investidores')
  const whatItems = t.raw('what_items') as WhatItem[]
  const objectives = t.raw('objectives') as ObjectiveItem[]

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

      {/* O que fazemos */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '90px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
              <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-gold)', fontStyle: 'italic' }}>01</span>
              <span className="kicker" style={{ color: 'var(--color-ink-dark-dim)' }}>{t('what_label')}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 48, maxWidth: 640 }}>
              {t('what_headline')}
            </h2>
          </Reveal>

          <div className="what-grid">
            {whatItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div style={{ borderTop: '1px solid var(--color-line-dark)', paddingTop: 22, height: '100%' }}>
                  <span className="serif-i" style={{ fontSize: 26, color: 'rgba(11,18,48,0.14)', fontWeight: 600, display: 'block', marginBottom: 14 }}>
                    0{i + 1}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink-dark)', marginBottom: 10 }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 14.5, lineHeight: 1.7 }}>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* As teses */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
              <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-gold)', fontStyle: 'italic' }}>02</span>
              <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('thesis_label')}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.02em', marginBottom: 48, maxWidth: 640 }}>
              {t('thesis_headline')}
            </h2>
          </Reveal>

          <div className="thesis-grid">
            {objectives.map((o, i) => (
              <Reveal key={o.value} delay={i * 70}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 22px', height: '100%' }}>
                  <span style={{ display: 'flex', color: 'var(--color-blue)', marginBottom: 16 }}>
                    <Icon name="advisory" size={22} />
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, fontWeight: 700, color: 'var(--color-ink)', marginBottom: 8 }}>{o.title}</h3>
                  <p style={{ color: 'var(--color-ink-dim)', fontSize: 13.5, lineHeight: 1.65 }}>{o.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário — captação integrada ao CRM */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '100px 28px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <span className="serif" style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-gold)', fontStyle: 'italic' }}>03</span>
                <span className="kicker" style={{ color: 'var(--color-ink-dark-dim)' }}>{t('form_label')}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 800, color: 'var(--color-ink-dark)', letterSpacing: '-0.02em', marginBottom: 14 }}>
                {t('form_headline')}
              </h2>
              <p style={{ color: 'var(--color-ink-dark-dim)', fontSize: 15.5, lineHeight: 1.6 }}>{t('form_subheadline')}</p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <LeadForm />
          </Reveal>

          <Reveal delay={140}>
            <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13.5, color: 'var(--color-ink-dark-dim)' }}>
              {t('contact_note')}{' '}
              <a href="mailto:hello@globalleinsights.com" style={{ color: '#0E6FA3', fontWeight: 600, textDecoration: 'none' }}>
                {t('contact_cta')}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />

      <style>{`
        .what-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .thesis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 820px) {
          .what-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .thesis-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .what-grid { grid-template-columns: 1fr; }
          .thesis-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
