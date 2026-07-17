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
