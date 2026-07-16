import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/roles'
import ProfileForm from '@/components/portfolio/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function PerfilPage({ searchParams }: { searchParams: { ok?: string } }) {
  const { user, profile } = await getSessionProfile()
  if (!user || !profile) redirect('/admin/login')

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Meu perfil</h1>
      {searchParams.ok && (
        <div style={{ background: 'rgba(43,160,90,0.12)', color: '#1E7A44', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, marginBottom: 16 }}>
          Perfil atualizado.
        </div>
      )}
      <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 24 }}>
        <ProfileForm profile={profile} email={user.email ?? ''} mode="editar" />
      </div>
    </div>
  )
}
