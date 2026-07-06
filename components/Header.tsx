'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Logo from './Logo'
import Icon from './Icon'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Comunidade/Consultoria are hidden until launch — pages stay reachable by direct URL only.
  const navLinks = [
    { href: '/#sobre', label: t('about') },
    { href: '/#manifesto', label: t('manifesto') },
  ]

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
        background: scrolled ? 'rgba(7,11,36,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(1.2)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--color-line)' : 'transparent'}`,
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 76, gap: 28 }}>

          <Logo href={`/${locale}`} height={30} priority />

          {/* Desktop nav */}
          <nav className="hidden md:flex" style={{ gap: 2, flex: 1, justifyContent: 'center' }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                style={{
                  color: 'var(--color-ink-dim)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  fontSize: 14.5,
                  fontWeight: 500,
                  fontFamily: 'var(--font-display)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-dim)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto' }}>
            <LanguageSwitcher />

            <Link
              href={`/${locale}/#newsletter`}
              className="hidden sm:inline-flex"
              style={{
                alignItems: 'center', gap: 8,
                background: 'var(--color-blue)',
                color: '#04121f',
                textDecoration: 'none',
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 6px 20px -8px rgba(30,167,232,0.6)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 26px -8px rgba(30,167,232,0.8)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(30,167,232,0.6)' }}
            >
              {t('subscribe')}
              <Icon name="arrow" size={16} strokeWidth={2} />
            </Link>

            {/* Mobile hamburger */}
            <button
              className="inline-flex md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--color-ink)' }}
              aria-label="Menu"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 22, height: 2, background: 'currentColor', borderRadius: 2, display: 'block',
                    transition: 'transform 0.25s, opacity 0.25s',
                    transform: menuOpen ? (i === 0 ? 'translateY(7px) rotate(45deg)' : i === 2 ? 'translateY(-7px) rotate(-45deg)' : 'none') : 'none',
                    opacity: menuOpen && i === 1 ? 0 : 1,
                  }} />
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(7,11,36,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--color-line)',
          borderBottom: '1px solid var(--color-line)',
          padding: '12px 28px 28px',
        }}>
          <div style={{ padding: '14px 0', borderBottom: '1px solid var(--color-line)' }}>
            <LanguageSwitcher />
          </div>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block', color: 'var(--color-ink)', textDecoration: 'none',
                padding: '14px 0', fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-display)',
                borderBottom: '1px solid var(--color-line)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/#newsletter`}
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
              marginTop: 20, background: 'var(--color-blue)', color: '#04121f',
              textDecoration: 'none', padding: '14px 20px', borderRadius: 12,
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
            }}
          >
            {t('subscribe')}
            <Icon name="arrow" size={16} strokeWidth={2} />
          </Link>
        </div>
      )}
    </header>
  )
}
