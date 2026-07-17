'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { requireTeam, requireUser } from '@/lib/supabase/roles'

// Registra o documento após o upload (feito no browser para o bucket privado).
// O RLS garante: participante só insere nas suas transações e nunca interno.
export async function registerTransactionDocument(formData: FormData) {
  const { user } = await requireUser()
  const transaction_id = String(formData.get('transaction_id'))
  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim() || null
  const storage_path = String(formData.get('storage_path'))
  if (!name || !storage_path) throw new Error('Documento sem nome ou caminho.')

  const supabase = createClient()
  const { error } = await supabase.from('transaction_documents').insert({
    transaction_id,
    name,
    category,
    storage_path,
    is_internal: false, // uploads nunca nascem internos; equipe marca depois
    uploaded_by: user.id,
  })
  if (error) throw new Error(`Erro ao registrar documento: ${error.message}`)

  const path = String(formData.get('revalidate') ?? '')
  if (path) revalidatePath(path)
}

// Download SEMPRE por URL assinada: o select com o client do usuário valida o
// acesso via RLS (participação + is_internal); a assinatura usa a service key.
export async function getDocumentDownloadUrl(docId: string): Promise<{ url: string }> {
  await requireUser()

  const supabase = createClient()
  const { data: doc } = await supabase
    .from('transaction_documents')
    .select('storage_path')
    .eq('id', docId)
    .maybeSingle()
  if (!doc) throw new Error('Documento não encontrado ou sem acesso.')

  if (!isAdminConfigured()) throw new Error('Download indisponível: chave de administração não configurada.')
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from('transaction-docs').createSignedUrl(doc.storage_path, 60)
  if (error || !data?.signedUrl) throw new Error(`Erro ao gerar link: ${error?.message ?? 'sem URL'}`)

  return { url: data.signedUrl }
}

export async function toggleDocumentInternal(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const makeInternal = String(formData.get('make_internal')) === 'true'

  const supabase = createClient()
  const { error } = await supabase.from('transaction_documents').update({ is_internal: makeInternal }).eq('id', id)
  if (error) throw new Error(`Erro ao alterar visibilidade: ${error.message}`)

  const path = String(formData.get('revalidate') ?? '')
  if (path) revalidatePath(path)
}

export async function deleteTransactionDocument(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))

  const supabase = createClient()
  const { data: doc } = await supabase.from('transaction_documents').select('storage_path').eq('id', id).maybeSingle()
  const { error } = await supabase.from('transaction_documents').delete().eq('id', id)
  if (error) throw new Error(`Erro ao excluir documento: ${error.message}`)

  if (doc && isAdminConfigured()) {
    const admin = createAdminClient()
    await admin.storage.from('transaction-docs').remove([doc.storage_path])
  }

  const path = String(formData.get('revalidate') ?? '')
  if (path) revalidatePath(path)
}
