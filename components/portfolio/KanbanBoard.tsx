'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { moveItem, confirmAdvance } from '@/app/actions/portfolio'
import {
  countryFlag,
  formatMoney,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ORDER,
  type PortfolioStatus,
} from '@/lib/portfolio/types'
export type KanbanCard = {
  itemId: string
  propertyId: string
  status: PortfolioStatus
  title: string
  city: string
  countryCode: string
  price: number
  currency: string
  grandTotal: number | null
  coverUrl: string | null
  bedrooms: number | null
  areaM2: number | null
  propertyType: string
  fitYes: number
  fitTotal: number
  commentCount: number
  unreadCount: number
}

type Role = 'team' | 'client'

type PendingMove = { card: KanbanCard; to: PortfolioStatus } | null

export default function KanbanBoard({
  cards: initialCards,
  role,
  thesisId,
}: {
  cards: KanbanCard[]
  role: Role
  thesisId: string
}) {
  const router = useRouter()
  const [cards, setCards] = useState(initialCards)
  const [pendingDiscard, setPendingDiscard] = useState<PendingMove>(null)
  const [pendingAdvance, setPendingAdvance] = useState<PendingMove>(null)
  const [discardReason, setDiscardReason] = useState('')
  const [compare, setCompare] = useState<string[]>([])
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const detailQuery = role === 'team' ? `?thesis=${thesisId}` : ''

  function applyMove(card: KanbanCard, to: PortfolioStatus, reason?: string) {
    setCards((prev) => prev.map((c) => (c.itemId === card.itemId ? { ...c, status: to } : c)))
    startTransition(async () => {
      try {
        await moveItem(card.itemId, to, reason)
        router.refresh()
      } catch (e) {
        setCards((prev) => prev.map((c) => (c.itemId === card.itemId ? { ...c, status: card.status } : c)))
        alert(e instanceof Error ? e.message : 'Erro ao mover o imóvel.')
      }
    })
  }

  function requestMove(card: KanbanCard, to: PortfolioStatus) {
    if (to === card.status) return
    if (to === 'descartado') {
      setDiscardReason('')
      setPendingDiscard({ card, to })
      return
    }
    if (to === 'avancar') {
      setPendingAdvance({ card, to })
      return
    }
    applyMove(card, to)
  }

  function onDragEnd(event: DragEndEvent) {
    const card = cards.find((c) => c.itemId === String(event.active.id))
    const to = event.over?.id as PortfolioStatus | undefined
    if (card && to && STATUS_ORDER.includes(to)) requestMove(card, to)
  }

  function runTeamAdvance(card: KanbanCard) {
    startTransition(async () => {
      try {
        await confirmAdvance(card.itemId) // redireciona para a transação
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Erro ao confirmar o avanço.')
      }
    })
  }

  function toggleCompare(propertyId: string) {
    setCompare((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : prev.length >= 4 ? prev : [...prev, propertyId]
    )
  }

  return (
    <>
      <style>{`
        .kanban-cols { display: grid; grid-template-columns: repeat(5, minmax(232px, 1fr)); gap: 12px; align-items: start; }
        @media (max-width: 860px) { .kanban-cols { grid-template-columns: 1fr; } }
      `}</style>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="kanban-cols">
          {STATUS_ORDER.map((status) => (
            <Column key={status} status={status}>
              {cards
                .filter((c) => c.status === status)
                .map((card) => (
                  <Card
                    key={card.itemId}
                    card={card}
                    role={role}
                    detailQuery={detailQuery}
                    selected={compare.includes(card.propertyId)}
                    onToggleCompare={() => toggleCompare(card.propertyId)}
                    onMove={(to) => requestMove(card, to)}
                    onConfirmAdvance={() => setPendingAdvance({ card, to: 'avancar' })}
                  />
                ))}
            </Column>
          ))}
        </div>
      </DndContext>

      {compare.length >= 2 && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#070B24',
            color: '#fff',
            borderRadius: 999,
            padding: '10px 20px',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(7,11,36,0.35)',
            zIndex: 40,
          }}
        >
          <span style={{ fontSize: 13 }}>{compare.length} selecionados</span>
          <Link
            href={`/portfolio/compare?ids=${compare.join(',')}&thesis=${thesisId}`}
            style={{ color: '#1EA7E8', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
          >
            Comparar →
          </Link>
          <button onClick={() => setCompare([])} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13 }}>
            Limpar
          </button>
        </div>
      )}

      {/* Modal: motivo do descarte */}
      {pendingDiscard && (
        <Modal onClose={() => setPendingDiscard(null)}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Descartar imóvel</h3>
          <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.6)', marginBottom: 12 }}>
            Por que este imóvel não serve? O motivo ajuda a equipe a calibrar a busca.
          </p>
          <textarea
            value={discardReason}
            onChange={(e) => setDiscardReason(e.target.value)}
            rows={3}
            placeholder="Motivo (opcional)…"
            style={{ width: '100%', padding: 10, border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, fontFamily: 'inherit', fontSize: 14 }}
          />
          <ModalActions
            confirmLabel="Descartar"
            onCancel={() => setPendingDiscard(null)}
            onConfirm={() => {
              applyMove(pendingDiscard.card, 'descartado', discardReason)
              setPendingDiscard(null)
            }}
          />
        </Modal>
      )}

      {/* Modal: avançar */}
      {pendingAdvance && role === 'client' && (
        <Modal onClose={() => setPendingAdvance(null)}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Avançar com este imóvel?</h3>
          <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.6)', marginBottom: 4 }}>
            Sinalizar que quer avançar com <strong>{pendingAdvance.card.title}</strong>? A equipe Globalle será
            notificada para confirmar e abrir a transação.
          </p>
          <ModalActions
            confirmLabel="Sinalizar avanço"
            onCancel={() => setPendingAdvance(null)}
            onConfirm={() => {
              applyMove(pendingAdvance.card, 'avancar')
              setPendingAdvance(null)
            }}
          />
        </Modal>
      )}

      {pendingAdvance && role === 'team' && (
        <Modal onClose={() => setPendingAdvance(null)}>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Confirmar avanço</h3>
          <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.6)', marginBottom: 4 }}>
            Cria a transação com os dados de <strong>{pendingAdvance.card.title}</strong>, vinculada ao cliente e à
            tese, com as etapas do país do imóvel — e abre o detalhe.
          </p>
          <ModalActions
            confirmLabel="Criar transação"
            onCancel={() => setPendingAdvance(null)}
            onConfirm={() => {
              const card = pendingAdvance.card
              setPendingAdvance(null)
              if (card.status !== 'avancar') applyMove(card, 'avancar')
              runTeamAdvance(card)
            }}
          />
        </Modal>
      )}
    </>
  )
}

