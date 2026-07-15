// Types + labels + seed templates for the Transaction Room (admin interno).
// Espelham os enums de supabase/schema.sql.

export type TransactionStatus = 'active' | 'closed' | 'cancelled'
export type TransactionThesis = 'renda_euro' | 'yield_real_brasil' | 'cidadania_patrimonio'
export type StepStatus = 'pending' | 'in_progress' | 'done'
export type DocumentStatus = 'pending' | 'received' | 'approved'

export interface Transaction {
  id: string
  client_name: string
  thesis: TransactionThesis
  status: TransactionStatus
  target_close_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Step {
  id: string
  transaction_id: string
  title: string
  description: string | null
  order_index: number
  status: StepStatus
  due_date: string | null
  created_at: string
}

export interface DocumentRow {
  id: string
  transaction_id: string
  name: string
  status: DocumentStatus
  file_url: string | null
  due_date: string | null
  uploaded_at: string | null
  created_at: string
}

/* ── Labels (PT-BR) ── */

export const THESIS_LABELS: Record<TransactionThesis, string> = {
  renda_euro: 'Renda em Euro',
  yield_real_brasil: 'Yield Real Brasil',
  cidadania_patrimonio: 'Cidadania & Patrimônio',
}

export const TX_STATUS_LABELS: Record<TransactionStatus, string> = {
  active: 'Ativa',
  closed: 'Concluída',
  cancelled: 'Cancelada',
}

export const STEP_STATUS_LABELS: Record<StepStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluída',
}

export const DOC_STATUS_LABELS: Record<DocumentStatus, string> = {
  pending: 'Pendente',
  received: 'Recebido',
  approved: 'Aprovado',
}

/* ── Badge colors (fundo claro; cor sólida por status) ── */

export const THESIS_COLORS: Record<TransactionThesis, { bg: string; fg: string }> = {
  renda_euro: { bg: 'rgba(30,167,232,0.14)', fg: '#0E6FA3' },
  yield_real_brasil: { bg: 'rgba(43,160,90,0.14)', fg: '#1E7A44' },
  cidadania_patrimonio: { bg: 'rgba(232,184,109,0.22)', fg: '#8A6320' },
}

export const STEP_STATUS_COLORS: Record<StepStatus, { bg: string; fg: string }> = {
  pending: { bg: 'rgba(11,18,48,0.08)', fg: 'rgba(11,18,48,0.60)' },
  in_progress: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3' },
  done: { bg: 'rgba(43,160,90,0.16)', fg: '#1E7A44' },
}

export const DOC_STATUS_COLORS: Record<DocumentStatus, { bg: string; fg: string }> = {
  pending: { bg: 'rgba(11,18,48,0.08)', fg: 'rgba(11,18,48,0.60)' },
  received: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3' },
  approved: { bg: 'rgba(43,160,90,0.16)', fg: '#1E7A44' },
}

export const TX_STATUS_COLORS: Record<TransactionStatus, { bg: string; fg: string }> = {
  active: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3' },
  closed: { bg: 'rgba(43,160,90,0.16)', fg: '#1E7A44' },
  cancelled: { bg: 'rgba(194,61,61,0.14)', fg: '#A03030' },
}

/* ── Ciclos de status (clique avança para o próximo) ── */

export const NEXT_STEP_STATUS: Record<StepStatus, StepStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
}

export const NEXT_DOC_STATUS: Record<DocumentStatus, DocumentStatus> = {
  pending: 'received',
  received: 'approved',
  approved: 'pending',
}

/* ── Seed: template de etapas por tese ──
   Os 4 passos do blueprint do /investors (entender perfil → definir tese →
   curar ativos → executar e acompanhar), clonados a cada nova transação. */

export const STEP_TEMPLATES: Record<TransactionThesis, { title: string; description: string }[]> = {
  renda_euro: [
    {
      title: 'Entender o perfil',
      description:
        'Mapear objetivo de renda mensal em euro, horizonte, moeda-base do patrimônio e tolerância a vacância/gestão à distância.',
    },
    {
      title: 'Definir a tese',
      description:
        'Fechar mercado-alvo na Europa, faixa de ticket, tipo de ativo (residencial/comercial) e meta de yield líquido em euro.',
    },
    {
      title: 'Curar os ativos',
      description:
        'Shortlist de imóveis com análise de rendimento, custos de aquisição, fiscalidade e gestão locatícia. Apresentar 2–3 opções.',
    },
    {
      title: 'Executar e acompanhar',
      description:
        'Proposta, due diligence, financiamento se aplicável, escritura e onboarding da gestão. Acompanhamento pós-fecho.',
    },
  ],
  yield_real_brasil: [
    {
      title: 'Entender o perfil',
      description:
        'Mapear objetivo de yield real (acima da inflação), horizonte, liquidez desejada e exposição atual ao Brasil.',
    },
    {
      title: 'Definir a tese',
      description:
        'Fechar praça(s) no Brasil, tipo de ativo, faixa de ticket e meta de yield real líquido de custos e impostos.',
    },
    {
      title: 'Curar os ativos',
      description:
        'Shortlist com análise de renda, valorização esperada, risco de vacância e estrutura (PF/PJ/fundo). Apresentar 2–3 opções.',
    },
    {
      title: 'Executar e acompanhar',
      description:
        'Proposta, diligência documental, contrato/escritura e estruturação da renda. Acompanhamento pós-fecho.',
    },
  ],
  cidadania_patrimonio: [
    {
      title: 'Entender o perfil',
      description:
        'Mapear objetivo de mobilidade/cidadania, país-alvo, situação familiar e patrimônio elegível para o programa.',
    },
    {
      title: 'Definir a tese',
      description:
        'Fechar programa (visto/residência/cidadania), rota de investimento elegível e cronograma legal realista.',
    },
    {
      title: 'Curar os ativos',
      description:
        'Shortlist de ativos elegíveis ao programa com análise de qualidade do investimento além do benefício migratório.',
    },
    {
      title: 'Executar e acompanhar',
      description:
        'Aquisição, submissão do processo com o jurídico parceiro e acompanhamento dos marcos até a aprovação.',
    },
  ],
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}
