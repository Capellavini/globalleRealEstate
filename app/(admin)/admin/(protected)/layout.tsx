import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import { getUnreadCommentsTotal } from '@/lib/portfolio/queries'
import { signOut } from '@/app/actions/auth'

const NAV_LINKS = [
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/funil', label: 'Funil' },
  { href: '/admin/properties', label: 'Imóveis' },
  { href: '/admin/cost-rules', label: 'Custos' },
  { href: '/admin/users', label: 'Usuários' },
]

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/admin/login')

  const { user, profile } = await getSessionProfile()

  if (!user) redirect('/admin/login')
  // Só a equipe entra no admin; cliente vai às opções, advogado às transações.
  if (profile && profile.role !== 'team') {
    redirect(profile.role === 'lawyer' ? '/transacoes' : '/portfolio')
  }

  const unreadCount = await getUnreadCommentsTotal(user.id, true)

  return (
    <>
      <header
        style={{
          background: '#070B24',
          color: '#EDF1F7',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <Link href="/admin/clientes" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
            <Image src="/globalle-logo.png" alt="Globalle" width={110} height={30} style={{ display: 'block' }} />
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
              Transaction Room
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'rgba(237,241,247,0.62)' }}>{user.email}</span>
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

        <nav
          style={{
            maxWidth: 1080,
            margin: '0 auto',
            display: 'flex',
            gap: 22,
            overflowX: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: 'rgba(237,241,247,0.75)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                padding: '10px 0',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {link.label}
              {link.href === '/admin/clientes' && unreadCount > 0 && (
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
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>{children}</main>
    </>
  )
}
