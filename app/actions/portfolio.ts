'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireTeam, requireUser } from '@/lib/supabase/roles'
import { STEP_TEMPLATES, type TransactionThesis } from '@/lib/admin/types'
import type { FitValue, PortfolioStatus } from '@/lib/portfolio/types'

const VALID_STATUSES: PortfolioStatus[] = ['novo', 'favorito', 'em_analise', 'descartado', 'avancar']

function revalidateBoards(thesisId: string) {
  revalidatePath('/portfolio')
  revalidatePath(`/admin/portfolios/${thesisId}`)
}

// Move um card no kanban (cliente e equipe). Só muda status + grava histórico —
// a restrição de coluna do cliente é garantida aqui (nunca outra coluna do row).
export async function moveItem(itemId: string, toStatus: PortfolioStatus, reason?: string) {
  const { user } = await requireUser()
  if (!VALID_STATUSES.includes(toStatus)) throw new Error('Status inválido.')

  const supabase = createClient()
  const { data: item, error: readError } = await supabase
    .from('portfolio_items')
    .select('id, thesis_id, status')
    .eq('id', itemId)
    .single()
  if (readError || !item) throw new Error('Imóvel não encontrado no portfólio.')
  if (item.status === toStatus) return

  const { error } = await supabase.from('portfolio_items').update({ status: toStatus }).eq('id', itemId)
  if (error) throw new Error(`Erro ao mover: ${error.message}`)

  const { error: histError } = await supabase.from('status_history').insert({
    portfolio_item_id: itemId,
    from_status: item.status,
    to_status: toStatus,
    reason: reason?.trim() || null,
    changed_by: user.id,
  })
  if (histError) throw new Error(`Movido, mas erro no histórico: ${histError.message}`)

  revalidateBoards(item.thesis_id)
}

// Equipe confirma o avanço: cria a transação no Transaction Room existente,
// copiando os dados do imóvel e vinculando property_id.
export async function confirmAdvance(itemId: string, transactionThesis: TransactionThesis) {
  const { user } = await requireTeam()
  if (!STEP_TEMPLATES[transactionThesis]) throw new Error('Tese de transação inválida.')

  const supabase = createClient()

  const { data: item, error: readError } = await supabase
    .from('portfolio_items')
    .select('id, thesis_id, status, properties(*), theses(id, title, client_id, profiles(full_name))')
    .eq('id', itemId)
    .single()
  if (readError || !item) throw new Error('Imóvel não encontrado no portfólio.')

  const property = item.properties as any
  const thesis = item.theses as any
  const clientName: string = thesis?.profiles?.full_name ?? 'Cliente'

  const notes = [
    `Origem: portfólio — tese "${thesis?.title ?? ''}".`,
    `Imóvel: ${property.title} — ${property.city}, ${property.country_code}.`,
    property.address ? `Endereço: ${property.address}.` : null,
    `Preço pedido: ${property.currency} ${Number(property.asking_price).toLocaleString('pt-BR')}.`,
    property.listing_url ? `Anúncio: ${property.listing_url}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      client_name: clientName,
      thesis: transactionThesis,
      notes,
      property_id: property.id,
    })
    .select('id')
    .single()
  if (error) throw new Error(`Erro ao criar transação: ${error.message}`)

  const steps = STEP_TEMPLATES[transactionThesis].map((step, i) => ({
    transaction_id: transaction.id,
    title: step.title,
    description: step.description,
    order_index: i + 1,
  }))
  const { error: stepsError } = await supabase.from('steps').insert(steps)
  if (stepsError) throw new Error(`Transação criada, mas erro nas etapas: ${stepsError.message}`)

  if (item.status !== 'avancar') {
    await supabase.from('portfolio_items').update({ status: 'avancar' }).eq('id', itemId)
    await supabase.from('status_history').insert({
      portfolio_item_id: itemId,
      from_status: item.status,
      to_status: 'avancar',
      reason: 'Avanço confirmado pela equipe — transação criada.',
      changed_by: user.id,
    })
  } else {
    await supabase.from('status_history').insert({
      portfolio_item_id: itemId,
      from_status: 'avancar',
      to_status: 'avancar',
      reason: 'Avanço confirmado pela equipe — transação criada.',
      changed_by: user.id,
    })
  }

  revalidateBoards(item.thesis_id)
  revalidatePath('/admin')
  redirect(`/admin/transactions/${transaction.id}`)
}

export async function removeItem(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const supabase = createClient()

  const { data: item } = await supabase.from('portfolio_items').select('thesis_id').eq('id', id).single()
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw new Error(`Erro ao remover do portfólio: ${error.message}`)

  if (item) revalidateBoards(item.thesis_id)
}

export async function addComment(formData: FormData) {
  const { user } = await requireUser()
  const itemId = String(formData.get('portfolio_item_id'))
  const body = String(formData.get('body') ?? '').trim()
  if (!body) return

  const supabase = createClient()
  const { error } = await supabase
    .from('comments')
    .insert({ portfolio_item_id: itemId, author_id: user.id, body })
  if (error) throw new Error(`Erro ao comentar: ${error.message}`)

  const path = String(formData.get('revalidate') ?? '')
  if (path) revalidatePath(path)
}

// Fit manual por critério (✓ / ~ / ✗ + nota) — só equipe.
export async function setCriterionFit(formData: FormData) {
  const { user } = await requireTeam()
  const itemId = String(formData.get('portfolio_item_id'))
  const criterionId = String(formData.get('criterion_id'))
  const fit = String(formData.get('fit')) as FitValue
  const note = String(formData.get('note') ?? '').trim() || null
  if (!['sim', 'parcial', 'nao'].includes(fit)) throw new Error('Valor de fit inválido.')

  const supabase = createClient()
  const { error } = await supabase.from('criterion_fits').upsert(
    {
      portfolio_item_id: itemId,
      criterion_id: criterionId,
      fit,
      note,
      assessed_by: user.id,
      assessed_at: new Date().toISOString(),
    },
    { onConflict: 'portfolio_item_id,criterion_id' }
  )
  if (error) throw new Error(`Erro ao salvar fit: ${error.message}`)

  const path = String(formData.get('revalidate') ?? '')
  if (path) revalidatePath(path)
}
