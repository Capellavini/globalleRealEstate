// Testes do motor de custos — sem framework (a máquina de dev não aguenta):
//   npm run test:costs
import assert from 'node:assert/strict'
import { estimateAcquisitionCosts, type CostRule } from './engine.ts'

const asOf = new Date('2026-07-16')

const ptRules: CostRule[] = [
  {
    country_code: 'PT', municipality: null, cost_label: 'IMT', calc_type: 'brackets',
    flat_amount: null, percent_rate: null,
    brackets: [
      { up_to: 101917, marginal_rate: 0, deduction: 0 },
      { up_to: 316772, marginal_rate: 0.07, deduction: 10022.42 },
      { up_to: null, marginal_rate: 0.075, deduction: 0 },
    ],
    applies_to_objective: 'morar', currency: 'EUR', valid_from: '2026-01-01', valid_to: null,
  },
  {
    country_code: 'PT', municipality: null, cost_label: 'IMT', calc_type: 'brackets',
    flat_amount: null, percent_rate: null,
    brackets: [
      { up_to: 101917, marginal_rate: 0.01, deduction: 0 },
      { up_to: 316772, marginal_rate: 0.07, deduction: 9003.25 },
      { up_to: null, marginal_rate: 0.075, deduction: 0 },
    ],
    applies_to_objective: null, currency: 'EUR', valid_from: '2026-01-01', valid_to: null,
  },
  {
    country_code: 'PT', municipality: null, cost_label: 'Imposto do Selo', calc_type: 'percent',
    flat_amount: null, percent_rate: 0.008, brackets: null,
    applies_to_objective: null, currency: 'EUR', valid_from: '2026-01-01', valid_to: null,
  },
  {
    country_code: 'PT', municipality: null, cost_label: 'Notariado e registo', calc_type: 'flat',
    flat_amount: 1000, percent_rate: null, brackets: null,
    applies_to_objective: null, currency: 'EUR', valid_from: '2026-01-01', valid_to: null,
  },
]

const brRules: CostRule[] = [
  {
    country_code: 'BR', municipality: null, cost_label: 'ITBI', calc_type: 'percent',
    flat_amount: null, percent_rate: 0.02, brackets: null,
    applies_to_objective: null, currency: 'BRL', valid_from: '2026-01-01', valid_to: null,
  },
  {
    country_code: 'BR', municipality: 'São Paulo', cost_label: 'ITBI', calc_type: 'percent',
    flat_amount: null, percent_rate: 0.03, brackets: null,
    applies_to_objective: null, currency: 'BRL', valid_from: '2026-01-01', valid_to: null,
  },
  {
    country_code: 'BR', municipality: null, cost_label: 'Escritura pública', calc_type: 'brackets',
    flat_amount: null, percent_rate: null,
    brackets: [
      { up_to: 500000, marginal_rate: 0.006, deduction: 0 },
      { up_to: 1000000, marginal_rate: 0.005, deduction: 0 },
      { up_to: null, marginal_rate: 0.004, deduction: 0 },
    ],
    applies_to_objective: null, currency: 'BRL', valid_from: '2026-01-01', valid_to: null,
  },
]

// ── PT: IMT de habitação própria (objetivo 'morar') usa a regra específica ──
{
  const r = estimateAcquisitionCosts({
    askingPrice: 300000, currency: 'EUR', countryCode: 'PT', objective: 'morar',
    rules: ptRules, asOf,
  })
  const imt = r.lines.find((l) => l.label === 'IMT')!
  assert.equal(imt.amount, 10977.58) // 300000×0.07 − 10022.42
  assert.equal(r.lines.find((l) => l.label === 'Imposto do Selo')!.amount, 2400)
  assert.equal(r.costsTotal, 10977.58 + 2400 + 1000)
  assert.equal(r.grandTotal, 300000 + 14377.58)
  assert.equal(r.rulesAsOf, '2026-01-01')
}

// ── PT: objetivo 'arrendar' cai na regra genérica de IMT (secundária) ──
{
  const r = estimateAcquisitionCosts({
    askingPrice: 300000, currency: 'EUR', countryCode: 'PT', objective: 'arrendar',
    rules: ptRules, asOf,
  })
  assert.equal(r.lines.find((l) => l.label === 'IMT')!.amount, 11996.75) // 300000×0.07 − 9003.25
}

// ── PT: primeiro escalão isento no 'morar' ──
{
  const r = estimateAcquisitionCosts({
    askingPrice: 90000, currency: 'EUR', countryCode: 'PT', objective: 'morar',
    rules: ptRules, asOf,
  })
  assert.equal(r.lines.find((l) => l.label === 'IMT')!.amount, 0)
}

// ── BR: regra municipal de ITBI (São Paulo 3%) sobrepõe a nacional (2%) ──
{
  const r = estimateAcquisitionCosts({
    askingPrice: 800000, currency: 'BRL', countryCode: 'BR', municipality: 'São Paulo',
    objective: 'arrendar', rules: brRules, asOf,
  })
  const itbi = r.lines.find((l) => l.label === 'ITBI')!
  assert.equal(itbi.amount, 24000) // 3%, não 2%
  assert.equal(itbi.municipal, true)
  assert.equal(r.lines.find((l) => l.label === 'Escritura pública')!.amount, 4000) // escalão até 1M: 0.5%
}

// ── BR: município sem regra própria usa a nacional ──
{
  const r = estimateAcquisitionCosts({
    askingPrice: 800000, currency: 'BRL', countryCode: 'BR', municipality: 'Curitiba',
    objective: 'arrendar', rules: brRules, asOf,
  })
  assert.equal(r.lines.find((l) => l.label === 'ITBI')!.amount, 16000) // nacional 2%
}

// ── Vigência: regra expirada é ignorada ──
{
  const expired: CostRule = { ...ptRules[2], percent_rate: 0.05, valid_from: '2020-01-01', valid_to: '2025-12-31' }
  const r = estimateAcquisitionCosts({
    askingPrice: 100000, currency: 'EUR', countryCode: 'PT', objective: 'arrendar',
    rules: [expired, ptRules[2]], asOf,
  })
  assert.equal(r.lines.find((l) => l.label === 'Imposto do Selo')!.amount, 800) // 0.8%, não 5%
}

// ── País sem regras → só o preço ──
{
  const r = estimateAcquisitionCosts({
    askingPrice: 500000, currency: 'USD', countryCode: 'US', objective: 'morar',
    rules: [...ptRules, ...brRules], asOf,
  })
  assert.equal(r.lines.length, 0)
  assert.equal(r.grandTotal, 500000)
  assert.equal(r.rulesAsOf, null)
}

console.log('engine.test.ts: todos os testes passaram ✓')
