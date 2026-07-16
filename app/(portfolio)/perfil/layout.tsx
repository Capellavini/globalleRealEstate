import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import PortfolioShell from '@/components/portfolio/Shell'

export const metadata: Metadata = {
  title: 'Perfil — Globalle',
  robots: { index: false, follow: false },
}

// Sem checagem de perfil completo aqui — é para cá que o incompleto é enviado.
export default async function PerfilLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/admin/login')

  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/admin/login')

  return (
    <PortfolioShell user={user} profile={profile}>
      {children}
    </PortfolioShell>
  )
}
