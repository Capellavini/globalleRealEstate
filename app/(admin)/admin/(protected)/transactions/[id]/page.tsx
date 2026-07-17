import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/admin/Badge'
import ConfirmSubmitButton from '@/components/admin/ConfirmSubmitButton'
import {
  deleteTransaction,
  updateTransactionNotes,
  updateTransactionStatus,
} from '@/app/actions/transactions'
import { createStep, cycleStepStatus, deleteStep, updateStep } from '@/app/actions/steps'
import {
  attachFile,
  createDocument,
  cycleDocumentStatus,
  deleteDocument,
} from '@/app/actions/documents'
import ParticipantsSection from '@/components/transactions/ParticipantsSection'
import DocumentsSection from '@/components/transactions/DocumentsSection'
import CommentsSection from '@/components/transactions/CommentsSection'
import {
  DOC_STATUS_COLORS,
  DOC_STATUS_LABELS,
  formatDate,
  STEP_STATUS_COLORS,
  STEP_STATUS_LABELS,
  THESIS_COLORS,
  THESIS_LABELS,
  TX_STATUS_LABELS,
  type DocumentRow,
  type Step,
  type Transaction,
  type TransactionStatus,
} from '@/lib/admin/types'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.10)',
  borderRadius: 12,
  padding: 20,
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 6,
  fontSize: 13,
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

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(11,18,48,0.60)',
  marginBottom: 14,
}

