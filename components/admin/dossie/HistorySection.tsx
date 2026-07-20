import { getClientHistory } from '@/lib/admin/history'

const KIND_ICON: Record<string, string> = {
  status: '↔',
  comment: '💬',
  tx_comment: '💬',
  document: '📄',
  step: '✓',
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function HistorySection({ clientId }: { clientId: string }) {
  const entries = await getClientHistory(clientId)

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 12, padding: 20 }}>
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
        Histórico
      </h2>
      {entries.length === 0 && <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>Nada ainda.</p>}
      <div style={{ display: 'grid', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
        {entries.map((e) => (
          <div key={e.id} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
            <span style={{ color: 'rgba(11,18,48,0.4)', width: 74, flexShrink: 0, fontSize: 12 }}>{fmtDate(e.at)}</span>
            <span>
              {KIND_ICON[e.kind]} {e.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
