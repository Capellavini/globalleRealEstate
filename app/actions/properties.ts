'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireTeam } from '@/lib/supabase/roles'

function propertyFromForm(formData: FormData) {
  const num = (name: string) => {
    const v = String(formData.get(name) ?? '').replace(',', '.').trim()
    return v ? Number(v) : null
  }
  const text = (name: string) => String(formData.get(name) ?? '').trim() || null

  const country_code = String(formData.get('country_code') ?? '').trim().toUpperCase()
  const municipality = text('municipality')

  if (country_code === 'BR' && !municipality) {
    throw new Error('Município é obrigatório para imóveis no Brasil (ITBI é municipal).')
  }

  return {
    title: String(formData.get('title') ?? '').trim(),
    country_code,
    city: String(formData.get('city') ?? '').trim(),
    municipality,
    address: text('address'),
    property_type: String(formData.get('property_type') ?? '').trim(),
    asking_price: num('asking_price') ?? 0,
    currency: String(formData.get('currency') ?? '').trim().toUpperCase(),
    area_m2: num('area_m2'),
    bedrooms: num('bedrooms'),
    listing_url: text('listing_url'),
    source_type: String(formData.get('source_type') ?? 'portal'),
    source_name: text('source_name'),
    cover_photo_url: text('cover_photo_url'),
  }
}

export async function createProperty(formData: FormData) {
  const { user } = await requireTeam()
  const supabase = createClient()

  const { data, error } = await supabase
    .from('properties')
    .insert({ ...propertyFromForm(formData), created_by: user.id })
    .select('id')
    .single()
  if (error) throw new Error(`Erro ao criar imóvel: ${error.message}`)

  revalidatePath('/admin/properties')
  redirect(`/admin/properties/${data.id}`)
}

export async function updateProperty(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const supabase = createClient()

  const { error } = await supabase.from('properties').update(propertyFromForm(formData)).eq('id', id)
  if (error) throw new Error(`Erro ao salvar imóvel: ${error.message}`)

  revalidatePath('/admin/properties')
  revalidatePath(`/admin/properties/${id}`)
}

export async function deleteProperty(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const supabase = createClient()

  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw new Error(`Erro ao excluir imóvel (está em algum portfólio?): ${error.message}`)

  revalidatePath('/admin/properties')
  redirect('/admin/properties')
}

// Upload feito no browser (bucket property-photos) → aqui só gravamos a URL.
export async function addPhoto(propertyId: string, url: string, asCover: boolean) {
  await requireTeam()
  const supabase = createClient()

  const { data: property, error: readError } = await supabase
    .from('properties')
    .select('photos, cover_photo_url')
    .eq('id', propertyId)
    .single()
  if (readError) throw new Error(readError.message)

  const photos = Array.isArray(property.photos) ? [...property.photos, url] : [url]
  const patch: Record<string, unknown> = { photos }
  if (asCover || !property.cover_photo_url) patch.cover_photo_url = url

  const { error } = await supabase.from('properties').update(patch).eq('id', propertyId)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/properties/${propertyId}`)
}

export async function removePhoto(formData: FormData) {
  await requireTeam()
  const id = String(formData.get('id'))
  const url = String(formData.get('url'))
  const supabase = createClient()

  const { data: property } = await supabase
    .from('properties')
    .select('photos, cover_photo_url')
    .eq('id', id)
    .single()
  if (!property) return

  const photos = (Array.isArray(property.photos) ? property.photos : []).filter((p: string) => p !== url)
  const patch: Record<string, unknown> = { photos }
  if (property.cover_photo_url === url) patch.cover_photo_url = photos[0] ?? null

  const { error } = await supabase.from('properties').update(patch).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath(`/admin/properties/${id}`)
}

// "Adicionar ao portfólio de..." → cria portfolio_item em 'novo'.
export async function addToPortfolio(formData: FormData) {
  const { user } = await requireTeam()
  const propertyId = String(formData.get('property_id'))
  const thesisId = String(formData.get('thesis_id'))
  if (!thesisId) return

  const supabase = createClient()
  const { data: item, error } = await supabase
    .from('portfolio_items')
    .insert({ thesis_id: thesisId, property_id: propertyId, added_by: user.id })
    .select('id')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Este imóvel já está no portfólio dessa tese.')
    throw new Error(`Erro ao adicionar ao portfólio: ${error.message}`)
  }

  await supabase.from('status_history').insert({
    portfolio_item_id: item.id,
    from_status: null,
    to_status: 'novo',
    changed_by: user.id,
  })

  revalidatePath('/admin/properties')
  revalidatePath(`/admin/portfolios/${thesisId}`)
  revalidatePath('/portfolio')
}
