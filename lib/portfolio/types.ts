// Tipos + labels + cores do módulo de Portfólio. Espelham migration-portfolio.sql.

export type UserRole = 'team' | 'client' | 'lawyer'
export type ThesisObjective = 'moradia' | 'para_renda' | 'revenda' | 'patrimonial' | 'desenvolvimento' | 'projetos_especiais'
export type PortfolioStatus = 'novo' | 'favorito' | 'em_analise' | 'descartado' | 'avancar'
export type FitValue = 'sim' | 'parcial' | 'nao'
export type SourceType = 'portal' | 'partner_agent' | 'off_market' | 'direct_owner'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  company: string | null
  residence_country: string | null // ISO alpha-2
  preferred_language: string | null // 'pt' | 'en' | 'it' | 'es'
  // Linha de advisory — etiqueta comercial do cliente (Passo 1 da consolidação).
  advisory_line: 'renda_euro' | 'yield_real_brasil' | 'cidadania_patrimonio' | null
  created_at: string
}

// Onboarding (Fase 1.5): telefone e foto são opcionais; o resto obrigatório.
export function isProfileComplete(profile: Pick<Profile, 'full_name' | 'company' | 'residence_country' | 'preferred_language'>): boolean {
  return Boolean(profile.full_name && profile.company && profile.residence_country && profile.preferred_language)
}

export const LANGUAGE_LABELS: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
}

export interface Thesis {
  id: string
  client_id: string
  title: string
  objective: ThesisObjective
  budget_min: number | null
  budget_max: number | null
  budget_currency: string
  target_countries: string[]
  target_cities: string[] | null
  property_types: string[] | null
  min_yield: number | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface ThesisCriterion {
  id: string
  thesis_id: string
  label: string
  sort_order: number
}

export interface Property {
  id: string
  title: string
  country_code: string
  city: string
  municipality: string | null
  address: string | null
  property_type: string
  asking_price: number
  currency: string
  area_m2: number | null
  bedrooms: number | null
  listing_url: string | null
  source_type: SourceType
  source_name: string | null
  cover_photo_url: string | null
  photos: string[]
  description: string | null
  expected_monthly_rent: number | null
  created_by: string | null
  created_at: string
}

export interface PortfolioItem {
  id: string
  thesis_id: string
  property_id: string
  status: PortfolioStatus
  sort_order: number
  added_by: string | null
  created_at: string
}

export interface StatusHistoryEntry {
  id: string
  portfolio_item_id: string
  from_status: PortfolioStatus | null
  to_status: PortfolioStatus
  reason: string | null
  changed_by: string
  changed_at: string
}

export interface Comment {
  id: string
  portfolio_item_id: string
  author_id: string
  body: string
  created_at: string
}

export interface CriterionFit {
  id: string
  portfolio_item_id: string
  criterion_id: string
  fit: FitValue
  note: string | null
  assessed_by: string
  assessed_at: string
}

/* ── Labels (PT) ── */

export const OBJECTIVE_LABELS: Record<ThesisObjective, string> = {
  moradia: 'Moradia ou Uso',
  para_renda: 'Para renda',
  revenda: 'Revenda',
  patrimonial: 'Patrimonial',
  desenvolvimento: 'Desenvolvimento',
  projetos_especiais: 'Projetos Especiais',
}

export const STATUS_LABELS: Record<PortfolioStatus, string> = {
  novo: 'Imóveis', // valor 'novo' no banco permanece; só o rótulo mudou (Fase 1.5)
  favorito: 'Favorito',
  em_analise: 'Em análise',
  descartado: 'Descartado',
  avancar: 'Avançar',
}

// Ordem de exibição do kanban (Fase 1.5): Imóveis → Em análise → Favorito → Avançar → Descartado
export const STATUS_ORDER: PortfolioStatus[] = ['novo', 'em_analise', 'favorito', 'avancar', 'descartado']

// Sistema de sinalização do kanban (seção 5 do spec) — nada além dessas cores.
export const STATUS_COLORS: Record<PortfolioStatus, { bg: string; fg: string; column: string }> = {
  novo: { bg: 'rgba(11,18,48,0.08)', fg: 'rgba(11,18,48,0.60)', column: 'rgba(11,18,48,0.03)' },
  favorito: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3', column: 'rgba(30,167,232,0.05)' },
  em_analise: { bg: 'rgba(224,153,20,0.18)', fg: '#8A5B00', column: 'rgba(224,153,20,0.05)' },
  descartado: { bg: 'rgba(11,18,48,0.14)', fg: 'rgba(11,18,48,0.45)', column: 'rgba(11,18,48,0.05)' },
  avancar: { bg: 'rgba(43,160,90,0.16)', fg: '#1E7A44', column: 'rgba(43,160,90,0.05)' },
}

export const FIT_LABELS: Record<FitValue, string> = {
  sim: '✓',
  parcial: '~',
  nao: '✗',
}

export const FIT_COLORS: Record<FitValue, string> = {
  sim: '#1E7A44',
  parcial: '#8A5B00',
  nao: '#A03030',
}

export const SOURCE_LABELS: Record<SourceType, string> = {
  portal: 'Portal',
  partner_agent: 'Corretor parceiro',
  off_market: 'Off-market',
  direct_owner: 'Proprietário direto',
}

export const PROPERTY_TYPES = ['apartamento', 'moradia', 'terreno', 'prédio'] as const

export const COUNTRY_NAMES: Record<string, string> = {
  PT: 'Portugal',
  BR: 'Brasil',
  ES: 'Espanha',
  IT: 'Itália',
  US: 'Estados Unidos',
  AE: 'Emirados Árabes',
  GB: 'Reino Unido',
  FR: 'França',
  DE: 'Alemanha',
  CH: 'Suíça',
}

export function countryFlag(code: string): string {
  const cc = code.trim().toUpperCase()
  if (cc.length !== 2) return '🌍'
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

export function formatMoney(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined) return '—'
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString('pt-BR')}`
  }
}

export function formatMoneyExact(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString('pt-BR')}`
  }
}
