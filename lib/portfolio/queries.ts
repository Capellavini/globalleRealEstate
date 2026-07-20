import { createClient } from '@/lib/supabase/server'
import { estimateAcquisitionCosts, type CostRule } from '@/lib/costs/engine'
import type { KanbanCard } from '@/components/portfolio/KanbanBoard'
import type { Property, Thesis, ThesisCriterion } from '@/lib/portfolio/types'

export type KanbanData = {
  thesis: Thesis
  clientName: string
  criteria: ThesisCriterion[]
  cards: KanbanCard[]
}

export async function getCostRules(): Promise<CostRule[]> {
  const supabase = createClient()
  const { data } = await supabase.from('cost_rules').select('*')
  return (data ?? []) as CostRule[]
}

export function estimateForProperty(property: Property, objective: string, rules: CostRule[]) {
  return estimateAcquisitionCosts({
    askingPrice: Number(property.asking_price),
    currency: property.currency,
    countryCode: property.country_code,
    municipality: property.municipality,
    objective,
    rules,
  })
}

export async function getKanbanData(thesisId: string, viewerId: string): Promise<KanbanData | null> {
  const supabase = createClient()

  const { data: thesis } = await supabase
    .from('theses')
    .select('*, profiles!theses_client_id_fkey(full_name)')
    .eq('id', thesisId)
    .maybeSingle()
  if (!thesis) return null

  const [{ data: criteria }, { data: items }, rules] = await Promise.all([
    supabase.from('thesis_criteria').select('*').eq('thesis_id', thesisId).order('sort_order'),
    supabase
      .from('portfolio_items')
      .select('*, properties(*)')
      .eq('thesis_id', thesisId)
      .order('created_at'),
    getCostRules(),
  ])

  const itemIds = (items ?? []).map((i) => i.id)
  const fitsByItem = new Map<string, { yes: number; total: number }>()
  const commentsByItem = new Map<string, number>()
  const unreadByItem = await getUnreadByItem(itemIds, viewerId)

  if (itemIds.length) {
    const [{ data: fits }, { data: comments }] = await Promise.all([
      supabase.from('criterion_fits').select('portfolio_item_id, fit').in('portfolio_item_id', itemIds),
      supabase.from('comments').select('portfolio_item_id').in('portfolio_item_id', itemIds),
    ])
    for (const f of fits ?? []) {
      const cur = fitsByItem.get(f.portfolio_item_id) ?? { yes: 0, total: 0 }
      cur.total += 1
      if (f.fit === 'sim') cur.yes += 1
      fitsByItem.set(f.portfolio_item_id, cur)
    }
    for (const c of comments ?? []) {
      commentsByItem.set(c.portfolio_item_id, (commentsByItem.get(c.portfolio_item_id) ?? 0) + 1)
    }
  }

  const criteriaCount = (criteria ?? []).length

  const cards: KanbanCard[] = (items ?? []).map((item) => {
    const property = item.properties as Property
    const estimate = estimateForProperty(property, thesis.objective, rules)
    const fit = fitsByItem.get(item.id)
    return {
      itemId: item.id,
      propertyId: property.id,
      status: item.status,
      title: property.title,
      city: property.city,
      countryCode: property.country_code,
      price: Number(property.asking_price),
      currency: property.currency,
      grandTotal: estimate.lines.length ? estimate.grandTotal : null,
      coverUrl: property.cover_photo_url,
      bedrooms: property.bedrooms,
      areaM2: property.area_m2,
      propertyType: property.property_type,
      fitYes: fit?.yes ?? 0,
      fitTotal: criteriaCount,
      commentCount: commentsByItem.get(item.id) ?? 0,
      unreadCount: unreadByItem.get(item.id) ?? 0,
    }
  })

  return {
    thesis: thesis as Thesis,
    clientName: (thesis as any).profiles?.full_name ?? '—',
    criteria: (criteria ?? []) as ThesisCriterion[],
    cards,
  }
}

// Mensagens de outra pessoa, ainda não marcadas como lidas por `viewerId`,
// por portfolio_item — usado pelos badges do kanban e pelo contador global.
async function getUnreadByItem(itemIds: string[], viewerId: string): Promise<Map<string, number>> {
  const unread = new Map<string, number>()
  if (!itemIds.length) return unread

  const supabase = createClient()
  const [{ data: comments }, { data: reads }] = await Promise.all([
    supabase
      .from('comments')
      .select('portfolio_item_id, author_id, created_at')
      .in('portfolio_item_id', itemIds)
      .neq('author_id', viewerId),
    supabase.from('comment_reads').select('portfolio_item_id, last_read_at').eq('user_id', viewerId).in('portfolio_item_id', itemIds),
  ])

  const readAtByItem = new Map((reads ?? []).map((r) => [r.portfolio_item_id, r.last_read_at as string]))
  for (const c of comments ?? []) {
    const readAt = readAtByItem.get(c.portfolio_item_id)
    if (!readAt || c.created_at > readAt) {
      unread.set(c.portfolio_item_id, (unread.get(c.portfolio_item_id) ?? 0) + 1)
    }
  }
  return unread
}

// Total de mensagens não lidas do usuário — cliente: só as próprias teses;
// equipe: todos os portfólios (vê tudo via RLS).
export async function getUnreadCommentsTotal(viewerId: string, isTeam: boolean): Promise<number> {
  const supabase = createClient()

  let itemIds: string[]
  if (isTeam) {
    const { data: items } = await supabase.from('portfolio_items').select('id')
    itemIds = (items ?? []).map((i) => i.id)
  } else {
    const { data: theses } = await supabase.from('theses').select('id').eq('client_id', viewerId)
    const thesisIds = (theses ?? []).map((t) => t.id)
    if (!thesisIds.length) return 0
    const { data: items } = await supabase.from('portfolio_items').select('id').in('thesis_id', thesisIds)
    itemIds = (items ?? []).map((i) => i.id)
  }
  if (!itemIds.length) return 0

  const unreadByItem = await getUnreadByItem(itemIds, viewerId)
  let total = 0
  for (const n of unreadByItem.values()) total += n
  return total
}
