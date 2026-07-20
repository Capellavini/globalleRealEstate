import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getKanbanData } from '@/lib/portfolio/queries'
import KanbanBoard from '@/components/portfolio/KanbanBoard'
import ThesisSummary from '@/components/portfolio/ThesisSummary'

export const dynamic = 'force-dynamic'

export default async function TeamKanbanPage({ params }: { params: { thesisId: string } }) {
  const data = await getKanbanData(params.thesisId)
  if (!data) notFound()

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Link href={`/admin/clientes/${data.thesis.client_id}`} style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
          ← Dossiê do cliente
        </Link>
        <Link href="/admin/properties" style={{ fontSize: 13, color: '#0E6FA3', fontWeight: 600, textDecoration: 'none' }}>
          Adicionar imóveis
        </Link>
      </div>

      <ThesisSummary thesis={data.thesis} clientName={data.clientName} />
      <KanbanBoard cards={data.cards} role="team" thesisId={data.thesis.id} />
    </>
  )
}
