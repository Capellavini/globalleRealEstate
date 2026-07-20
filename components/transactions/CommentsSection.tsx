import { createClient } from '@/lib/supabase/server'
import { addTransactionComment } from '@/app/actions/transaction-comments'
import type { TransactionComment } from '@/lib/transactions/types'

import { cardStyle as card } from '@/lib/ui/style'

type Row = TransactionComment & { profiles: { full_name: string; role: string } | null }

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function CommentsSection({
  transactionId,
  basePath,
}: {
  transactionId: string
  basePath: string
}) {
  const supabase = createClient()
  const { data } = await supabase
    .from('transaction_comments')
    .select('*, profiles(full_name, role)')
    .eq('transaction_id', transactionId)
    .order('created_at')

  const comments = (data ?? []) as unknown as Row[]

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
        Comentários
      </h2>

      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        {comments.length === 0 && <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>Nenhum comentário ainda.</p>}
        {comments.map((comment) => (
          <div key={comment.id}>
            <div style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)' }}>
              <strong style={{ color: '#0B1230' }}>{comment.profiles?.full_name ?? '—'}</strong>
              {comment.profiles?.role === 'team' && <span style={{ color: '#0E6FA3', fontWeight: 700 }}> · Globalle</span>}
              {' · '}
              {formatDateTime(comment.created_at)}
            </div>
            <p style={{ fontSize: 14, marginTop: 2, whiteSpace: 'pre-wrap' }}>{comment.body}</p>
          </div>
        ))}
      </div>

      <form action={addTransactionComment} style={{ display: 'grid', gap: 8 }}>
        <input type="hidden" name="transaction_id" value={transactionId} />
        <input type="hidden" name="revalidate" value={basePath} />
        <textarea
          name="body"
          rows={2}
          required
          placeholder="Escreva um comentário…"
          style={{ padding: 10, border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
        />
        <div>
          <button
            type="submit"
            style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#070B24', color: '#fff', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            Comentar
          </button>
        </div>
      </form>
    </div>
  )
}
