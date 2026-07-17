'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { requireTeam } from '@/lib/supabase/roles'
import { globalRoleFor, type ParticipantRole } from '@/lib/transactions/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://globalleinsights.com'

function back(transactionId: string, param: 'ok' | 'erro', message: string): never {
  redirect(`/admin/transactions/${transactionId}?${param}=${encodeURIComponent(message)}`)
}

// Bloco 2 — convida participante para uma transação.
// E-mail já tem conta → só insere a participação + manda link de acesso.
// E-mail novo → convite padrão (define senha) com papel global mapeado.
export async function inviteParticipant(formData: FormData) {
  const { user } = await requireTeam()
  const transactionId = String(formData.get('transaction_id'))
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const full_name = String(formData.get('full_name') ?? '').trim()
  const roleRaw = String(formData.get('participant_role'))
  const participantRole = (['client', 'lawyer', 'other'].includes(roleRaw) ? roleRaw : 'other') as ParticipantRole

  if (!email || !full_name) back(transactionId, 'erro', 'Nome e e-mail são obrigatórios.')
  if (!isAdminConfigured()) back(transactionId, 'erro', 'SUPABASE_SERVICE_ROLE_KEY não configurada.')

  const admin = createAdminClient()

  // Procura conta existente pelo e-mail.
  const { data: authList, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) back(transactionId, 'erro', `Erro na Admin API: ${listError.message}`)
  const existing = authList.users.find((u) => u.email?.toLowerCase() === email)

  let profileId: string

  if (existing) {
    profileId = existing.id
    // Garante o profile (usuários muito antigos podem não ter).
    await admin
      .from('profiles')
      .upsert({ id: profileId, full_name, role: globalRoleFor(participantRole) }, { onConflict: 'id', ignoreDuplicates: true })
  } else {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name },
      redirectTo: `${SITE_URL}/auth/set-password`,
    })
    if (error || !data.user) back(transactionId, 'erro', `Erro ao convidar: ${error?.message ?? 'sem usuário'}`)
    profileId = data.user.id
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({ id: profileId, full_name, role: globalRoleFor(participantRole) }, { onConflict: 'id' })
    if (profileError) back(transactionId, 'erro', `Convite enviado, mas erro no perfil: ${profileError.message}`)
  }

  const { error: partError } = await admin.from('transaction_participants').insert({
    transaction_id: transactionId,
    profile_id: profileId,
    role: participantRole,
    invited_by: user.id,
  })
  if (partError) {
    if (partError.code === '23505') back(transactionId, 'erro', 'Essa pessoa já participa desta transação.')
    back(transactionId, 'erro', `Erro ao adicionar participante: ${partError.message}`)
  }

  // Conta já existente: notificação simples = e-mail com link de acesso direto.
  if (existing) {
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${SITE_URL}/auth/entrar` },
    })
  }

  revalidatePath(`/admin/transactions/${transactionId}`)
  back(
    transactionId,
    'ok',
    existing
      ? `${full_name} adicionado(a) — enviamos um link de acesso por e-mail.`
      : `Convite enviado para ${email}.`
  )
}

// Remove só a participação — a conta continua (pode estar noutras transações).
export async function removeParticipant(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))

  const supabase = createClient()
  const { error } = await supabase.from('transaction_participants').delete().eq('id', id)
  if (error) back(transactionId, 'erro', `Erro ao remover: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
  back(transactionId, 'ok', 'Participante removido.')
}
