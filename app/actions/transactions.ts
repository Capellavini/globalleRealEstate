'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STEP_TEMPLATES, type TransactionStatus, type TransactionThesis } from '@/lib/admin/types'

export async function createTransaction(formData: FormData) {
  const client_name = String(formData.get('client_name') ?? '').trim()
  const thesis = String(formData.get('thesis') ?? '') as TransactionThesis
  const target_close_date = String(formData.get('target_close_date') ?? '') || null

  if (!client_name || !STEP_TEMPLATES[thesis]) {
    throw new Error('Nome do cliente e tese são obrigatórios.')
  }

  const supabase = createClient()

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({ client_name, thesis, target_close_date })
    .select('id')
    .single()

  if (error) throw new Error(`Erro ao criar transação: ${error.message}`)

  // Clona o template de etapas da tese escolhida.
  const steps = STEP_TEMPLATES[thesis].map((step, i) => ({
    transaction_id: transaction.id,
    title: step.title,
    description: step.description,
    order_index: i + 1,
  }))

  const { error: stepsError } = await supabase.from('steps').insert(steps)
  if (stepsError) throw new Error(`Erro ao criar etapas: ${stepsError.message}`)

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
