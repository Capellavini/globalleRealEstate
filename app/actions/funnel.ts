'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireTeam } from '@/lib/supabase/roles'
import { updateTransactionStatus } from './transactions'
import { setProcessStepStatus } from './process-steps'

// Transições alcançáveis por arrastar no Funil. As colunas Lead/Tese
// definida/Buscando imóveis não têm uma ação única (exigem criar tese ou
// escolher um imóvel) — só acontecem pelo fluxo normal no dossiê.
const REACHABLE: Record<string, string[]> = {
  Proposta: ['Due Diligence', 'Fechado', 'Perdido'],
  'Due Diligence': ['Fechado', 'Perdido'],
  Fechado: ['Due Diligence'],
  Perdido: ['Due Diligence'],
}

export async function moveFunnelCard(clientId: string, from: string, to: string): Promise<void> {
  await requireTeam()
  if (from === to) return
  if (!REACHABLE[from]?.includes(to)) {
    throw new Error('Essa mudança precisa ser feita no dossiê do cliente.')
  }

  const supabase = createClient()
  const { data: txs } = await supabase
    .from('transactions')
    .select('id, status, transaction_steps(id, name, sort_order, status)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  const active = (txs ?? []).find((t) => t.status === 'active')
  const relevant = active ?? (txs ?? [])[0] // sem ativa: a mais recente (fechada/perdida)
  if (!relevant) throw new Error('Cliente sem transação para mover.')

  if (to === 'Fechado') {
    const fd = new FormData()
    fd.set('id', relevant.id)
    fd.set('status', 'closed')
    await updateTransactionStatus(fd)
  } else if (to === 'Perdido') {
    const fd = new FormData()
    fd.set('id', relevant.id)
    fd.set('status', 'cancelled')
    await updateTransactionStatus(fd)
  } else if (to === 'Due Diligence' && (from === 'Fechado' || from === 'Perdido')) {
    const fd = new FormData()
    fd.set('id', relevant.id)
    fd.set('status', 'active')
    await updateTransactionStatus(fd)
  } else if (to === 'Due Diligence' && from === 'Proposta') {
    const steps = (relevant.transaction_steps ?? []) as { id: string; sort_order: number; status: string }[]
    const current = [...steps].sort((a, b) => a.sort_order - b.sort_order).find((s) => s.status === 'em_andamento')
    if (!current) throw new Error('Etapa atual não encontrada.')
    const fd = new FormData()
    fd.set('id', current.id)
    fd.set('status', 'concluida')
    await setProcessStepStatus(fd)
  }

  revalidatePath('/admin/funil')
  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${clientId}`)
}
