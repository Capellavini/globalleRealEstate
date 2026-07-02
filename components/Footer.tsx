'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Logo from './Logo'
import Icon from './Icon'

export default function Footer() {
  const t = useTranslations('footer')
  const nav = useTranslations('nav')
  const locale = useLocale()

  const links = [
    { href: '/#sobre', label: nav('about') },
    { href: '/#manifesto', label: nav('manifesto') },
    { href: '/comunidade', label: nav('comunidade') },
    { href: '/consultoria', label: nav('consultoria') },
  ]
  const socials = ['LinkedIn', 'Instagram', 'YouTube']

  return (
    <footer style={{ background: '#04081A', borderTop: '1px solid var(--color-line)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '72px 28px 36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 1.4fr) repeat(3, minmax(140px, 1fr))',
          gap: 48,
          marginBottom: 56,
        }} className="footer-grid">
          {/* Brand */}
          <div>
            <Logo height={32} />
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 14.5, lineHeight: 1.7, maxWidth: 280, marginTop: 22 }}>
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="footer-label">{t('links_title')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map(link => (
                <Link key={link.href} href={`/${locale}${link.href}`}
                  style={{ color: 'var(--color-ink-dim)', fontSize: 14.5, textDecoration: 'none', transition: 'color 0.2s', width: 'fit-content' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-dim)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="footer-label">{t('social_title')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {socials.map(s => (
                <span key={s} style={{ color: 'var(--color-ink-dim)', fontSize: 14.5, cursor: 'pointer', width: 'fit-content', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-dim)')}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Newsletter mini */}
          <div>
            <p className="footer-label">Newsletter</p>
            <p style={{ color: 'var(--color-ink-dim)', fontSize: 13.5, lineHeight: 1.65, marginBottom: 16 }}>
              {t('newsletter_mini_body')}
            </p>
            <Link href={`/${locale}/#newsletter`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--color-blue-bright)', textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              {t('newsletter_mini_cta')}
              <Icon name="arrowUpRight" size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--color-line)', marginBottom: 24 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13 }}>{t('copyright')}</p>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-faint)', fontSize: 11.5, letterSpacing: '0.1em' }}>{t('powered')}</p>
        </div>
      </div>

      <style>{`
        .footer-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-ink-faint);
          margin-bottom: 18px;
        }
        @media (max-width: 760px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
          .footer-grid > div:first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </footer>
  )
}
