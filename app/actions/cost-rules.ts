'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireTeam } from '@/lib/supabase/roles'

function ruleFromForm(formData: FormData) {
  const num = (name: string) => {
    const v = String(formData.get(name) ?? '').replace(',', '.').trim()
    return v ? Number(v) : null
  }
  const calc_type = String(formData.get('calc_type') ?? '')
  if (!['flat', 'percent', 'brackets'].includes(calc_type)) throw new Error('Tipo de cálculo inválido.')

  let brackets: unknown = null
  const bracketsRaw = String(formData.get('brackets') ?? '').trim()
  if (calc_type === 'brackets') {
    if (!bracketsRaw) throw new Error('Informe os escalões (JSON).')
    try {
      brackets = JSON.parse(bracketsRaw)
    } catch {
      throw new Error('JSON de escalões inválido. Formato: [{"up_to":100000,"marginal_rate":0.02,"deduction":0}]')
    }
    if (!Array.isArray(brackets)) throw new Error('Os escalões devem ser uma lista JSON.')
  }

  return {
    country_code: String(formData.get('country_code') ?? '').trim().toUpperCase(),
    municipality: String(formData.get('municipality') ?? '').trim() || null,
    cost_label: String(formData.get('cost_label') ?? '').trim(),
    calc_type,
    flat_amount: calc_type === 'flat' ? num('flat_amount') : null,
    percent_rate: calc_type === 'percent' ? num('percent_rate') : null,
    brackets,
    applies_to_objective: String(formData.get('applies_to_objective') ?? '').trim() || null,
    currency: String(formData.get('currency') ?? '').trim().toUpperCase(),
    valid_from: String(formData.get('valid_from') ?? '') || new Date().toISOString().slice(0, 10),
    valid_to: String(formData.get('valid_to') ?? '') || null,
  }
}

export async function createCostRule(formData: FormData) {
  const { user } = await requireTeam()
  const supabase = createClient()

  const { error } = await supabase.from('cost_rules').insert({ ...ruleFromForm(formData), updated_by: user.id })
  if (error) throw new Error(`Erro ao criar regra: ${error.message}`)

  revalidatePath('/admin/cost-rules')
}

export async function updateCostRule(formData: FormData) {
  const { user } = await requireTeam()
  const id = String(formData.get('id'))
  const supabase = createClient()

  const { error } = await supabase.from('cost_rules').update({ ...ruleFromForm(formData), updated_by: user.id }).eq('id', id)
  if (error) throw new Error(`Erro ao salvar regra: ${error.message}`)

  revalidatePath('/admin/cost-rules')
}

export async function deleteCostRule(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const supabase = createClient()

  const { error } = await supabase.from('cost_rules').delete().eq('id', id)
  if (error) throw new Error(`Erro ao excluir regra: ${error.message}`)

  revalidatePath('/admin/cost-rules')
}
