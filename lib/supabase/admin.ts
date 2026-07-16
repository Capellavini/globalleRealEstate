import 'server-only'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabaseUrl } from './env'

// Client com a SERVICE ROLE KEY — ignora RLS e acessa a Admin API (convites,
// ban, listagem de auth.users). REGRAS INEGOCIÁVEIS:
//   - importar apenas de server actions / route handlers ('server-only' garante);
//   - a chave nunca ganha prefixo NEXT_PUBLIC_, nunca é logada.

function serviceRoleKey(): string | undefined {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!raw) return undefined
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  return lines.length ? lines[lines.length - 1] : undefined
}

export function isAdminConfigured(): boolean {
  return Boolean(supabaseUrl() && serviceRoleKey())
}

export function createAdminClient(): SupabaseClient {
  const url = supabaseUrl()
  const key = serviceRoleKey()
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.')
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
