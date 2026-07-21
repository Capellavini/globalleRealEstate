import Link from 'next/link'
import Image from 'next/image'
import { signOut } from '@/app/actions/auth'
import { getUnreadCommentsTotal } from '@/lib/portfolio/queries'
import Avatar from '@/components/ui/Avatar'
import NavLink from '@/components/ui/NavLink'
import type { Profile } from '@/lib/portfolio/types'
import type { User } from '@supabase/supabase-js'

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      style={{
        marginLeft: 6,
        background: '#FF3B5C',
        color: '#fff',
        borderRadius: 999,
        padding: '1px 6px',
        fontSize: 10.5,
        fontWeight: 800,
      }}
    >
      {count}
    </span>
  )
}

// Casca (html/body + header) partilhada pela área do cliente: /portfolio e /perfil.
export default async function PortfolioShell({
  user,
  profile,
  children,
}: {
  user: User
  profile: Profile | null
  children: React.ReactNode
}) {
  const isTeam = profile?.role !== 'client'
  const unreadCount = profile?.role === 'client' ? await getUnreadCommentsTotal(user.id, false) : 0

  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#F4F9FE', color: '#0B1230', minHeight: '100vh' }}>
        <header
          style={{
            background: 'linear-gradient(180deg, #0A1130 0%, #070B24 100%)',
            color: '#EDF1F7',
            padding: '0 24px',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 6px 14px -8px rgba(7,11,36,0.30)',
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <Link href="/portfolio" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
              <Image src="/globalle-logo.png" alt="Globalle" width={104} height={28} style={{ display: 'block' }} />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(237,241,247,0.62)',
                  borderLeft: '1px solid rgba(255,255,255,0.16)',
                  paddingLeft: 12,
                }}
              >
                Opções
              </span>
            </Link>

            <nav style={{ display: 'flex', gap: 22, flex: 1, marginLeft: 10 }}>
              {profile?.role === 'client' && (
                <NavLink href="/portfolio">
                  Opções
                  <UnreadBadge count={unreadCount} />
                </NavLink>
              )}
              {(profile?.role === 'client' || profile?.role === 'lawyer') && (
                <NavLink href="/transacoes">Minhas transações</NavLink>
              )}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {isTeam && (
                <Link href="/admin/portfolios" style={{ color: '#1EA7E8', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Admin
                </Link>
              )}
              <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'rgba(237,241,247,0.75)' }}>
                <Avatar name={profile?.full_name ?? user.email ?? '?'} imageUrl={profile?.avatar_url} />
                <span style={{ fontSize: 13 }}>{profile?.full_name ?? user.email}</span>
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255,255,255,0.16)',
                    borderRadius: 6,
                    color: '#EDF1F7',
                    padding: '6px 12px',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 80px' }}>{children}</main>
      </body>
    </html>
  )
}
