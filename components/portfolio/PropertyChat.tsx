'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SendIcon } from '@/components/icons/LineIcons'

type CommentRow = {
  id: string
  portfolio_item_id: string
  author_id: string
  body: string
  created_at: string
  profiles?: { full_name: string; role: string } | null
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Chat em tempo real do imóvel: insere direto no browser (RLS já cobre
// cliente/equipe) e escuta Realtime pra refletir mensagens de todo mundo
// sem recarregar — inclusive as próprias, então não há eco otimista local.
export default function PropertyChat({
  itemId,
  initialComments,
  currentUserId,
}: {
  itemId: string
  initialComments: CommentRow[]
  currentUserId: string
}) {
  const [comments, setComments] = useState<CommentRow[]>(initialComments)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())

  function markRead() {
    supabaseRef.current
      .from('comment_reads')
      .upsert(
        { portfolio_item_id: itemId, user_id: currentUserId, last_read_at: new Date().toISOString() },
        { onConflict: 'portfolio_item_id,user_id' }
      )
      .then(() => {})
  }

  // Marca como lido ao abrir — some o badge de não lidas nos cards do
  // kanban e do contador global assim que a pessoa vê a conversa.
  useEffect(() => {
    markRead()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId])

  useEffect(() => {
    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`comments:${itemId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `portfolio_item_id=eq.${itemId}` },
        async (payload) => {
          const row = payload.new as CommentRow
          if (row.author_id === currentUserId) {
            setComments((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]))
            return
          }
          const { data: authorProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', row.author_id)
            .maybeSingle()
          setComments((prev) =>
            prev.some((c) => c.id === row.id) ? prev : [...prev, { ...row, profiles: authorProfile }]
          )
          // Chegou enquanto a pessoa estava com o chat aberto — já é "lida".
          markRead()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [comments.length])

  async function send() {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setText('')
    const { error } = await supabaseRef.current
      .from('comments')
      .insert({ portfolio_item_id: itemId, author_id: currentUserId, body })
    setSending(false)
    if (error) {
      alert(`Erro ao enviar: ${error.message}`)
      setText(body)
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gap: 12, marginBottom: 16, maxHeight: 420, overflowY: 'auto' }}>
        {comments.length === 0 && <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.5)' }}>Nenhuma mensagem ainda.</p>}
        {comments.map((comment) => {
          const isSelf = comment.author_id === currentUserId
          const isTeamAuthor = comment.profiles?.role === 'team'
          return (
            <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start' }}>
              {!isSelf && (
                <div style={{ fontSize: 11, color: 'rgba(11,18,48,0.55)', marginBottom: 3, padding: '0 4px' }}>
                  <strong style={{ color: '#0B1230' }}>{comment.profiles?.full_name ?? '—'}</strong>
                  {isTeamAuthor && <span style={{ color: '#0E6FA3', fontWeight: 700 }}> · Globalle</span>}
                </div>
              )}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '9px 13px',
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                  background: isSelf ? '#070B24' : isTeamAuthor ? 'rgba(30,167,232,0.10)' : 'rgba(11,18,48,0.06)',
                  color: isSelf ? '#fff' : '#0B1230',
                  borderBottomRightRadius: isSelf ? 4 : 14,
                  borderBottomLeftRadius: isSelf ? 14 : 4,
                }}
              >
                {comment.body}
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(11,18,48,0.4)', marginTop: 3, padding: '0 4px' }}>
                {formatDateTime(comment.created_at)} · {formatTime(comment.created_at)}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Escreva uma mensagem…"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid rgba(11,18,48,0.15)',
            borderRadius: 20,
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'none',
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !text.trim()}
          aria-label="Enviar"
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: '50%',
            border: 'none',
            background: sending || !text.trim() ? 'rgba(7,11,36,0.35)' : '#070B24',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
            cursor: sending || !text.trim() ? 'default' : 'pointer',
          }}
        >
          <SendIcon size={17} />
        </button>
      </div>
    </>
  )
}
