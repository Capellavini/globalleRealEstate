'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { requireTeam } from '@/lib/supabase/roles'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://globalleinsights.com'
const INVITE_REDIRECT = `${SITE_URL}/auth/set-password`

function backWithError(message: string): never {
  redirect(`/admin/users?erro=${encodeURIComponent(message)}`)
}

// A4 — cria usuário por convite (Supabase envia o e-mail; usuário define a
// senha em /auth/set-password). Opcionalmente já cria a tese inicial do cliente.
export async function inviteUser(formData: FormData) {
  await requireTeam()
  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.')

  const full_name = String(formData.get('full_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('role')) === 'team' ? 'team' : 'client'
  if (!full_name || !email) backWithError('Nome e e-mail são obrigatórios.')

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: INVITE_REDIRECT,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already') || error.status === 422) {
      backWithError('Este e-mail já tem conta.')
    }
    backWithError(`Erro ao convidar: ${error.message}`)
  }

  const userId = data.user!.id

  // O trigger handle_new_user já criou o profile (role client) — o upsert
  // garante o nome e aplica o papel escolhido.
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: userId, full_name, role }, { onConflict: 'id' })
  if (profileError) backWithError(`Convite enviado, mas erro no perfil: ${profileError.message}`)

  // Passo 2 opcional: tese inicial do cliente.
  const thesisTitle = String(formData.get('thesis_title') ?? '').trim()
  if (role === 'client' && thesisTitle) {
    const num = (name: string) => {
      const v = String(formData.get(name) ?? '').replace(',', '.').trim()
      return v ? Number(v) : null
    }
    const countries = String(formData.get('thesis_countries') ?? '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
    const objective = String(formData.get('thesis_objective') ?? '')
    if (!countries.length || !objective) {
      backWithError('Convite enviado, mas a tese precisa de objetivo e países-alvo — crie em Teses.')
    }
    const { error: thesisError } = await admin.from('theses').insert({
      client_id: userId,
      title: thesisTitle,
      objective,
      budget_min: num('thesis_budget_min'),
      budget_max: num('thesis_budget_max'),
      budget_currency: String(formData.get('thesis_currency') ?? 'EUR').toUpperCase(),
      target_countries: countries,
    })
    if (thesisError) backWithError(`Convite enviado, mas erro na tese: ${thesisError.message}`)
  }

  revalidatePath('/admin/users')
  redirect(`/admin/users?ok=${encodeURIComponent(`Convite enviado para ${email}.`)}`)
}

// A3 — reenviar convite a usuário pendente. Tenta reenviar o e-mail; se a lib
// recusar (usuário já registrado), gera o link de convite para envio manual.
export async function resendInvite(formData: FormData) {
  await requireTeam()
  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.')
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: INVITE_REDIRECT })
  if (!error) {
    redirect(`/admin/users?ok=${encodeURIComponent(`Convite reenviado para ${email}.`)}`)
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: INVITE_REDIRECT },
  })
  if (linkError || !linkData.properties?.action_link) {
    backWithError(`Não consegui reenviar: ${linkError?.message ?? error.message}`)
  }
  // Link de uso único — mostrado à equipe para envio manual (WhatsApp/e-mail).
  redirect(
    `/admin/users?link=${encodeURIComponent(linkData.properties.action_link)}&link_email=${encodeURIComponent(email)}`
  )
}

export async function updateUserProfile(formData: FormData) {
  const { user } = await requireTeam()
  const id = String(formData.get('id'))
  const full_name = String(formData.get('full_name') ?? '').trim()
  const role = String(formData.get('role')) === 'team' ? 'team' : 'client'
  if (!full_name) backWithError('O nome não pode ficar vazio.')
  if (id === user.id && role !== 'team') backWithError('Você não pode rebaixar o próprio papel.')

  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.')
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ full_name, role }).eq('id', id)
  if (error) backWithError(`Erro ao salvar: ${error.message}`)

  await admin.auth.admin.updateUserById(id, { user_metadata: { full_name } })

  revalidatePath('/admin/users')
  redirect(`/admin/users?ok=${encodeURIComponent('Usuário atualizado.')}`)
}

// A3 — desativar = ban via Admin API (nunca deletar: histórico/comentários
// apontam para o profile). Reativar = ban 'none'.
export async function setUserActive(formData: FormData) {
  const { user } = await requireTeam()
  const id = String(formData.get('id'))
  const activate = String(formData.get('activate')) === 'true'
  if (id === user.id) backWithError('Você não pode desativar a própria conta.')

  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.')
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: activate ? 'none' : '87600h', // ~10 anos
  })
  if (error) backWithError(`Erro: ${error.message}`)

  revalidatePath('/admin/users')
  redirect(`/admin/users?ok=${encodeURIComponent(activate ? 'Usuário reativado.' : 'Usuário desativado.')}`)
}
