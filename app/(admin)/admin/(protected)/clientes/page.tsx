import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { countryFlag, type Profile } from '@/lib/portfolio/types'
import type { ProcessStepStatus } from '@/lib/transactions/types'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

type ThesisRow = { id: string; client_id: string }
type ItemRow = { thesis_id: string; status: string }
type TxRow = {
  id: string
  client_id: string
  status: string
  transaction_steps: { name: string; sort_order: number; status: ProcessStepStatus }[]
}

function currentStepName(tx: TxRow): string | null {
  const steps = [...tx.transaction_steps].sort((a, b) => a.sort_order - b.sort_order)
  const current = steps.find((s) => s.status === 'em_andamento') ?? steps.find((s) => s.status === 'pendente')
  return current?.name ?? null
}

// O pipeline é a home do admin: um card por cliente, mostrando o ESTÁGIO —
// não uma lista de entidades soltas.
export default async function ClientesPage() {
  const supabase = createClient()

  const { data: clientsData, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })
  const clients = (clientsData ?? []) as Profile[]
  const clientIds = clients.map((c) => c.id)

  const [{ data: thesesData }, { data: txData }] = await Promise.all([
    clientIds.length
      ? supabase.from('theses').select('id, client_id').eq('is_active', true).in('client_id', clientIds)
      : Promise.resolve({ data: [] as ThesisRow[] }),
    clientIds.length
      ? supabase
          .from('transactions')
          .select('id, client_id, status, transaction_steps(name, sort_order, status)')
          .in('client_id', clientIds)
      : Promise.resolve({ data: [] as TxRow[] }),
  ])

  const thesisByClient = new Map((thesesData ?? []).map((t: ThesisRow) => [t.client_id, t.id]))
  const thesisIds = (thesesData ?? []).map((t: ThesisRow) => t.id)

  const { data: itemsData } = thesisIds.length
    ? await supabase.from('portfolio_items').select('thesis_id, status').in('thesis_id', thesisIds)
    : { data: [] as ItemRow[] }

  const itemsByThesis = new Map<string, ItemRow[]>()
  for (const item of (itemsData ?? []) as ItemRow[]) {
    const list = itemsByThesis.get(item.thesis_id) ?? []
    list.push(item)
    itemsByThesis.set(item.thesis_id, list)
  }

  const txByClient = new Map<string, TxRow[]>()
  for (const tx of (txData ?? []) as unknown as TxRow[]) {
    const list = txByClient.get(tx.client_id) ?? []
    list.push(tx)
    txByClient.set(tx.client_id, list)
  }

  // Status do convite — opcional, some silenciosamente sem a service key.
  const inviteById = new Map<string, 'pendente' | 'ativo' | 'desativado'>()
  if (isAdminConfigured() && clientIds.length) {
    const admin = createAdminClient()
    const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const now = Date.now()
    for (const auth of authList?.users ?? []) {
      const a = auth as { id: string; email_confirmed_at?: string; last_sign_in_at?: string; banned_until?: string }
      const banned = a.banned_until ? new Date(a.banned_until).getTime() > now : false
      const pending = !a.email_confirmed_at && !a.last_sign_in_at
      inviteById.set(a.id, banned ? 'desativado' : pending ? 'pendente' : 'ativo')
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Clientes</h1>
        <Link
          href="/admin/users"
          style={{ background: '#070B24', color: '#fff', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
        >
          + Novo cliente
        </Link>
      </div>

      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro: {error.message}</p>}

      {!error && clients.length === 0 && (
        <div style={{ ...card, border: '1px dashed rgba(11,18,48,0.15)', textAlign: 'center', color: 'rgba(11,18,48,0.6)', fontSize: 14 }}>
          Nenhum cliente ainda. Comece em “Novo cliente”.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {clients.map((client) => {
          const thesisId = thesisByClient.get(client.id)
          const items = thesisId ? itemsByThesis.get(thesisId) ?? [] : []
          const avancar = items.filter((i) => i.status === 'avancar').length
          const transactions = txByClient.get(client.id) ?? []
          const active = transactions.find((t) => t.status === 'active')
          const invite = inviteById.get(client.id)

          let stage: string
          let stageTone: 'neutral' | 'progress' | 'done' = 'neutral'
          if (active) {
            stage = `Em transação — ${currentStepName(active) ?? 'iniciando'}`
            stageTone = 'progress'
          } else if (thesisId && items.length > 0) {
            stage = `Nas Opções — ${items.length} imóve${items.length === 1 ? 'l' : 'is'}${avancar ? `, ${avancar} em Avançar` : ''}`
            stageTone = 'progress'
          } else if (thesisId) {
            stage = 'Tese definida'
          } else if (transactions.some((t) => t.status === 'closed')) {
            stage = 'Concluído'
            stageTone = 'done'
          } else {
            stage = 'Tese pendente'
          }

          const stageColors =
            stageTone === 'done'
              ? { bg: 'rgba(43,160,90,0.14)', fg: '#1E7A44' }
              : stageTone === 'progress'
                ? { bg: 'rgba(30,167,232,0.14)', fg: '#0E6FA3' }
                : { bg: 'rgba(11,18,48,0.07)', fg: 'rgba(11,18,48,0.6)' }

          return (
            <Link
              key={client.id}
              href={`/admin/clientes/${client.id}`}
              style={{ ...card, textDecoration: 'none', color: '#0B1230', display: 'grid', gap: 10 }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: client.avatar_url ? `url(${client.avatar_url}) center/cover no-repeat` : 'linear-gradient(135deg, #0E1530, #131B38)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#EDF1F7',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {!client.avatar_url && (client.full_name?.[0] ?? '?').toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 15.5, fontWeight: 800, display: 'block' }}>{client.full_name}</strong>
                  <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)' }}>
                    {[
                      client.company,
                      client.residence_country ? `${countryFlag(client.residence_country)} ${client.residence_country}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'perfil por completar'}
                  </span>
                </div>
              </div>

              <span style={{ fontSize: 12.5, fontWeight: 700, borderRadius: 999, padding: '4px 12px', background: stageColors.bg, color: stageColors.fg, justifySelf: 'start' }}>
                {stage}
              </span>

              {invite === 'pendente' && <span style={{ fontSize: 11.5, color: '#8A5B00' }}>convite pendente</span>}
              {invite === 'desativado' && <span style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)' }}>desativado</span>}
            </Link>
          )
        })}
      </div>
    </>
  )
}
