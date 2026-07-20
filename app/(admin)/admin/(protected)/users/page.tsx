import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { inviteUser, resendInvite, setUserActive, updateUserProfile } from '@/app/actions/users'
import { getSessionProfile } from '@/lib/supabase/roles'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import type { Profile } from '@/lib/portfolio/types'
import { THESIS_LABELS, type TransactionThesis } from '@/lib/admin/types'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 13.5,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

const smallBtn: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  color: '#0B1230',
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

type UserRow = {
  id: string
  full_name: string
  role: Profile['role']
  advisory_line: Profile['advisory_line']
  email: string
  created_at: string
  status: 'pendente' | 'ativo' | 'desativado'
}

const ROLE_BADGE: Record<Profile['role'], { bg: string; fg: string }> = {
  team: { bg: 'rgba(30,167,232,0.16)', fg: '#0E6FA3' },
  client: { bg: 'rgba(11,18,48,0.08)', fg: 'rgba(11,18,48,0.6)' },
  lawyer: { bg: 'rgba(232,184,109,0.25)', fg: '#8A6320' },
}

const STATUS_UI: Record<UserRow['status'], { label: string; bg: string; fg: string }> = {
  pendente: { label: 'Pendente', bg: 'rgba(224,153,20,0.18)', fg: '#8A5B00' },
  ativo: { label: 'Ativo', bg: 'rgba(43,160,90,0.16)', fg: '#1E7A44' },
  desativado: { label: 'Desativado', bg: 'rgba(11,18,48,0.14)', fg: 'rgba(11,18,48,0.5)' },
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; papel?: string; ok?: string; erro?: string; link?: string; link_email?: string }
}) {
  const { user: me } = await getSessionProfile()

  if (!isAdminConfigured()) {
    return (
      <>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Usuários</h1>
        <div style={{ ...card, fontSize: 14, lineHeight: 1.6, color: 'rgba(11,18,48,0.75)' }}>
          <strong style={{ color: '#0B1230' }}>Falta a chave de administração.</strong>
          <p style={{ marginTop: 8 }}>
            Defina <code>SUPABASE_SERVICE_ROLE_KEY</code> no <code>.env.local</code> e nas Environment Variables do
            Vercel (Settings → API → Secret keys no painel do Supabase). Ela fica só no servidor — nunca no browser.
            Depois de salvar no Vercel, faça Redeploy.
          </p>
        </div>
      </>
    )
  }

  const supabase = createClient()
  const admin = createAdminClient()

  const [{ data: profiles }, { data: authList, error: authError }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  const authById = new Map((authList?.users ?? []).map((u) => [u.id, u]))
  const now = Date.now()

  let rows: UserRow[] = ((profiles ?? []) as Profile[]).map((profile) => {
    const auth = authById.get(profile.id) as
      | { email?: string; email_confirmed_at?: string; last_sign_in_at?: string; banned_until?: string }
      | undefined
    const banned = auth?.banned_until ? new Date(auth.banned_until).getTime() > now : false
    const pending = !auth?.email_confirmed_at && !auth?.last_sign_in_at
    return {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      advisory_line: profile.advisory_line ?? null,
      email: auth?.email ?? '—',
      created_at: profile.created_at,
      status: banned ? 'desativado' : pending ? 'pendente' : 'ativo',
    }
  })

  const q = (searchParams.q ?? '').trim().toLowerCase()
  const papel = searchParams.papel ?? ''
  if (q) rows = rows.filter((r) => r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
  if (papel === 'team' || papel === 'client' || papel === 'lawyer') rows = rows.filter((r) => r.role === papel)

  return (
    <>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Usuários</h1>

      {searchParams.ok && (
        <div style={{ background: 'rgba(43,160,90,0.12)', color: '#1E7A44', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, marginBottom: 16 }}>
          {searchParams.ok}
        </div>
      )}
      {searchParams.erro && (
        <div style={{ background: 'rgba(194,61,61,0.10)', color: '#A03030', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, marginBottom: 16 }}>
          {searchParams.erro}
        </div>
      )}
      {searchParams.link && (
        <div style={{ ...card, marginBottom: 16, fontSize: 13 }}>
          <strong>Link de convite para {searchParams.link_email}</strong> — o e-mail automático não pôde ser reenviado;
          copie e envie por WhatsApp/e-mail (uso único):
          <div style={{ marginTop: 8, wordBreak: 'break-all', fontFamily: "'Space Mono', monospace", fontSize: 11.5, background: 'rgba(11,18,48,0.05)', padding: 10, borderRadius: 8 }}>
            {searchParams.link}
          </div>
        </div>
      )}
      {authError && <p style={{ color: '#A03030', fontSize: 13.5, marginBottom: 16 }}>Erro na Admin API: {authError.message}</p>}

      {/* Novo usuário */}
      <details style={{ ...card, marginBottom: 20 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>+ Novo usuário</summary>
        <form action={inviteUser} style={{ display: 'grid', gap: 14, marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
              Nome completo
              <input name="full_name" type="text" required style={inputStyle} />
            </label>
            <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
              E-mail
              <input name="email" type="email" required style={inputStyle} />
            </label>
            <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
              Papel
              <select name="role" required defaultValue="client" style={inputStyle}>
                <option value="client">client — investidor</option>
                <option value="team">team — equipe Globalle</option>
                <option value="lawyer">lawyer — advogado/terceiro</option>
              </select>
            </label>
          </div>

          <p style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)', margin: 0 }}>
            Para clientes, a tese de investimento é definida a seguir, no dossiê.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="submit"
              style={{ padding: '11px 18px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Criar usuário
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'rgba(11,18,48,0.7)' }}>
              <input type="checkbox" name="managed" />
              criar sem convite (perfil gerenciado pela equipe — nenhum e-mail é enviado)
            </label>
          </div>
        </form>
      </details>

      {/* Filtros */}
      <form method="GET" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input name="q" type="search" defaultValue={searchParams.q ?? ''} placeholder="Buscar por nome ou e-mail…" style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select name="papel" defaultValue={papel} style={inputStyle}>
          <option value="">todos os papéis</option>
          <option value="team">team</option>
          <option value="client">client</option>
          <option value="lawyer">lawyer</option>
        </select>
        <button type="submit" style={{ ...smallBtn, padding: '9px 16px' }}>
          Filtrar
        </button>
      </form>

      {/* Lista */}
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.length === 0 && (
          <div style={{ ...card, textAlign: 'center', color: 'rgba(11,18,48,0.6)', fontSize: 14, border: '1px dashed rgba(11,18,48,0.15)' }}>
            Nenhum usuário encontrado.
          </div>
        )}
        {rows.map((row) => {
          const status = STATUS_UI[row.status]
          const isMe = row.id === me?.id
          return (
            <div key={row.id} style={{ ...card, padding: '14px 20px', display: 'grid', gap: 10, opacity: row.status === 'desativado' ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 14.5 }}>
                    {row.role === 'client' ? (
                      <Link href={`/admin/clientes/${row.id}`} style={{ color: '#0B1230', textDecoration: 'none' }}>
                        {row.full_name}
                      </Link>
                    ) : (
                      row.full_name
                    )}
                    {isMe && <span style={{ color: 'rgba(11,18,48,0.45)', fontWeight: 400 }}> (você)</span>}
                  </strong>
                  <div style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.6)' }}>
                    {row.email} · desde {new Date(row.created_at).toLocaleDateString('pt-BR')}
                    {row.role === 'client' && (
                      <>
                        {' · '}
                        <Link href={`/admin/clientes/${row.id}`} style={{ color: '#0E6FA3', fontWeight: 600 }}>
                          ver dossiê →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '3px 10px', background: ROLE_BADGE[row.role].bg, color: ROLE_BADGE[row.role].fg }}>
                    {row.role}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '3px 10px', background: status.bg, color: status.fg }}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <form action={updateUserProfile} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="hidden" name="id" value={row.id} />
                  <input name="full_name" type="text" defaultValue={row.full_name} style={{ ...inputStyle, padding: '6px 10px', fontSize: 12.5, width: 180 }} />
                  <select name="role" defaultValue={row.role} disabled={isMe} style={{ ...inputStyle, padding: '6px 10px', fontSize: 12.5 }}>
                    <option value="client">client</option>
                    <option value="team">team</option>
                    <option value="lawyer">lawyer</option>
                  </select>
                  {isMe && <input type="hidden" name="role" value="team" />}
                  {row.role === 'client' && (
                    <select
                      name="advisory_line"
                      defaultValue={row.advisory_line ?? ''}
                      title="Linha de advisory (etiqueta comercial)"
                      style={{ ...inputStyle, padding: '6px 10px', fontSize: 12.5 }}
                    >
                      <option value="">sem linha de advisory</option>
                      {(Object.keys(THESIS_LABELS) as TransactionThesis[]).map((key) => (
                        <option key={key} value={key}>
                          {THESIS_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  )}
                  <button type="submit" style={smallBtn}>
                    Salvar
                  </button>
                </form>

                {row.status === 'pendente' && (
                  <form action={resendInvite}>
                    <input type="hidden" name="email" value={row.email} />
                    <button type="submit" style={{ ...smallBtn, color: '#0E6FA3', borderColor: 'rgba(30,167,232,0.4)' }}>
                      Reenviar convite
                    </button>
                  </form>
                )}

                {!isMe && (
                  <form action={setUserActive}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="activate" value={row.status === 'desativado' ? 'true' : 'false'} />
                    {row.status === 'desativado' ? (
                      <button type="submit" style={smallBtn}>
                        Reativar
                      </button>
                    ) : (
                      <ConfirmSubmitButton message={`Desativar ${row.full_name}? A conta fica bloqueada mas o histórico é preservado.`}>
                        Desativar
                      </ConfirmSubmitButton>
                    )}
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
