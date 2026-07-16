'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/supabase/roles'

// Cliente salva o próprio perfil (onboarding e edição). O papel nunca passa
// por aqui — e o trigger profiles_role_guard bloqueia mudança via API direta.
export async function updateOwnProfile(formData: FormData) {
  const { user } = await requireUser()

  const full_name = String(formData.get('full_name') ?? '').trim()
  const company = String(formData.get('company') ?? '').trim()
  const residence_country = String(formData.get('residence_country') ?? '').trim().toUpperCase()
  const preferred_language = String(formData.get('preferred_language') ?? '').trim().toLowerCase()
  const phone = String(formData.get('phone') ?? '').trim() || null
  const avatar_url = String(formData.get('avatar_url') ?? '').trim() || null

  if (!full_name || !company || !residence_country || !preferred_language) {
    throw new Error('Nome, empresa, país de residência e idioma são obrigatórios.')
  }

  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ full_name, company, residence_country, preferred_language, phone, avatar_url })
    .eq('id', user.id)
  if (error) {
    throw new Error(`Erro ao salvar o perfil (a migration-fase15.sql já rodou?): ${error.message}`)
  }

  revalidatePath('/perfil')
  revalidatePath('/portfolio')

  if (String(formData.get('mode')) === 'completar') {
    redirect('/portfolio')
  }
  redirect('/perfil?ok=1')
}