export default async function TransactionDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { ok?: string; erro?: string; cat?: string }
}) {
  const supabase = createClient()

  const { data: tx } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!tx) notFound()
  const transaction = tx as Transaction

  const [{ data: stepsData }, { data: docsData }] = await Promise.all([
    supabase.from('steps').select('*').eq('transaction_id', params.id).order('order_index'),
    supabase.from('documents').select('*').eq('transaction_id', params.id).order('created_at'),
  ])
  const steps = (stepsData ?? []) as Step[]
  const documents = (docsData ?? []) as DocumentRow[]

  const thesis = THESIS_COLORS[transaction.thesis]

  return (
    <>
      <Link href="/admin" style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        ← Transações
      </Link>

      {searchParams.ok && (
        <div style={{ background: 'rgba(43,160,90,0.12)', color: '#1E7A44', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, margin: '12px 0' }}>
          {searchParams.ok}
        </div>
      )}
      {searchParams.erro && (
        <div style={{ background: 'rgba(194,61,61,0.10)', color: '#A03030', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, margin: '12px 0' }}>
          {searchParams.erro}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, margin: '12px 0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{transaction.client_name}</h1>
          <Badge bg={thesis.bg} fg={thesis.fg}>
            {THESIS_LABELS[transaction.thesis]}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {(Object.keys(TX_STATUS_LABELS) as TransactionStatus[]).map((status) => (
            <form key={status} action={updateTransactionStatus}>
              <input type="hidden" name="id" value={transaction.id} />
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                style={{
                  ...smallBtn,
                  ...(transaction.status === status
                    ? { background: '#070B24', color: '#fff', border: '1px solid #070B24' }
                    : {}),
                }}
              >
                {TX_STATUS_LABELS[status]}
              </button>
            </form>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', marginBottom: 24 }}>
        Data alvo: <strong style={{ color: '#0B1230' }}>{formatDate(transaction.target_close_date)}</strong>
        {' · '}Criada em {formatDate(transaction.created_at)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
        {/* ── Timeline de etapas ── */}
        <section>
          <h2 style={sectionTitle}>Etapas</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {steps.map((step) => {
              const color = STEP_STATUS_COLORS[step.status]
              return (
                <div key={step.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <strong style={{ fontSize: 15, fontWeight: 700 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", color: 'rgba(11,18,48,0.40)', marginRight: 8 }}>
                        {String(step.order_index).padStart(2, '0')}
                      </span>
                      {step.title}
                    </strong>
                    <form action={cycleStepStatus}>
                      <input type="hidden" name="id" value={step.id} />
                      <input type="hidden" name="transaction_id" value={transaction.id} />
                      <input type="hidden" name="current" value={step.status} />
                      <button
                        type="submit"
                        title="Clique para avançar o status"
                        style={{
                          background: color.bg,
                          color: color.fg,
                          border: 'none',
                          borderRadius: 999,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {STEP_STATUS_LABELS[step.status]}
                      </button>
                    </form>
                  </div>

                  <form action={updateStep} style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="transaction_id" value={transaction.id} />
                    <textarea
                      name="description"
                      defaultValue={step.description ?? ''}
                      rows={3}
                      placeholder="Descrição / notas da etapa…"
                      style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <label style={{ fontSize: 12, color: 'rgba(11,18,48,0.60)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Prazo
                        <input type="date" name="due_date" defaultValue={step.due_date ?? ''} style={inputStyle} />
                      </label>
                      <button type="submit" style={smallBtn}>
                        Salvar
                      </button>
                    </div>
                  </form>

                  <form action={deleteStep} style={{ marginTop: 10, textAlign: 'right' }}>
                    <input type="hidden" name="id" value={step.id} />
                    <input type="hidden" name="transaction_id" value={transaction.id} />
                    <ConfirmSubmitButton message={`Excluir a etapa "${step.title}"?`}>
                      Excluir etapa
                    </ConfirmSubmitButton>
                  </form>
                </div>
              )
            })}

            <form action={createStep} style={{ display: 'flex', gap: 8 }}>
              <input type="hidden" name="transaction_id" value={transaction.id} />
              <input
                type="text"
                name="title"
                required
                placeholder="Nova etapa…"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="submit" style={smallBtn}>
                Adicionar
              </button>
            </form>
          </div>
        </section>

        {/* ── Documentos + notas ── */}
        <section>
          <h2 style={sectionTitle}>Documentos</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {documents.length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.50)' }}>Nenhum documento ainda.</p>
            )}

            {documents.map((doc) => {
              const color = DOC_STATUS_COLORS[doc.status]
              return (
                <div key={doc.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <strong style={{ fontSize: 14, fontWeight: 700 }}>{doc.name}</strong>
                    <form action={cycleDocumentStatus}>
                      <input type="hidden" name="id" value={doc.id} />
                      <input type="hidden" name="transaction_id" value={transaction.id} />
                      <input type="hidden" name="current" value={doc.status} />
                      <button
                        type="submit"
                        title="Clique para avançar o status"
                        style={{
                          background: color.bg,
                          color: color.fg,
                          border: 'none',
                          borderRadius: 999,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {DOC_STATUS_LABELS[doc.status]}
                      </button>
                    </form>
                  </div>

                  <div style={{ fontSize: 12, color: 'rgba(11,18,48,0.60)', marginTop: 6 }}>
                    Prazo: {formatDate(doc.due_date)}
                    {doc.uploaded_at && <> · Recebido em {formatDate(doc.uploaded_at)}</>}
                  </div>

                  <form action={attachFile} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <input type="hidden" name="id" value={doc.id} />
                    <input type="hidden" name="transaction_id" value={transaction.id} />
                    <input
                      type="url"
                      name="file_url"
                      defaultValue={doc.file_url ?? ''}
                      placeholder="Link do arquivo (Drive, Dropbox…)"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button type="submit" style={smallBtn}>
                      Salvar
                    </button>
                  </form>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    {doc.file_url ? (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#0E6FA3', fontWeight: 600 }}
                      >
                        Abrir arquivo ↗
                      </a>
                    ) : (
                      <span />
                    )}
                    <form action={deleteDocument}>
                      <input type="hidden" name="id" value={doc.id} />
                      <input type="hidden" name="transaction_id" value={transaction.id} />
                      <ConfirmSubmitButton message={`Excluir o documento "${doc.name}"?`}>
                        Excluir
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              )
            })}

            <form action={createDocument} style={{ ...card, display: 'grid', gap: 10 }}>
              <input type="hidden" name="transaction_id" value={transaction.id} />
              <input type="text" name="name" required placeholder="Nome do documento (ex.: NIF, comprovante de fundos…)" style={inputStyle} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'rgba(11,18,48,0.60)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Prazo
                  <input type="date" name="due_date" style={inputStyle} />
                </label>
                <button type="submit" style={smallBtn}>
                  Adicionar documento
                </button>
              </div>
            </form>
          </div>

          <h2 style={{ ...sectionTitle, marginTop: 28 }}>Notas da transação</h2>
          <form action={updateTransactionNotes} style={{ ...card, display: 'grid', gap: 10 }}>
            <input type="hidden" name="id" value={transaction.id} />
            <textarea
              name="notes"
              defaultValue={transaction.notes ?? ''}
              rows={4}
              placeholder="Notas gerais…"
              style={{ ...inputStyle, resize: 'vertical', width: '100%' }}
            />
            <div>
              <button type="submit" style={smallBtn}>
                Salvar notas
              </button>
            </div>
          </form>

          <form action={deleteTransaction} style={{ marginTop: 28, textAlign: 'right' }}>
            <input type="hidden" name="id" value={transaction.id} />
            <ConfirmSubmitButton
              message={`Excluir a transação de ${transaction.client_name}? Etapas e documentos serão excluídos junto.`}
            >
              Excluir transação
            </ConfirmSubmitButton>
          </form>
        </section>
      </div>

      {/* Fase 2+3: participantes, documentos e comentários da transação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginTop: 24, alignItems: 'start' }}>
        <DocumentsSection
          transactionId={transaction.id}
          canManage
          basePath={`/admin/transactions/${transaction.id}`}
          filterCategory={searchParams.cat}
        />
        <div style={{ display: 'grid', gap: 24 }}>
          <ParticipantsSection transactionId={transaction.id} canManage />
          <CommentsSection transactionId={transaction.id} basePath={`/admin/transactions/${transaction.id}`} />
        </div>
      </div>
    </>
  )
}
