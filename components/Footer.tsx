'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

export default function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const locale = useLocale()

  const links = [
    { href: '/', label: nav('home') },
    { href: '/#sobre', label: nav('about') },
    { href: '/#manifesto', label: nav('manifesto') },
    { href: '/consultoria', label: nav('consultoria') },
    { href: '/contato', label: nav('contato') },
  ]

  return (
    <footer style={{
      background: '#040818',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 24px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          marginBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 24,
              color: '#F5F7FA',
              marginBottom: 12,
            }}>
              Globe<span style={{ color: 'var(--color-blue)' }}>alle</span>
            </div>
            <p style={{ color: 'rgba(245,247,250,0.5)', fontSize: 14, lineHeight: 1.6, maxWidth: 240 }}>
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ color: 'rgba(245,247,250,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>
              {t('links_title')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(link => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href === '/' ? '' : link.href}`}
                  style={{ color: 'rgba(245,247,250,0.55)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F5F7FA')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,247,250,0.55)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p style={{ color: 'rgba(245,247,250,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>
              {t('social_title')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['LinkedIn', 'Instagram', 'YouTube'].map(s => (
                <span key={s} style={{ color: 'rgba(245,247,250,0.55)', fontSize: 14 }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Newsletter mini CTA */}
          <div>
            <p style={{ color: 'rgba(245,247,250,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>
              Newsletter
            </p>
            <p style={{ color: 'rgba(245,247,250,0.5)', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
              {locale === 'pt'
                ? 'Inteligência imobiliária global, todas as semanas.'
                : 'Global real estate intelligence, every week.'}
            </p>
            <Link
              href={`/${locale}/#newsletter`}
              style={{
                display: 'inline-block',
                background: 'var(--color-blue)',
                color: '#fff',
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {locale === 'pt' ? 'Assinar' : 'Subscribe'}
            </Link>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ color: 'rgba(245,247,250,0.3)', fontSize: 13 }}>{t('copyright')}</p>
          <p style={{ color: 'rgba(245,247,250,0.2)', fontSize: 12 }}>{t('powered')}</p>
        </div>
      </div>
    </footer>
  )
}
