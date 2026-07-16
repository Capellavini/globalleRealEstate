import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createThesis, setProfileRole } from '@/app/actions/theses'
import { getSessionProfile } from '@/lib/supabase/roles'
import { OBJECTIVE_LABELS, type Profile, type ThesisObjective } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
      <span>
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'rgba(11,18,48,0.5)' }}> — {hint}</span>}
      </span>
      {children}
    </label>
  )
}

export default async function ThesesPage() {
  const supabase = createClient()
  const { user } = await getSessionProfile()
  const [{ data: profiles, error }, { data: theses }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at'),
    supabase
      .from('theses')
      .select('*, profiles!theses_client_id_fkey(full_name)')
      .order('created_at', { ascending: false }),
  ])

  const clients = ((profiles ?? []) as Profile[]).filter((p) => p.role === 'client')

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Teses e clientes</h1>
      {error && <p style={{ color: '#A03030', fontSize: 14 }}>Erro: {error.message} — a migration do portfólio já rodou?</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
        <section style={{ display: 'grid', gap: 24 }}>
          {/* Nova tese */}
          <form action={createThesis} style={{ ...card, display: 'grid', gap: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Nova tese de investimento</h2>
            <Field label="Cliente" hint="crie o usuário no painel do Supabase (Authentication → Users) — ele aparece aqui">
              <select name="client_id" required defaultValue="" style={inputStyle}>
                <option value="" disabled>
                  selecione o cliente…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Título">
              <input name="title" type="text" required placeholder="Apartamento para arrendar no Porto" style={inputStyle} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Objetivo">
                <select name="objective" required defaultValue="" style={inputStyle}>
                  <option value="" disabled>
                    selecione…
                  </option>
                  {(Object.keys(OBJECTIVE_LABELS) as ThesisObjective[]).map((o) => (
                    <option key={o} value={o}>
                      {OBJECTIVE_LABELS[o]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Moeda">
                <select name="budget_currency" defaultValue="EUR" style={inputStyle}>
                  <option value="EUR">EUR</option>
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
              <Field label="Orçamento mín.">
                <input name="budget_min" type="number" step="any" style={inputStyle} />
              </Field>
              <Field label="Orçamento máx.">
                <input name="budget_max" type="number" step="any" style={inputStyle} />
              </Field>
            </div>
            <Field label="Países-alvo" hint="códigos ISO separados por vírgula: PT, BR">
              <input name="target_countries" type="text" required placeholder="PT, BR" style={inputStyle} />
            </Field>
            <Field label="Cidades-alvo" hint="separadas por vírgula">
              <input name="target_cities" type="text" placeholder="Porto, Lisboa" style={inputStyle} />
            </Field>
            <Field label="Tipos de imóvel" hint="separados por vírgula">
              <input name="property_types" type="text" placeholder="apartamento, moradia" style={inputStyle} />
            </Field>
            <Field label="Yield mínimo (%)" hint="relevante para arrendar">
              <input name="min_yield" type="number" step="any" style={inputStyle} />
            </Field>
            <Field label="Critérios qualitativos" hint="um por linha — viram as linhas do fit">
              <textarea
                name="criteria"
                rows={4}
                placeholder={'Máx. 15 min a pé do metro\nPrédio com elevador\nPronto a habitar'}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
            <Field label="Notas">
              <textarea name="notes" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <div>
              <button
                type="submit"
                style={{ padding: '11px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                Criar tese
              </button>
            </div>
          </form>
        </section>

        <section style={{ display: 'grid', gap: 24 }}>
          {/* Teses existentes */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Teses</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {(theses ?? []).length === 0 && <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>Nenhuma tese ainda.</p>}
              {(theses ?? []).map((thesis: any) => (
                <div key={thesis.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid rgba(11,18,48,0.07)', paddingBottom: 8, alignItems: 'center' }}>
                  <div>
                    <Link href={`/admin/theses/${thesis.id}`} style={{ fontWeight: 700, fontSize: 13.5, color: '#0B1230', textDecoration: 'none' }}>
                      {thesis.profiles?.full_name ?? '—'}
                    </Link>
                    <div style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)' }}>
                      {thesis.title} · {OBJECTIVE_LABELS[thesis.objective as ThesisObjective]}
                      {!thesis.is_active && ' · inativa'}
                    </div>
                  </div>
                  <Link href={`/admin/portfolios/${thesis.id}`} style={{ fontSize: 12.5, color: '#0E6FA3', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    kanban →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Usuários e papéis */}
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Usuários</h2>
            <p style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.55)', marginBottom: 12 }}>
              Para convidar um cliente: crie o usuário no painel do Supabase (Authentication → Users → Add user) — ele
              entra aqui como <strong>client</strong> automaticamente.
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {((profiles ?? []) as Profile[]).map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13.5 }}>
                    {p.full_name}
                    {p.id === user?.id && <span style={{ color: 'rgba(11,18,48,0.45)' }}> (você)</span>}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: '2px 10px',
                        background: p.role === 'team' ? 'rgba(30,167,232,0.16)' : 'rgba(11,18,48,0.08)',
                        color: p.role === 'team' ? '#0E6FA3' : 'rgba(11,18,48,0.6)',
                      }}
                    >
                      {p.role}
                    </span>
                    {p.id !== user?.id && (
                      <form action={setProfileRole}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="role" value={p.role === 'team' ? 'client' : 'team'} />
                        <button
                          type="submit"
                          style={{ fontSize: 11.5, background: 'none', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit', color: 'rgba(11,18,48,0.7)' }}
                        >
                          tornar {p.role === 'team' ? 'client' : 'team'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
