import { NextResponse } from 'next/server'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'

// Captação de investidores (LP pública) → CRM direto. Cria a conta
// gerenciada (sem e-mail de convite — a equipe decide quando convidar,
// mesmo padrão de "Novo Cliente" no admin), o perfil e a primeira tese.
// Cai automaticamente na coluna "Tese definida" do Funil.

const BUDGET_RANGES: Record<string, [number | null, number | null]> = {
  ate_200k: [null, 200000],
  '200k_500k': [200000, 500000],
  '500k_1m': [500000, 1000000],
  acima_1m: [1000000, null],
}

const VALID_OBJECTIVES = ['moradia', 'para_renda', 'revenda', 'patrimonial', 'desenvolvimento']
const VALID_LOCALES = ['pt', 'en', 'es', 'it']

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // Honeypot — bots preenchem campos escondidos, humanos não.
  if (String(body?.website ?? '').trim()) {
    return NextResponse.json({ ok: true })
  }

  const email = String(body?.email ?? '').trim().toLowerCase()
  const full_name = String(body?.full_name ?? '').trim()
  const phone = String(body?.phone ?? '').trim() || null
  const objective = String(body?.objective ?? '').trim()
  const target_countries = Array.isArray(body?.target_countries)
    ? [...new Set((body.target_countries as unknown[]).map((c) => String(c).trim().toUpperCase()).filter(Boolean))]
    : []
  const budgetKey = String(body?.budget_range ?? '')
  const budget_currency = String(body?.budget_currency ?? 'EUR').trim().toUpperCase()
  const notes = String(body?.notes ?? '').trim() || null
  const locale = String(body?.locale ?? '').trim()

  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (!full_name) return NextResponse.json({ error: 'missing_name' }, { status: 400 })
  if (!VALID_OBJECTIVES.includes(objective)) return NextResponse.json({ error: 'missing_objective' }, { status: 400 })
  if (!target_countries.length) return NextResponse.json({ error: 'missing_countries' }, { status: 400 })

  if (!isAdminConfigured()) {
    console.error('[leads] SUPABASE_SERVICE_ROLE_KEY não configurada')
    return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  }

  const admin = createAdminClient()
  const [budget_min, budget_max] = BUDGET_RANGES[budgetKey] ?? [null, null]

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    user_metadata: { full_name },
  })

  let userId = created?.user?.id

  if (createError) {
    const already = createError.message.toLowerCase().includes('already') || createError.status === 422
    if (!already) {
      console.error('[leads] createUser error', createError.message)
      return NextResponse.json({ error: 'create_failed' }, { status: 502 })
    }
    // E-mail já cadastrado — acha o usuário existente e só grava a nova tese,
    // em vez de falhar (visitante pode ter preenchido duas vezes).
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email)
    if (!existing) return NextResponse.json({ error: 'create_failed' }, { status: 502 })
    userId = existing.id
  }

  if (!userId) return NextResponse.json({ error: 'create_failed' }, { status: 502 })

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: userId,
      full_name,
      role: 'client',
      phone,
      ...(VALID_LOCALES.includes(locale) ? { preferred_language: locale } : {}),
    },
    { onConflict: 'id' }
  )
  if (profileError) {
    console.error('[leads] profile upsert error', profileError.message)
    return NextResponse.json({ error: 'profile_failed' }, { status: 502 })
  }

  // v1: 1 tese ativa por cliente — mesma regra do admin.
  await admin.from('theses').update({ is_active: false }).eq('client_id', userId).eq('is_active', true)

  const { error: thesisError } = await admin.from('theses').insert({
    client_id: userId,
    title: `Tese de ${full_name}`,
    objective,
    budget_min,
    budget_max,
    budget_currency,
    target_countries,
    target_cities: [],
    property_types: [],
    notes,
    is_active: true,
  })
  if (thesisError) {
    console.error('[leads] thesis insert error', thesisError.message)
    return NextResponse.json({ error: 'thesis_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
