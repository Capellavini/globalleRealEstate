'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import Icon from './Icon'

// Seletor de idioma em dropdown (globo + nome do idioma) — usado na home
// gateway. A detecção automática por localização/idioma do navegador já é
// feita pelo middleware do next-intl; isto é só o override manual.
const NAMES: Record<string, string> = { pt: 'Português', en: 'English', it: 'Italiano', es: 'Español' }

export default function LanguageSelect() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const rest = pathname.startsWith(`/${locale}`) ? pathname.slice(locale.length + 1) : pathname

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 14px',
          borderRadius: 100,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.16)',
          color: 'var(--color-ink)',
          fontSize: 13.5,
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <Icon name="globe" size={16} strokeWidth={1.8} />
        {NAMES[locale]}
        <span style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-9" transform="translate(0,-1)" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 170,
            background: 'rgba(10,16,42,0.97)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 12,
            padding: 6,
            zIndex: 60,
            boxShadow: '0 16px 40px -12px rgba(0,0,0,0.5)',
          }}
        >
          {routing.locales.map((loc) => {
            const active = loc === locale
            return (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setOpen(false)
                  if (!active) router.push(`/${loc}${rest}`)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: active ? 'rgba(30,167,232,0.14)' : 'transparent',
                  color: active ? 'var(--color-blue-bright)' : 'var(--color-ink)',
                  fontSize: 14,
                  fontFamily: 'var(--font-display)',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                {NAMES[loc]}
                {active && <Icon name="check" size={15} strokeWidth={2.2} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
