'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Strip current locale from path to get the raw path
  const rawPath = pathname.replace(`/${locale}`, '') || '/'

  // Build alternate locale URL
  const altLocale = locale === 'pt' ? 'en' : 'pt'
  const altPath = `/${altLocale}${rawPath === '/' ? '' : rawPath}`

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/#sobre', label: t('about') },
    { href: '/#manifesto', label: t('manifesto') },
    { href: '/consultoria', label: t('consultoria') },
    { href: '/contato', label: t('contato') },
  ]

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(7,11,36,0.95)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 72, gap: 32 }}>

          {/* Logo */}
          <Link href={`/${locale}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 22,
              color: '#F5F7FA',
              letterSpacing: '-0.5px',
            }}>
              Globe<span style={{ color: 'var(--color-blue)' }}>alle</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}
            className="hidden md:flex">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={`/${locale}${link.href === '/' ? '' : link.href}`}
                style={{
                  color: 'rgba(245,247,250,0.7)',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F5F7FA')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,247,250,0.7)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: lang switcher + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <Link
              href={altPath}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(245,247,250,0.5)',
                textDecoration: 'none',
                padding: '6px 10px',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                transition: 'all 0.2s',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#F5F7FA'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(245,247,250,0.5)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              }}
            >
              {locale === 'pt' ? 'EN' : 'PT'}
            </Link>

            <Link
              href={`/${locale}/#newsletter`}
              className="hidden sm:block"
              style={{
                background: 'var(--color-blue)',
                color: '#fff',
                textDecoration: 'none',
                padding: '9px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-blue-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-blue)')}
            >
              {t('subscribe')}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="flex md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              aria-label="Menu"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 22, height: 2,
                    background: '#F5F7FA',
                    borderRadius: 2,
                    display: 'block',
                    transition: 'all 0.2s',
                  }} />
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(7,11,36,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '16px 0 24px',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={`/${locale}${link.href === '/' ? '' : link.href}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  color: 'rgba(245,247,250,0.8)',
                  textDecoration: 'none',
                  padding: '12px 16px',
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ padding: '12px 16px 0' }}>
              <Link
                href={`/${locale}/#newsletter`}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  background: 'var(--color-blue)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {t('subscribe')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
