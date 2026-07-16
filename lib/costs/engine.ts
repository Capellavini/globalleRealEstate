// Motor de custos de aquisição por país — função pura, regras vêm da tabela
// cost_rules (nunca hardcoded). Testes: npm run test:costs.

export type CostBracket = {
  up_to: number | null // teto do escalão; null = sem teto
  marginal_rate: number // taxa aplicada sobre o VALOR TOTAL
  deduction: number // parcela a abater (formato IMT-PT); 0 nas tabelas simples
}

export type CostRule = {
  id?: string
  country_code: string
  municipality: string | null
  cost_label: string
  calc_type: 'flat' | 'percent' | 'brackets'
  flat_amount: number | null
  percent_rate: number | null
  brackets: CostBracket[] | null
  applies_to_objective: string | null // null = todos os objetivos
  currency: string
  valid_from: string // ISO date
  valid_to: string | null
}

export type CostLine = {
  label: string
  amount: number
  currency: string
  validFrom: string
  municipal: boolean
}

export type CostEstimate = {
  lines: CostLine[]
  costsTotal: number
  grandTotal: number // preço pedido + custos
  currency: string
  rulesAsOf: string | null // valid_from mais recente entre as regras usadas
}

export type CostInput = {
  askingPrice: number
  currency: string
  countryCode: string
  municipality?: string | null
  objective: string
  rules: CostRule[]
  asOf?: Date
}

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase()
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function isValidOn(rule: CostRule, date: Date): boolean {
  const d = date.toISOString().slice(0, 10)
  if (rule.valid_from > d) return false
  if (rule.valid_to && rule.valid_to < d) return false
  return true
}

function applyRule(rule: CostRule, price: number): number {
  if (rule.calc_type === 'flat') return round2(rule.flat_amount ?? 0)
  if (rule.calc_type === 'percent') return round2(price * (rule.percent_rate ?? 0))
  // brackets: acha o escalão onde o preço cai (formato IMT: taxa × valor − abate)
  const brackets = [...(rule.brackets ?? [])].sort((a, b) => {
    if (a.up_to === null) return 1
    if (b.up_to === null) return -1
    return a.up_to - b.up_to
  })
  for (const bracket of brackets) {
    if (bracket.up_to === null || price <= bracket.up_to) {
      return round2(Math.max(0, price * bracket.marginal_rate - bracket.deduction))
    }
  }
  return 0
}

/**
 * Estima os custos de aquisição de um imóvel.
 * Precedência por cost_label: regra municipal sobrepõe a nacional; regra com
 * objetivo específico sobrepõe a genérica. Empate → valid_from mais recente.
 */
export function estimateAcquisitionCosts(input: CostInput): CostEstimate {
  const asOf = input.asOf ?? new Date()
  const country = norm(input.countryCode)
  const municipality = norm(input.municipality)
  const objective = norm(input.objective)

  const candidates = input.rules.filter((rule) => {
    if (norm(rule.country_code) !== country) return false
    if (!isValidOn(rule, asOf)) return false
    // municipal só se o imóvel for desse município
    if (rule.municipality !== null && norm(rule.municipality) !== municipality) return false
    // objetivo específico só se bater com o da tese
    if (rule.applies_to_objective !== null && norm(rule.applies_to_objective) !== objective) return false
    return true
  })

  // agrupa por rótulo e escolhe a regra mais específica
  const byLabel = new Map<string, CostRule>()
  for (const rule of candidates) {
    const key = norm(rule.cost_label)
    const specificity = (rule.municipality !== null ? 2 : 0) + (rule.applies_to_objective !== null ? 1 : 0)
    const current = byLabel.get(key)
    if (!current) {
      byLabel.set(key, rule)
      continue
    }
    const currentSpec =
      (current.municipality !== null ? 2 : 0) + (current.applies_to_objective !== null ? 1 : 0)
    if (specificity > currentSpec || (specificity === currentSpec && rule.valid_from > current.valid_from)) {
      byLabel.set(key, rule)
    }
  }

  const lines: CostLine[] = [...byLabel.values()]
    .map((rule) => ({
      label: rule.cost_label,
      amount: applyRule(rule, input.askingPrice),
      currency: rule.currency,
      validFrom: rule.valid_from,
      municipal: rule.municipality !== null,
    }))
    .sort((a, b) => b.amount - a.amount)

  const costsTotal = round2(lines.reduce((sum, line) => sum + line.amount, 0))

  return {
    lines,
    costsTotal,
    grandTotal: round2(input.askingPrice + costsTotal),
    currency: input.currency,
    rulesAsOf: lines.length ? lines.map((l) => l.validFrom).sort().pop()! : null,
  }
}
