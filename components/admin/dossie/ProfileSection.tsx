import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { updateUserProfile, resendInvite } from '@/app/actions/users'
import { COUNTRY_NAMES, countryFlag, LANGUAGE_LABELS, type Profile } from '@/lib/portfolio/types'
import { THESIS_LABELS, type TransactionThesis } from '@/lib/admin/types'

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 13.5,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

export default async function ProfileSection({ profile, redirectTo }: { profile: Profile; redirectTo: string }) {
  let email = '—'
  let status: 'pendente' | 'ativo' | 'desativado' = 'ativo'

  if (isAdminConfigured()) {
    const admin = createAdminClient()
    const { data } = await admin.auth.admin.getUserById(profile.id)
    const auth = data?.user as
      | { email?: string; email_confirmed_at?: string; last_sign_in_at?: string; banned_until?: string }
      | undefined
    email = auth?.email ?? '—'
    const banned = auth?.banned_until ? new Date(auth.banned_until).getTime() > Date.now() : false
    const pending = !auth?.email_confirmed_at && !auth?.last_sign_in_at
    status = banned ? 'desativado' : pending ? 'pendente' : 'ativo'
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover no-repeat` : 'linear-gradient(135deg, #0E1530, #131B38)',
              display: 'grid',
              placeItems: 'center',
              color: '#EDF1F7',
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {!profile.avatar_url && (profile.full_name?.[0] ?? '?').toUpperCase()}
          </div>
          <div>
            <strong style={{ fontSize: 17, fontWeight: 800, display: 'block' }}>{profile.full_name}</strong>
            <span style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.55)' }}>{email}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: 999,
              padding: '3px 10px',
              background: status === 'pendente' ? 'rgba(224,153,20,0.18)' : status === 'desativado' ? 'rgba(11,18,48,0.10)' : 'rgba(43,160,90,0.16)',
              color: status === 'pendente' ? '#8A5B00' : status === 'desativado' ? 'rgba(11,18,48,0.5)' : '#1E7A44',
            }}
          >
            {status === 'pendente' ? 'Convite pendente' : status === 'desativado' ? 'Desativado' : 'Ativo'}
          </span>
          {status === 'pendente' && (
            <form action={resendInvite}>
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <button
                type="submit"
                style={{ background: 'none', border: '1px solid rgba(30,167,232,0.4)', borderRadius: 6, color: '#0E6FA3', padding: '5px 10px', fontSize: 11.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                Reenviar convite
              </button>
            </form>
          )}
        </div>
      </div>

      <form action={updateUserProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, alignItems: 'end' }}>
        <input type="hidden" name="id" value={profile.id} />
        <input type="hidden" name="role" value="client" />
        <input type="hidden" name="redirect_to" value={redirectTo} />
        <label style={{ display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 600, color: 'rgba(11,18,48,0.6)' }}>
          Nome
          <input name="full_name" defaultValue={profile.full_name} style={inputStyle} />
        </label>
        <label style={{ display: 'grid', gap: 4, fontSize: 11.5, fontWeight: 600, color: 'rgba(11,18,48,0.6)' }}>
          Linha de advisory
          <select name="advisory_line" defaultValue={profile.advisory_line ?? ''} style={inputStyle}>
            <option value="">sem linha</option>
            {(Object.keys(THESIS_LABELS) as TransactionThesis[]).map((k) => (
              <option key={k} value={k}>
                {THESIS_LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <div>
          <button type="submit" style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
            Salvar
          </button>
        </div>
      </form>

      <p style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)', marginTop: 12 }}>
        {profile.company ?? 'empresa não informada'}
        {' · '}
        {profile.residence_country
          ? `${countryFlag(profile.residence_country)} ${COUNTRY_NAMES[profile.residence_country] ?? profile.residence_country}`
          : 'país não informado'}
        {' · '}
        {profile.preferred_language ? LANGUAGE_LABELS[profile.preferred_language] : 'idioma não informado'}
        {profile.phone && <> · {profile.phone}</>}
      </p>
    </div>
  )
}
