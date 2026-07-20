'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { requireTeam } from '@/lib/supabase/roles'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://globalleinsights.com'
const INVITE_REDIRECT = `${SITE_URL}/auth/set-password`

function backWithError(message: string, to = '/admin/users'): never {
  redirect(`${to}?erro=${encodeURIComponent(message)}`)
}

// A4 — cria usuário por convite (Supabase envia o e-mail; usuário define a
// senha em /auth/set-password). Cliente cai direto no dossiê para definir a
// tese em seguida — a criação nunca fica solta, é o início do processo.
export async function inviteUser(formData: FormData) {
  await requireTeam()
  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.')

  const full_name = String(formData.get('full_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const roleRaw = String(formData.get('role'))
  const role = ['team', 'client', 'lawyer'].includes(roleRaw) ? roleRaw : 'client'
  if (!full_name || !email) backWithError('Nome e e-mail são obrigatórios.')

  const admin = createAdminClient()

  // "Criar sem convite": conta gerenciada — nasce no Supabase mas nenhum
  // e-mail sai. O botão "Reenviar convite" (status Pendente) convida depois.
  const managed = String(formData.get('managed')) === 'on'

  const { data, error } = managed
    ? await admin.auth.admin.createUser({ email, user_metadata: { full_name } })
    : await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name },
        redirectTo: INVITE_REDIRECT,
      })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already') || error.status === 422) {
      backWithError('Este e-mail já tem conta.')
    }
    backWithError(`Erro ao ${managed ? 'criar' : 'convidar'}: ${error.message}`)
  }

  const userId = data.user!.id

  // O trigger handle_new_user já criou o profile (role client) — o upsert
  // garante o nome e aplica o papel escolhido.
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: userId, full_name, role }, { onConflict: 'id' })
  if (profileError) backWithError(`Convite enviado, mas erro no perfil: ${profileError.message}`)

  revalidatePath('/admin/users')

  // Cliente: o processo continua no dossiê (definir a tese vem a seguir).
  // Team/lawyer não têm dossiê — ficam na gestão de contas.
  if (role === 'client') {
    revalidatePath('/admin/clientes')
    redirect(
      `/admin/clientes/${userId}?ok=${encodeURIComponent(
        managed ? 'Perfil criado sem convite — defina a tese abaixo.' : 'Convite enviado — defina a tese abaixo.'
      )}`
    )
  }
  redirect(
    `/admin/users?ok=${encodeURIComponent(
      managed ? `Perfil de ${full_name} criado sem convite (gerenciado pela equipe).` : `Convite enviado para ${email}.`
    )}`
  )
}

// A3 — reenviar convite a usuário pendente. Tenta reenviar o e-mail; se a lib
// recusar (usuário já registrado), gera o link de convite para envio manual.
export async function resendInvite(formData: FormData) {
  await requireTeam()
  const redirectTo = String(formData.get('redirect_to') ?? '') || '/admin/users'
  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.', redirectTo)
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: INVITE_REDIRECT })
  if (!error) {
    redirect(`${redirectTo}?ok=${encodeURIComponent(`Convite reenviado para ${email}.`)}`)
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: INVITE_REDIRECT },
  })
  if (linkError || !linkData.properties?.action_link) {
    backWithError(`Não consegui reenviar: ${linkError?.message ?? error.message}`, redirectTo)
  }
  // Link de uso único — mostrado à equipe para envio manual (WhatsApp/e-mail).
  redirect(
    `${redirectTo}?link=${encodeURIComponent(linkData.properties.action_link)}&link_email=${encodeURIComponent(email)}`
  )
}

export async function updateUserProfile(formData: FormData) {
  const { user } = await requireTeam()
  const id = String(formData.get('id'))
  const redirectTo = String(formData.get('redirect_to') ?? '') || '/admin/users'
  const full_name = String(formData.get('full_name') ?? '').trim()
  const roleRaw = String(formData.get('role'))
  const role = ['team', 'client', 'lawyer'].includes(roleRaw) ? roleRaw : 'client'
  if (!full_name) backWithError('O nome não pode ficar vazio.', redirectTo)
  if (id === user.id && role !== 'team') backWithError('Você não pode rebaixar o próprio papel.', redirectTo)

  // Linha de advisory (etiqueta comercial) — '' = sem linha.
  const advisoryRaw = String(formData.get('advisory_line') ?? '')
  const advisory_line = ['renda_euro', 'yield_real_brasil', 'cidadania_patrimonio'].includes(advisoryRaw)
    ? advisoryRaw
    : null

  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.', redirectTo)
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ full_name, role, advisory_line }).eq('id', id)
  if (error) backWithError(`Erro ao salvar: ${error.message}`, redirectTo)

  await admin.auth.admin.updateUserById(id, { user_metadata: { full_name } })

  revalidatePath('/admin/users')
  revalidatePath(redirectTo)
  redirect(`${redirectTo}?ok=${encodeURIComponent('Perfil atualizado.')}`)
}

// A3 — desativar = ban via Admin API (nunca deletar: histórico/comentários
// apontam para o profile). Reativar = ban 'none'.
export async function setUserActive(formData: FormData) {
  const { user } = await requireTeam()
  const id = String(formData.get('id'))
  const redirectTo = String(formData.get('redirect_to') ?? '') || '/admin/users'
  const activate = String(formData.get('activate')) === 'true'
  if (id === user.id) backWithError('Você não pode desativar a própria conta.', redirectTo)

  if (!isAdminConfigured()) backWithError('SUPABASE_SERVICE_ROLE_KEY não configurada.', redirectTo)
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, {
    ban_duration: activate ? 'none' : '87600h', // ~10 anos
  })
  if (error) backWithError(`Erro: ${error.message}`, redirectTo)

  revalidatePath('/admin/users')
  revalidatePath(redirectTo)
  redirect(`${redirectTo}?ok=${encodeURIComponent(activate ? 'Usuário reativado.' : 'Usuário desativado.')}`)
}
