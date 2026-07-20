import { createClient } from '@/lib/supabase/server'

export type HistoryEntry = {
  id: string
  at: string
  kind: 'status' | 'comment' | 'tx_comment' | 'document' | 'step'
  text: string
}

// Agrega status_history + comentários (portfólio e transação) + uploads de
// documento + conclusão de etapas — tudo do cliente, numa linha do tempo só.
export async function getClientHistory(clientId: string): Promise<HistoryEntry[]> {
  const supabase = createClient()
  const entries: HistoryEntry[] = []

  const { data: theses } = await supabase.from('theses').select('id').eq('client_id', clientId)
  const thesisIds = (theses ?? []).map((t) => t.id)

  const { data: transactions } = await supabase.from('transactions').select('id').eq('client_id', clientId)
  const txIds = (transactions ?? []).map((t) => t.id)

  if (thesisIds.length) {
    const { data: items } = await supabase
      .from('portfolio_items')
      .select('id, properties(title)')
      .in('thesis_id', thesisIds)
    const itemIds = (items ?? []).map((i) => i.id)
    const propertyByItem = new Map((items ?? []).map((i) => [i.id, (i.properties as any)?.title ?? 'imóvel']))

    if (itemIds.length) {
      const { data: history } = await supabase
        .from('status_history')
        .select('id, portfolio_item_id, from_status, to_status, reason, changed_at, profiles(full_name)')
        .in('portfolio_item_id', itemIds)
      for (const h of history ?? []) {
        const property = propertyByItem.get(h.portfolio_item_id) ?? 'imóvel'
        const author = (h as any).profiles?.full_name ?? '—'
        const move = h.from_status ? `${h.from_status} → ${h.to_status}` : h.to_status
        entries.push({
          id: `status-${h.id}`,
          at: h.changed_at,
          kind: 'status',
          text: `${author} moveu "${property}": ${move}${h.reason ? ` — “${h.reason}”` : ''}`,
        })
      }

      const { data: comments } = await supabase
        .from('comments')
        .select('id, portfolio_item_id, body, created_at, profiles(full_name)')
        .in('portfolio_item_id', itemIds)
      for (const c of comments ?? []) {
        const property = propertyByItem.get(c.portfolio_item_id) ?? 'imóvel'
        const author = (c as any).profiles?.full_name ?? '—'
        entries.push({
          id: `comment-${c.id}`,
          at: c.created_at,
          kind: 'comment',
          text: `${author} comentou em "${property}": ${c.body}`,
        })
      }
    }
  }

  if (txIds.length) {
    const { data: steps } = await supabase
      .from('transaction_steps')
      .select('id, name, completed_at')
      .in('transaction_id', txIds)
      .eq('status', 'concluida')
      .not('completed_at', 'is', null)
    for (const s of steps ?? []) {
      entries.push({ id: `step-${s.id}`, at: s.completed_at as string, kind: 'step', text: `Etapa concluída: ${s.name}` })
    }

    const { data: docs } = await supabase
      .from('transaction_documents')
      .select('id, name, is_internal, created_at, profiles(full_name)')
      .in('transaction_id', txIds)
    for (const d of docs ?? []) {
      const author = (d as any).profiles?.full_name ?? '—'
      entries.push({
        id: `doc-${d.id}`,
        at: d.created_at,
        kind: 'document',
        text: `${author} enviou o documento "${d.name}"${d.is_internal ? ' (interno)' : ''}`,
      })
    }

    const { data: txComments } = await supabase
      .from('transaction_comments')
      .select('id, body, created_at, profiles(full_name)')
      .in('transaction_id', txIds)
    for (const c of txComments ?? []) {
      const author = (c as any).profiles?.full_name ?? '—'
      entries.push({ id: `txcomment-${c.id}`, at: c.created_at, kind: 'tx_comment', text: `${author} comentou na transação: ${c.body}` })
    }
  }

  return entries.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 60)
}
