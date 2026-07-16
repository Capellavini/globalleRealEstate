import Image from 'next/image'
import SetPasswordForm from '@/components/auth/SetPasswordForm'

export default function SetPasswordPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
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
            Bem-vindo(a) — defina sua senha
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 28 }}>
          <SetPasswordForm />
        </div>
      </div>
    </main>
  )
}
