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
import { moveFunnelCard } from '@/app/actions/funnel'
import { countryFlag } from '@/lib/portfolio/types'

export type FunnelCard = {
  clientId: string
  clientName: string
  column: string
  subLabel: string | null
  propertyTitle: string | null
  propertyCountry: string | null
}

// Colunas com uma ação clara por trás do drop (ver app/actions/funnel.ts).
// As demais (Lead, Tese definida, Buscando imóveis) não são alvo de drop —
// dependem de criar tese ou escolher imóvel, isso continua no dossiê.
const DROPPABLE_COLUMNS = new Set(['Proposta', 'Due Diligence', 'Fechado', 'Perdido'])

export default function FunnelBoard({
  columns,
  initialCards,
  revenueByColumn,
}: {
  columns: readonly string[]
  initialCards: FunnelCard[]
  revenueByColumn: Record<string, string>
}) {
  const router = useRouter()
  const [cards, setCards] = useState(initialCards)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  function onDragEnd(event: DragEndEvent) {
    const card = cards.find((c) => c.clientId === String(event.active.id))
    const to = event.over?.id as string | undefined
    if (!card || !to || to === card.column) return

    // Fechar/perder uma transação é uma decisão relevante — confirma antes.
    if (
      (to === 'Fechado' || to === 'Perdido') &&
      !window.confirm(`Mover ${card.clientName} para "${to}"?`)
    ) {
      return
    }

    const from = card.column
    setCards((prev) => prev.map((c) => (c.clientId === card.clientId ? { ...c, column: to, subLabel: null } : c)))
    startTransition(async () => {
      try {
        await moveFunnelCard(card.clientId, from, to)
        router.refresh()
      } catch (e) {
        setCards((prev) => prev.map((c) => (c.clientId === card.clientId ? { ...c, column: from } : c)))
        alert(e instanceof Error ? e.message : 'Erro ao mover.')
      }
    })
  }

  return (
    <>
      <style>{`
        .crm-cols { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; padding-bottom: 8px; }
        .crm-col { min-width: 210px; width: 210px; flex-shrink: 0; }
        @media (max-width: 860px) { .crm-col { min-width: 78vw; } }
      `}</style>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="crm-cols">
          {columns.map((column) => (
            <Column key={column} name={column} revenue={revenueByColumn[column]}>
              {cards
                .filter((c) => c.column === column)
                .map((c) => (
                  <Card key={c.clientId} card={c} />
                ))}
            </Column>
          ))}
        </div>
      </DndContext>
    </>
  )
}

const COLUMN_COLORS: Record<string, { bg: string; fg: string }> = {
  Lead: { bg: 'rgba(11,18,48,0.03)', fg: 'rgba(11,18,48,0.55)' },
  'Tese definida': { bg: 'rgba(11,18,48,0.03)', fg: 'rgba(11,18,48,0.55)' },
  'Buscando imóveis': { bg: 'rgba(30,167,232,0.05)', fg: '#0E6FA3' },
  Proposta: { bg: 'rgba(30,167,232,0.05)', fg: '#0E6FA3' },
  'Due Diligence': { bg: 'rgba(30,167,232,0.05)', fg: '#0E6FA3' },
  Fechado: { bg: 'rgba(43,160,90,0.05)', fg: '#1E7A44' },
  Perdido: { bg: 'rgba(194,61,61,0.04)', fg: '#A03030' },
}

function Column({ name, revenue, children }: { name: string; revenue?: string; children: React.ReactNode }) {
  const droppable = DROPPABLE_COLUMNS.has(name)
  const { isOver, setNodeRef } = useDroppable({ id: name, disabled: !droppable })
  const colors = COLUMN_COLORS[name] ?? { bg: 'rgba(11,18,48,0.03)', fg: 'rgba(11,18,48,0.55)' }
  const count = Array.isArray(children) ? children.length : children ? 1 : 0

  return (
    <div
      ref={setNodeRef}
      className="crm-col"
      style={{
        background: isOver ? 'rgba(30,167,232,0.10)' : colors.bg,
        border: '1px solid rgba(11,18,48,0.08)',
        borderRadius: 12,
        padding: 10,
        display: 'grid',
        gap: 10,
        alignContent: 'start',
      }}
    >
      <div style={{ padding: '2px 4px', display: 'grid', gap: 2 }}>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.fg,
          }}
        >
          {name} <span style={{ color: 'rgba(11,18,48,0.35)' }}>({count})</span>
        </span>
        {revenue && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A6320' }} title="Receita prevista ainda não recebida">
            ⏳ {revenue}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Card({ card }: { card: FunnelCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.clientId })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        background: '#fff',
        border: '1px solid rgba(11,18,48,0.10)',
        borderRadius: 10,
        padding: 14,
        display: 'grid',
        gap: 6,
        cursor: 'grab',
        touchAction: 'manipulation',
        opacity: isDragging ? 0.4 : 1,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        position: 'relative',
        zIndex: isDragging ? 30 : undefined,
      }}
    >
      {/* Todo o clique abre o dossiê; onPointerDown barra o drag do card
          herdar o clique (mesmo bug corrigido no kanban de imóveis). */}
      <Link
        href={`/admin/clientes/${card.clientId}`}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ textDecoration: 'none', color: '#0B1230', display: 'grid', gap: 6 }}
      >
        <strong style={{ fontSize: 14, fontWeight: 700 }}>{card.clientName}</strong>
        {card.propertyTitle && (
          <span style={{ fontSize: 12, color: 'rgba(11,18,48,0.6)' }}>
            {card.propertyCountry && countryFlag(card.propertyCountry)} {card.propertyTitle}
          </span>
        )}
        {card.subLabel && <span style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.55)' }}>{card.subLabel}</span>}
      </Link>
    </div>
  )
}
