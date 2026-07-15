'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { NEXT_STEP_STATUS, type StepStatus } from '@/lib/admin/types'

export async function cycleStepStatus(formData: FormData) {
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))
  const current = String(formData.get('current')) as StepStatus

  const supabase = createClient()
  const { error } = await supabase
    .from('steps')
    .update({ status: NEXT_STEP_STATUS[current] ?? 'pending' })
    .eq('id', id)
  if (error) throw new Error(`Erro ao atualizar etapa: ${error.message}`)

  revalidatePath('/admin')
  revalidatePath(`/admin/transactions/${transactionId}`)
}

export async function updateStep(formData: FormData) {
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))
  const description = String(formData.get('description') ?? '').trim() || null
  const due_date = String(formData.get('due_date') ?? '') || null

  const supabase = createClient()
  const { error } = await supabase.from('steps').update({ description, due_date }).eq('id', id)
  if (error) throw new Error(`Erro ao salvar etapa: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}

export async function createStep(formData: FormData) {
  const transactionId = String(formData.get('transaction_id'))
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return

  const supabase = createClient()

  const { data: last } = await supabase
    .from('steps')
    .select('order_index')
    .eq('transaction_id', transactionId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('steps').insert({
    transaction_id: transactionId,
    title,
    order_index: (last?.order_index ?? 0) + 1,
  })
  if (error) throw new Error(`Erro ao criar etapa: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}

export async function deleteStep(formData: FormData) {
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))

  const supabase = createClient()
  const { error } = await supabase.from('steps').delete().eq('id', id)
  if (error) throw new Error(`Erro ao excluir etapa: ${error.message}`)

  revalidatePath(`/admin/transactions/${transactionId}`)
}
