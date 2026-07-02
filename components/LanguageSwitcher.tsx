'use client'

import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { routing } from '@/i18n/routing'

const LABELS: Record<string, string> = { pt: 'PT', en: 'EN', it: 'IT', es: 'ES' }

export default function LanguageSwitcher({ dark = true }: { dark?: boolean }) {
  const pathname = usePathname()
  const locale = useLocale()
  const rest = pathname.startsWith(`/${locale}`) ? pathname.slice(locale.length + 1) : pathname

  const dimColor = dark ? 'var(--color-ink-faint)' : 'var(--color-ink-dark-dim)'
  const activeColor = dark ? 'var(--color-ink)' : 'var(--color-ink-dark)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em' }}>
      {routing.locales.map((loc, i) => {
        const active = loc === locale
        return (
          <span key={loc} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {i > 0 && <span style={{ color: dimColor, opacity: 0.5, margin: '0 7px' }}>/</span>}
            <Link
              href={`/${loc}${rest}`}
              aria-current={active ? 'true' : undefined}
              style={{ color: active ? activeColor : dimColor, fontWeight: active ? 700 : 400, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = activeColor }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = dimColor }}
            >
              {LABELS[loc]}
            </Link>
          </span>
        )
      })}
    </div>
  )
}
