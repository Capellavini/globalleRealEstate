import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deleteTransactionDocument, toggleDocumentInternal } from '@/app/actions/transaction-docs'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import DocUploader from './DocUploader'
import DownloadButton from './DownloadButton'
import { DOC_CATEGORIES, docCategoryLabel, type TransactionDocument } from '@/lib/transactions/types'

// Lista de documentos da transação — componente isolado (base da Fase 4/IA).
// O RLS já esconde documentos internos de quem não é equipe.

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

type Row = TransactionDocument & { profiles: { full_name: string } | null }

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function DocumentsSection({
  transactionId,
  canManage,
  basePath,
  filterCategory,
}: {
  transactionId: string
  canManage: boolean
  basePath: string // rota atual (para filtros e revalidate)
  filterCategory?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('transaction_documents')
    .select('*, profiles!transaction_documents_uploaded_by_fkey(full_name)')
    .eq('transaction_id', transactionId)
    .order('created_at', { ascending: false })
  if (filterCategory) query = query.eq('category', filterCategory)

  const { data } = await query
  const documents = (data ?? []) as unknown as Row[]

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <h2
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(11,18,48,0.60)',
          }}
        >
          Documentos
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 12 }}>
          <Link
            href={basePath}
            style={{ textDecoration: 'none', color: !filterCategory ? '#0E6FA3' : 'rgba(11,18,48,0.55)', fontWeight: !filterCategory ? 700 : 400 }}
          >
            todos
          </Link>
          {DOC_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`${basePath}?cat=${c.value}`}
              style={{ textDecoration: 'none', color: filterCategory === c.value ? '#0E6FA3' : 'rgba(11,18,48,0.55)', fontWeight: filterCategory === c.value ? 700 : 400 }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        {documents.length === 0 && (
          <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>
            {filterCategory ? 'Nenhum documento nesta categoria.' : 'Nenhum documento ainda.'}
          </p>
        )}
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(11,18,48,0.07)', paddingBottom: 10, flexWrap: 'wrap' }}
          >
            <div style={{ minWidth: 0 }}>
              <strong style={{ fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {doc.name}
                {doc.is_internal && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: '2px 8px', background: 'rgba(11,18,48,0.10)', color: 'rgba(11,18,48,0.6)' }}>
                    INTERNO
                  </span>
                )}
              </strong>
              <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.55)' }}>
                {docCategoryLabel(doc.category)} · {doc.profiles?.full_name ?? '—'} · {formatDateTime(doc.created_at)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <DownloadButton docId={doc.id} />
              {canManage && (
                <>
                  <form action={toggleDocumentInternal}>
                    <input type="hidden" name="id" value={doc.id} />
                    <input type="hidden" name="make_internal" value={doc.is_internal ? 'false' : 'true'} />
                    <input type="hidden" name="revalidate" value={basePath} />
                    <button
                      type="submit"
                      title={doc.is_internal ? 'Tornar visível aos participantes' : 'Restringir à equipe'}
                      style={{ background: 'none', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 6, color: 'rgba(11,18,48,0.7)', padding: '5px 10px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}
                    >
                      {doc.is_internal ? 'Tornar visível' : 'Tornar interno'}
                    </button>
                  </form>
                  <form action={deleteTransactionDocument}>
                    <input type="hidden" name="id" value={doc.id} />
                    <input type="hidden" name="revalidate" value={basePath} />
                    <ConfirmSubmitButton message={`Excluir "${doc.name}"?`}>Excluir</ConfirmSubmitButton>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <DocUploader transactionId={transactionId} revalidate={basePath} />
    </div>
  )
}
