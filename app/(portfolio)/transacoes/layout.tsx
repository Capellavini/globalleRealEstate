import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import { isProfileComplete } from '@/lib/portfolio/types'
import PortfolioShell from '@/components/portfolio/Shell'

export const metadata: Metadata = {
  title: 'Minhas transações — Globalle',
  robots: { index: false, follow: false },
}

export default async function TransacoesLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/admin/login')

  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/admin/login')

  // Cliente com perfil incompleto passa pelo onboarding (advogado não tem).
  if (profile?.role === 'client' && !isProfileComplete(profile)) {
    redirect('/perfil/completar')
  }

  return (
    <PortfolioShell user={user} profile={profile}>
      {children}
    </PortfolioShell>
  )
}
