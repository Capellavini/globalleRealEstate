'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { NEXT_DOC_STATUS, type DocumentStatus } from '@/lib/admin/types'

export async function createDocument(formData: FormData) {
  const transactionId = String(formData.get('transaction_id'))
  const name = String(formData.get('name') ?? '').trim()
  const due_date = String(formData.get('due_date') ?? '') || null
  if (!name) return

  const supabase = createClient()
  const { error } = await supabase
    .from('documents')
    .insert({ transaction_id: transactionId, name, due_date })
  if (error) throw new Error(`Erro ao adicionar documento: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}

export async function cycleDocumentStatus(formData: FormData) {
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))
  const current = String(formData.get('current')) as DocumentStatus

  const next = NEXT_DOC_STATUS[current] ?? 'pending'
  const supabase = createClient()
  const { error } = await supabase
    .from('documents')
    .update({ status: next, uploaded_at: next === 'received' ? new Date().toISOString() : undefined })
    .eq('id', id)
  if (error) throw new Error(`Erro ao atualizar documento: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}

export async function attachFile(formData: FormData) {
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))
  const file_url = String(formData.get('file_url') ?? '').trim() || null

  const supabase = createClient()
  const { error } = await supabase.from('documents').update({ file_url }).eq('id', id)
  if (error) throw new Error(`Erro ao anexar arquivo: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))

  const supabase = createClient()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw new Error(`Erro ao excluir documento: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}
