'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireTeam } from '@/lib/supabase/roles'
import { THESIS_OBJECTIVES } from '@/lib/thesis-options'

function thesisFromForm(formData: FormData) {
  const num = (name: string) => {
    const v = String(formData.get(name) ?? '').replace(',', '.').trim()
    return v ? Number(v) : null
  }
  // Checkboxes/inputs em cascata (ThesisCascadeFields): um valor por entrada.
  const list = (name: string) =>
    formData
      .getAll(name)
      .map((v) => String(v).trim())
      .filter(Boolean)

  const countries = [...new Set(list('target_countries').map((c) => c.toUpperCase()))]
  if (!countries.length) throw new Error('Selecione pelo menos um país-alvo.')

  const objective = String(formData.get('objective') ?? '')
  if (!THESIS_OBJECTIVES.some((o) => o.value === objective)) {
    throw new Error('Selecione o objetivo da tese.')
  }

  return {
    title: String(formData.get('title') ?? '').trim(),
    objective,
    budget_min: num('budget_min'),
    budget_max: num('budget_max'),
    budget_currency: String(formData.get('budget_currency') ?? 'EUR').trim().toUpperCase(),
    target_countries: countries,
    target_cities: list('target_cities'),
    property_types: list('property_types'),
    min_yield: num('min_yield'),
    notes: String(formData.get('notes') ?? '').trim() || null,
  }
}

// Todas as actions abaixo vivem no dossiê do cliente (/admin/clientes/[id]) —
// nunca numa página própria de tese. revalidate/redirect sempre apontam pra lá.

export async function createThesis(formData: FormData) {
  await requireTeam()
  const client_id = String(formData.get('client_id'))
  if (!client_id) throw new Error('Cliente não identificado.')

  const supabase = createClient()

  // v1: 1 tese ativa por cliente — desativa as anteriores.
  await supabase.from('theses').update({ is_active: false }).eq('client_id', client_id).eq('is_active', true)

  const { error } = await supabase.from('theses').insert({ ...thesisFromForm(formData), client_id })
  if (error) throw new Error(`Erro ao criar tese: ${error.message}`)

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${client_id}`)
  redirect(`/admin/clientes/${client_id}`)
}

export async function updateThesis(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const client_id = String(formData.get('client_id'))
  const supabase = createClient()

  const { error } = await supabase.from('theses').update(thesisFromForm(formData)).eq('id', id)
  if (error) throw new Error(`Erro ao salvar tese: ${error.message}`)

  revalidatePath(`/admin/clientes/${client_id}`)
  revalidatePath('/portfolio')
}

export async function toggleThesisActive(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const client_id = String(formData.get('client_id'))
  const active = String(formData.get('active')) === 'true'
  const supabase = createClient()

  const { error } = await supabase.from('theses').update({ is_active: active }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/clientes')
  revalidatePath(`/admin/clientes/${client_id}`)
}

export async function addCriterion(formData: FormData) {
  await requireTeam()
  const thesisId = String(formData.get('thesis_id'))
  const client_id = String(formData.get('client_id'))
  const label = String(formData.get('label') ?? '').trim()
  if (!label) return

  const supabase = createClient()
  const { data: last } = await supabase
    .from('thesis_criteria')
    .select('sort_order')
    .eq('thesis_id', thesisId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase
    .from('thesis_criteria')
    .insert({ thesis_id: thesisId, label, sort_order: (last?.sort_order ?? -1) + 1 })
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/clientes/${client_id}`)
}

export async function deleteCriterion(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const client_id = String(formData.get('client_id'))
  const supabase = createClient()

  const { error } = await supabase.from('thesis_criteria').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/clientes/${client_id}`)
}