/* ── Coluna droppable ── */

function Column({ status, children }: { status: PortfolioStatus; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: status })
  const colors = STATUS_COLORS[status]
  const isGoal = status === 'avancar'

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'rgba(30,167,232,0.10)' : colors.column,
        border: isGoal ? '1px solid rgba(43,160,90,0.45)' : '1px solid rgba(11,18,48,0.08)',
        borderRadius: 12,
        padding: 10,
        minHeight: 120,
        display: 'grid',
        gap: 10,
        alignContent: 'start',
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: colors.fg,
          padding: '2px 4px',
        }}
      >
        {STATUS_LABELS[status]}
      </div>
      {children}
    </div>
  )
}

/* ── Card draggable ── */

function Card({
  card,
  role,
  detailQuery,
  selected,
  onToggleCompare,
  onMove,
  onConfirmAdvance,
}: {
  card: KanbanCard
  role: Role
  detailQuery: string
  selected: boolean
  onToggleCompare: () => void
  onMove: (to: PortfolioStatus) => void
  onConfirmAdvance: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.itemId })
  const discarded = card.status === 'descartado'

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        background: '#fff',
        border: selected ? '1.5px solid #1EA7E8' : '1px solid rgba(11,18,48,0.10)',
        borderRadius: 12,
        overflow: 'hidden',
        opacity: isDragging ? 0.4 : discarded ? 0.55 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        cursor: 'grab',
        touchAction: 'manipulation',
        zIndex: isDragging ? 30 : undefined,
        position: 'relative',
      }}
    >
      {/* Foto + preço em destaque, estilo portal — todo o bloco é o link do imóvel */}
      <Link
        href={`/portfolio/property/${card.propertyId}${detailQuery}`}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        <div
          style={{
            height: 148,
            position: 'relative',
            background: card.coverUrl
              ? `url(${card.coverUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #0E1530, #131B38)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              background: 'rgba(7,11,36,0.82)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14.5,
              padding: '4px 10px',
              borderRadius: 8,
            }}
          >
            {formatMoney(card.price, card.currency)}
          </span>
        </div>
        <div style={{ padding: '10px 10px 0' }}>
          <strong style={{ display: 'block', fontWeight: 700, fontSize: 13.5, color: '#0B1230', lineHeight: 1.3 }}>{card.title}</strong>
          <div style={{ fontSize: 12, color: 'rgba(11,18,48,0.6)', marginTop: 2 }}>
            {countryFlag(card.countryCode)} {card.city} · {card.countryCode}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 11.5, color: 'rgba(11,18,48,0.65)', marginTop: 5 }}>
            {card.bedrooms !== null && <span>🛏 {card.bedrooms}</span>}
            {card.areaM2 !== null && <span>📐 {card.areaM2} m²</span>}
            <span style={{ textTransform: 'capitalize' }}>🏠 {card.propertyType}</span>
          </div>
        </div>
      </Link>
      <div style={{ padding: 10, display: 'grid', gap: 6 }}>
        {card.grandTotal !== null && (
          <div
            style={{
              fontSize: 11.5,
              color: 'rgba(11,18,48,0.65)',
              background: 'rgba(11,18,48,0.06)',
              borderRadius: 6,
              padding: '3px 7px',
              justifySelf: 'start',
            }}
          >
            com impostos: <strong>{formatMoney(card.grandTotal, card.currency)}</strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'rgba(11,18,48,0.55)' }}>
          <span>{card.fitTotal > 0 ? `${card.fitYes}/${card.fitTotal} critérios ✓` : 'sem avaliação'}</span>
          <span style={card.unreadCount > 0 ? { color: '#A03030', fontWeight: 800 } : undefined}>
            💬 {card.commentCount}
            {card.unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 5,
                  background: '#A03030',
                  color: '#fff',
                  borderRadius: 999,
                  padding: '1px 6px',
                  fontSize: 10.5,
                  fontWeight: 800,
                }}
              >
                {card.unreadCount} nova{card.unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {/* fallback de acessibilidade: mover sem drag and drop */}
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) onMove(e.target.value as PortfolioStatus)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              fontSize: 11.5,
              padding: '4px 6px',
              border: '1px solid rgba(11,18,48,0.14)',
              borderRadius: 6,
              fontFamily: 'inherit',
              color: 'rgba(11,18,48,0.7)',
              background: '#fff',
            }}
          >
            <option value="">mover para…</option>
            {STATUS_ORDER.filter((s) => s !== card.status).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <label
            onPointerDown={(e) => e.stopPropagation()}
            title="Selecionar para comparação"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'rgba(11,18,48,0.6)', cursor: 'pointer' }}
          >
            <input type="checkbox" checked={selected} onChange={onToggleCompare} />
            comparar
          </label>
        </div>

        {role === 'team' && card.status === 'avancar' && (
          <button
            onClick={onConfirmAdvance}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(43,160,90,0.16)',
              color: '#1E7A44',
              border: 'none',
              borderRadius: 8,
              padding: '7px 10px',
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Confirmar avanço → transação
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Modal ── */

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7,11,36,0.5)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 14, padding: 22, width: '100%', maxWidth: 420, color: '#0B1230' }}
      >
        {children}
      </div>
    </div>
  )
}

function ModalActions({
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
      <button
        onClick={onCancel}
        style={{ background: 'none', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 8, padding: '9px 14px', fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer', color: '#0B1230' }}
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        style={{ background: '#070B24', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
      >
        {confirmLabel}
      </button>
    </div>
  )
}
