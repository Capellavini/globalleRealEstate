'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireTeam } from '@/lib/supabase/roles'
import type { ProcessStepStatus } from '@/lib/transactions/types'

const STEP_STATUSES: ProcessStepStatus[] = ['pendente', 'em_andamento', 'concluida', 'nao_se_aplica']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function revalidateTx(transactionId: string) {
  revalidatePath(`/admin/transactions/${transactionId}`)
  revalidatePath(`/transacoes/${transactionId}`)
  revalidatePath('/admin')
  revalidatePath('/transacoes')
}

// Muda o status da etapa. Ao concluir, a próxima pendente vira em_andamento
// automaticamente (ajuste manual sempre possível — processos não são lineares).
export async function setProcessStepStatus(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const status = String(formData.get('status')) as ProcessStepStatus
  if (!STEP_STATUSES.includes(status)) throw new Error('Status inválido.')

  const supabase = createClient()
  const { data: step } = await supabase
    .from('transaction_steps')
    .select('id, transaction_id, sort_order, started_at')
    .eq('id', id)
    .maybeSingle()
  if (!step) throw new Error('Etapa não encontrada.')

  const patch: Record<string, unknown> = { status }
  if (status === 'em_andamento' && !step.started_at) patch.started_at = today()
  if (status === 'concluida') {
    if (!step.started_at) patch.started_at = today()
    patch.completed_at = today()
  }
  if (status === 'pendente' || status === 'nao_se_aplica') patch.completed_at = null

  const { error } = await supabase.from('transaction_steps').update(patch).eq('id', id)
  if (error) throw new Error(`Erro ao atualizar etapa: ${error.message}`)

  if (status === 'concluida') {
    const { data: next } = await supabase
      .from('transaction_steps')
      .select('id, started_at')
      .eq('transaction_id', step.transaction_id)
      .eq('status', 'pendente')
      .gt('sort_order', step.sort_order)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    if (next) {
      await supabase
        .from('transaction_steps')
        .update({ status: 'em_andamento', started_at: next.started_at ?? today() })
        .eq('id', next.id)
    }
  }

  revalidateTx(step.transaction_id)
}

export async function updateProcessStepDetails(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))

  const supabase = createClient()
  const { error } = await supabase
    .from('transaction_steps')
    .update({
      started_at: String(formData.get('started_at') ?? '') || null,
      completed_at: String(formData.get('completed_at') ?? '') || null,
      notes: String(formData.get('notes') ?? '').trim() || null,
    })
    .eq('id', id)
  if (error) throw new Error(`Erro ao salvar etapa: ${error.message}`)

  revalidateTx(transactionId)
}

/* ── Custos por etapa (team-only, RLS idem) ── */

export async function addStepCost(formData: FormData) {
  const { user } = await requireTeam()
  const transaction_id = String(formData.get('transaction_id'))
  const step_id = String(formData.get('step_id'))
  const label = String(formData.get('label') ?? '').trim()
  const amount = Number(String(formData.get('amount') ?? '').replace(',', '.'))
  const paid_by = String(formData.get('paid_by'))
  if (!label || !Number.isFinite(amount)) throw new Error('Rótulo e valor são obrigatórios.')
  if (!['cliente_direto', 'via_globalle'].includes(paid_by)) throw new Error('Pagador inválido.')

  const supabase = createClient()
  const { error } = await supabase.from('transaction_costs_v2').insert({
    transaction_id,
    step_id,
    label,
    amount,
    currency: String(formData.get('currency') ?? 'EUR').toUpperCase(),
    paid_by,
    status: 'estimado',
    created_by: user.id,
  })
  if (error) throw new Error(`Erro ao lançar custo: ${error.message}`)

  revalidateTx(transaction_id)
}

export async function cycleCostStatus(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))
  const next = String(formData.get('next'))
  if (!['estimado', 'confirmado', 'pago'].includes(next)) throw new Error('Status inválido.')

  const supabase = createClient()
  const { error } = await supabase
    .from('transaction_costs_v2')
    .update({ status: next, paid_at: next === 'pago' ? today() : null })
    .eq('id', id)
  if (error) throw new Error(`Erro: ${error.message}`)

  revalidateTx(transactionId)
}

export async function deleteStepCost(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))

  const supabase = createClient()
  const { error } = await supabase.from('transaction_costs_v2').delete().eq('id', id)
  if (error) throw new Error(`Erro: ${error.message}`)

  revalidateTx(transactionId)
}

/* ── Receita Globalle (team-only, sem exceção) ── */

export async function addRevenue(formData: FormData) {
  await requireTeam()
  const transaction_id = String(formData.get('transaction_id'))
  const label = String(formData.get('label') ?? '').trim()
  const amount = Number(String(formData.get('amount') ?? '').replace(',', '.'))
  if (!label || !Number.isFinite(amount)) throw new Error('Rótulo e valor são obrigatórios.')

  const supabase = createClient()
  const { error } = await supabase.from('transaction_revenues').insert({
    transaction_id,
    step_id: String(formData.get('step_id') ?? '') || null,
    label,
    amount,
    currency: String(formData.get('currency') ?? 'EUR').toUpperCase(),
    status: 'previsto',
    expected_at: String(formData.get('expected_at') ?? '') || null,
  })
  if (error) throw new Error(`Erro ao lançar receita: ${error.message}`)

  revalidateTx(transaction_id)
}

export async function cycleRevenueStatus(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))
  const next = String(formData.get('next'))
  if (!['previsto', 'faturado', 'recebido'].includes(next)) throw new Error('Status inválido.')

  const supabase = createClient()
  const { error } = await supabase
    .from('transaction_revenues')
    .update({ status: next, received_at: next === 'recebido' ? today() : null })
    .eq('id', id)
  if (error) throw new Error(`Erro: ${error.message}`)

  revalidateTx(transactionId)
}

export async function deleteRevenue(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const transactionId = String(formData.get('transaction_id'))

  const supabase = createClient()
  const { error } = await supabase.from('transaction_revenues').delete().eq('id', id)
  if (error) throw new Error(`Erro: ${error.message}`)

  revalidateTx(transactionId)
}
