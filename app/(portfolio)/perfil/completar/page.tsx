import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/supabase/roles'
import { isProfileComplete } from '@/lib/portfolio/types'
import ProfileForm from '@/components/portfolio/ProfileForm'

export const dynamic = 'force-dynamic'

// Onboarding: primeiro acesso após definir a senha.
export default async function CompletarPerfilPage() {
  const { user, profile } = await getSessionProfile()
  if (!user || !profile) redirect('/admin/login')

  // Já completo? Vai direto às opções.
  if (isProfileComplete(profile)) redirect('/portfolio')

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Complete o seu perfil</h1>
      <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.6)', marginBottom: 24 }}>
        Só falta isto para acessar as suas opções de imóveis. Telefone e foto são opcionais.
      </p>
      <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 24 }}>
        <ProfileForm profile={profile} email={user.email ?? ''} mode="completar" />
      </div>
    </div>
  )
}
