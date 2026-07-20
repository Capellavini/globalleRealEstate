'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STEP_TEMPLATES, type TransactionStatus, type TransactionThesis } from '@/lib/admin/types'
import { instantiateProcessSteps, processCountryForThesis } from '@/lib/transactions/process'

export async function createTransaction(formData: FormData) {
  const client_name = String(formData.get('client_name') ?? '').trim()
  const thesis = String(formData.get('thesis') ?? '') as TransactionThesis
  // target_close_date saiu do formulário (Fase 1.5); a coluna segue no banco.

  if (!client_name || !STEP_TEMPLATES[thesis]) {
    throw new Error('Nome do cliente e tese são obrigatórios.')
  }

  const supabase = createClient()

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({ client_name, thesis })
    .select('id')
    .single()

  if (error) throw new Error(`Erro ao criar transação: ${error.message}`)

  // Parte D: etapas de processo do país escolhido no formulário.
  // (As 4 etapas antigas de advisory foram aposentadas junto com a UI delas.)
  const processCountry = String(formData.get('process_country') ?? '') || processCountryForThesis(thesis)
  await instantiateProcessSteps(supabase, transaction.id, processCountry)

  revalidatePath('/admin')
  redirect(`/admin/transactions/${transaction.id}`)
}

export async function updateTransactionStatus(formData: FormData) {
  const id = String(formData.get('id'))
  const status = String(formData.get('status')) as TransactionStatus

  const supabase = createClient()
  const { error } = await supabase.from('transactions').update({ status }).eq('id', id)
  if (error) throw new Error(`Erro ao atualizar status: ${error.message}`)

  revalidatePath('/admin')
  revalidatePath(`/admin/transactions/${id}`)
}

export async function updateTransactionNotes(formData: FormData) {
  const id = String(formData.get('id'))
  const notes = String(formData.get('notes') ?? '').trim() || null

  const supabase = createClient()
  const { error } = await supabase.from('transactions').update({ notes }).eq('id', id)
  if (error) throw new Error(`Erro ao salvar notas: ${error.message}`)

  revalidatePath(`/admin/transactions/${id}`)
}

export async function deleteTransaction(formData: FormData) {
  const id = String(formData.get('id'))

  const supabase = createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(`Erro ao excluir transação: ${error.message}`)

  revalidatePath('/admin')
  redirect('/admin')
}
