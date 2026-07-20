// Tipos do Transaction Room com participantes (Fase 2+3).
// Espelham supabase/migration-fase23.sql.

export type ParticipantRole = 'client' | 'lawyer' | 'other'

export interface TransactionParticipant {
  id: string
  transaction_id: string
  profile_id: string
  role: ParticipantRole
  invited_by: string | null
  created_at: string
}

export interface TransactionDocument {
  id: string
  transaction_id: string
  name: string
  category: string | null
  storage_path: string
  is_internal: boolean
  uploaded_by: string
  created_at: string
}

export interface TransactionComment {
  id: string
  transaction_id: string
  author_id: string
  body: string
  created_at: string
}

export const PARTICIPANT_ROLE_LABELS: Record<ParticipantRole, string> = {
  client: 'Cliente',
  lawyer: 'Advogado',
  other: 'Outro',
}

export const PARTICIPANT_ROLE_COLORS: Record<ParticipantRole, { bg: string; fg: string }> = {
  client: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3' },
  lawyer: { bg: 'rgba(232,184,109,0.25)', fg: '#8A6320' },
  other: { bg: 'rgba(11,18,48,0.08)', fg: 'rgba(11,18,48,0.6)' },
}

/* ── Parte D: etapas de processo, custos por etapa, receitas ── */

export type ProcessStepStatus = 'pendente' | 'em_andamento' | 'concluida' | 'nao_se_aplica'

export interface ProcessStep {
  id: string
  transaction_id: string
  template_step_id: string | null
  name: string
  sort_order: number
  status: ProcessStepStatus
  started_at: string | null
  completed_at: string | null
  notes: string | null // interno — nunca chega ao participante (view sem notes)
}

export interface TransactionCost {
  id: string
  transaction_id: string
  step_id: string
  label: string
  amount: number
  currency: string
  paid_by: 'cliente_direto' | 'via_globalle'
  status: 'estimado' | 'confirmado' | 'pago'
  paid_at: string | null
  created_by: string | null
  created_at: string
}

export interface TransactionRevenue {
  id: string
  transaction_id: string
  step_id: string | null
  label: string
  amount: number
  currency: string
  status: 'previsto' | 'faturado' | 'recebido'
  expected_at: string | null
  received_at: string | null
  created_at: string
}

export const PROCESS_STATUS_LABELS: Record<ProcessStepStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  nao_se_aplica: 'Não se aplica',
}

export const PROCESS_STATUS_COLORS: Record<ProcessStepStatus, { bg: string; fg: string }> = {
  pendente: { bg: 'rgba(11,18,48,0.08)', fg: 'rgba(11,18,48,0.6)' },
  em_andamento: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3' },
  concluida: { bg: 'rgba(43,160,90,0.16)', fg: '#1E7A44' },
  nao_se_aplica: { bg: 'rgba(11,18,48,0.05)', fg: 'rgba(11,18,48,0.4)' },
}

export const COST_STATUS_LABELS = { estimado: 'Estimado', confirmado: 'Confirmado', pago: 'Pago' } as const
export const NEXT_COST_STATUS = { estimado: 'confirmado', confirmado: 'pago', pago: 'estimado' } as const
export const PAID_BY_LABELS = { cliente_direto: 'Cliente direto', via_globalle: 'Via Globalle' } as const

export const REVENUE_STATUS_LABELS = { previsto: 'Previsto', faturado: 'Faturado', recebido: 'Recebido' } as const
export const NEXT_REVENUE_STATUS = { previsto: 'faturado', faturado: 'recebido', recebido: 'previsto' } as const

export function formatAmount(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString('pt-BR')}`
  }
}

// Soma por moeda → "€ 12.000 · R$ 30.000" (transações de países diferentes).
export function sumByCurrency(entries: { amount: number; currency: string }[]): string {
  const totals = new Map<string, number>()
  for (const entry of entries) {
    totals.set(entry.currency, (totals.get(entry.currency) ?? 0) + Number(entry.amount))
  }
  return [...totals.entries()].map(([currency, total]) => formatAmount(total, currency)).join(' · ')
}

export const DOC_CATEGORIES = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'identificacao', label: 'Identificação' },
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'outro', label: 'Outro' },
] as const

export function docCategoryLabel(value: string | null): string {
  return DOC_CATEGORIES.find((c) => c.value === value)?.label ?? 'Sem categoria'
}

// Papel de participação → papel global do convite (decisão do spec):
// client → client; lawyer/other → lawyer.
export function globalRoleFor(role: ParticipantRole): 'client' | 'lawyer' {
  return role === 'client' ? 'client' : 'lawyer'
}
