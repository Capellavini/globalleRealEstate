'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Link de navegação do header com indicador de página ativa — antes nenhum
// dos dois headers (cliente/admin) mostrava em qual aba você estava.
export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: active ? '#fff' : 'rgba(237,241,247,0.72)',
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        padding: '10px 0',
      }}
    >
      {children}
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            height: 2,
            borderRadius: 2,
            background: '#1EA7E8',
          }}
        />
      )}
    </Link>
  )
}
