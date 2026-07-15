import Image from 'next/image'
import LoginForm from '@/components/admin/LoginForm'
import { isSupabaseConfigured } from '@/lib/supabase/server'

export default function LoginPage() {
  const configured = isSupabaseConfigured()

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ background: '#070B24', borderRadius: 12, padding: '18px 24px', display: 'inline-block' }}>
            <Image src="/globalle-logo.png" alt="Globalle" width={150} height={42} style={{ display: 'block' }} />
          </div>
          <p
            style={{
              marginTop: 14,
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(11,18,48,0.60)',
            }}
          >
            Transaction Room
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid rgba(11,18,48,0.10)',
            borderRadius: 12,
            padding: 28,
          }}
        >
          {configured ? (
            <LoginForm />
          ) : (
            <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(11,18,48,0.75)' }}>
              <strong style={{ color: '#0B1230' }}>Supabase não configurado.</strong>
              <p style={{ marginTop: 8 }}>
                Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no <code>.env.local</code> (e no
                Vercel), rode <code>supabase/schema.sql</code> no projeto e crie os usuários da
                equipe no painel do Supabase (Authentication → Users).
              </p>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(11,18,48,0.45)' }}>
          Acesso restrito à equipe Globalle.
        </p>
      </div>
    </main>
  )
}
