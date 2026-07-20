import { createClient } from '@/lib/supabase/server'
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin'
import { inviteParticipant, removeParticipant } from '@/app/actions/participants'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import {
  PARTICIPANT_ROLE_COLORS,
  PARTICIPANT_ROLE_LABELS,
  type ParticipantRole,
} from '@/lib/transactions/types'

import { cardStyle as card } from '@/lib/ui/style'

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

type Row = {
  id: string
  role: ParticipantRole
  profile_id: string
  profiles: { full_name: string } | null
}

// Participantes da transação. canManage=true (equipe): convite + remoção +
// status do convite; false (portal): lista somente leitura.
export default async function ParticipantsSection({
  transactionId,
  canManage,
}: {
  transactionId: string
  canManage: boolean
}) {
  const supabase = createClient()
  const { data } = await supabase
    .from('transaction_participants')
    .select('id, role, profile_id, profiles(full_name)')
    .eq('transaction_id', transactionId)
    .order('created_at')

  const participants = (data ?? []) as unknown as Row[]

  // Status do convite (Pendente/Ativo) — só no admin e só com a service key.
  const statusById = new Map<string, string>()
  if (canManage && isAdminConfigured() && participants.length) {
    const admin = createAdminClient()
    const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    for (const participant of participants) {
      const auth = authList?.users.find((u) => u.id === participant.profile_id) as
        | { email_confirmed_at?: string; last_sign_in_at?: string }
        | undefined
      statusById.set(
        participant.profile_id,
        auth && !auth.email_confirmed_at && !auth.last_sign_in_at ? 'Pendente' : 'Ativo'
      )
    }
  }

  return (
    <div style={card}>
      <h2
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(11,18,48,0.60)',
          marginBottom: 14,
        }}
      >
        Participantes
      </h2>

      <div style={{ display: 'grid', gap: 10, marginBottom: canManage ? 16 : 0 }}>
        {participants.length === 0 && (
          <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>Nenhum participante ainda.</p>
        )}
        {participants.map((participant) => {
          const colors = PARTICIPANT_ROLE_COLORS[participant.role]
          const status = statusById.get(participant.profile_id)
          return (
            <div
              key={participant.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(11,18,48,0.07)', paddingBottom: 8 }}
            >
              <span style={{ fontSize: 13.5 }}>{participant.profiles?.full_name ?? '—'}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {status && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: '2px 8px',
                      background: status === 'Pendente' ? 'rgba(224,153,20,0.18)' : 'rgba(43,160,90,0.16)',
                      color: status === 'Pendente' ? '#8A5B00' : '#1E7A44',
                    }}
                  >
                    {status}
                  </span>
                )}
                <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '2px 10px', background: colors.bg, color: colors.fg }}>
                  {PARTICIPANT_ROLE_LABELS[participant.role]}
                </span>
                {canManage && (
                  <form action={removeParticipant}>
                    <input type="hidden" name="id" value={participant.id} />
                    <input type="hidden" name="transaction_id" value={transactionId} />
                    <ConfirmSubmitButton
                      message={`Remover ${participant.profiles?.full_name ?? 'participante'} desta transação? A conta continua existindo.`}
                    >
                      Remover
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {canManage && (
        <form action={inviteParticipant} style={{ display: 'grid', gap: 8 }}>
          <input type="hidden" name="transaction_id" value={transactionId} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input name="full_name" type="text" required placeholder="Nome" style={{ ...inputStyle, flex: 1, minWidth: 130 }} />
            <input name="email" type="email" required placeholder="E-mail" style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
            <select name="participant_role" required defaultValue="lawyer" style={inputStyle}>
              {(Object.keys(PARTICIPANT_ROLE_LABELS) as ParticipantRole[]).map((role) => (
                <option key={role} value={role}>
                  {PARTICIPANT_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{ padding: '8px 14px', border: 'none', borderRadius: 6, background: '#070B24', color: '#fff', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              Convidar
            </button>
          </div>
          <span style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)' }}>
            Sem conta → recebe convite para definir senha. Com conta → entra na transação e recebe um link de acesso.
          </span>
        </form>
      )}
    </div>
  )
}
