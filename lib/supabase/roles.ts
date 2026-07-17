import { createClient } from './server'
import type { Profile } from '@/lib/portfolio/types'
import type { User } from '@supabase/supabase-js'

// Usuário autenticado + perfil (papel). profile === null acontece se a
// migration-portfolio.sql ainda não rodou — tratar como equipe legada.
export async function getSessionProfile(): Promise<{ user: User | null; profile: Profile | null }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return { user, profile: (profile as Profile | null) ?? null }
}

// Guarda para server actions da equipe (além do RLS). profile null = usuário
// anterior à migration → tratado como equipe.
export async function requireTeam() {
  const { user, profile } = await getSessionProfile()
  // profile null = usuário anterior à migration → equipe legada.
  if (!user || (profile && profile.role !== 'team')) {
    throw new Error('Ação restrita à equipe Globalle.')
  }
  return { user, profile }
}

export async function requireUser() {
  const { user, profile } = await getSessionProfile()
  if (!user) throw new Error('Sessão expirada — faça login novamente.')
  return { user, profile }
}
