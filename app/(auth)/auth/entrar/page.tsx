import Image from 'next/image'
import MagicEntry from '@/components/auth/MagicEntry'

export default function EntrarPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ background: '#070B24', borderRadius: 12, padding: '18px 24px', display: 'inline-block', marginBottom: 20 }}>
          <Image src="/globalle-logo.png" alt="Globalle" width={150} height={42} style={{ display: 'block' }} />
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 28 }}>
          <MagicEntry />
        </div>
      </div>
    </main>
  )
}
