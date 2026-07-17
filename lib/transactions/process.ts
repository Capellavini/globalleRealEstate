import type { SupabaseClient } from '@supabase/supabase-js'

// Parte D — instanciação das etapas de processo por país.

// Transação sem imóvel vinculado: heurística pela tese (mesma da migração).
export function processCountryForThesis(thesis: string): 'PT' | 'BR' {
  return thesis === 'yield_real_brasil' ? 'BR' : 'PT'
}

/**
 * Copia as etapas do template do país para transaction_steps.
 * A 1ª etapa nasce em_andamento (o processo começa na Proposta).
 * Não-fatal: sem template (país sem seed ou migração pendente) → 0 etapas,
 * a transação existe na mesma.
 */
export async function instantiateProcessSteps(
  supabase: SupabaseClient,
  transactionId: string,
  countryCode: string
): Promise<{ created: number; templateFound: boolean }> {
  const { data: template } = await supabase
    .from('process_templates')
    .select('id')
    .eq('country_code', countryCode.toUpperCase())
    .maybeSingle()
  if (!template) return { created: 0, templateFound: false }

  const { data: steps } = await supabase
    .from('template_steps')
    .select('id, name, sort_order')
    .eq('template_id', template.id)
    .order('sort_order')
  if (!steps?.length) return { created: 0, templateFound: true }

  const rows = steps.map((step, i) => ({
    transaction_id: transactionId,
    template_step_id: step.id,
    name: step.name,
    sort_order: step.sort_order,
    status: i === 0 ? 'em_andamento' : 'pendente',
  }))

  const { error } = await supabase.from('transaction_steps').insert(rows)
  if (error) return { created: 0, templateFound: true }
  return { created: rows.length, templateFound: true }
}
