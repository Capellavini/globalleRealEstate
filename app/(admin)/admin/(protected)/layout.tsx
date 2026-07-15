import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/admin/login')

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

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
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
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
      </header>

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 80px' }}>{children}</main>
    </>
  )
}
