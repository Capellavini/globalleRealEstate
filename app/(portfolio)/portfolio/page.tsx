import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import { getKanbanData } from '@/lib/portfolio/queries'
import KanbanBoard from '@/components/portfolio/KanbanBoard'
import ThesisSummary from '@/components/portfolio/ThesisSummary'

export const dynamic = 'force-dynamic'

// Cliente cai direto no kanban da sua tese ativa.
export default async function ClientPortfolioPage() {
  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/admin/login')

  // Equipe não tem tese própria; advogado vive nas transações.
  if (profile?.role === 'lawyer') redirect('/transacoes')
  if (profile?.role !== 'client') redirect('/admin/portfolios')

  const supabase = createClient()
  const { data: thesis } = await supabase
    .from('theses')
    .select('id')
    .eq('client_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!thesis) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px dashed rgba(11,18,48,0.15)',
          borderRadius: 12,
          padding: 48,
          textAlign: 'center',
          color: 'rgba(11,18,48,0.6)',
          fontSize: 14,
        }}
      >
        Sua tese de investimento ainda não foi configurada. A equipe Globalle está preparando —{' '}
        <a href="mailto:hello@globalleinsights.com" style={{ color: '#0E6FA3' }}>
          fale conosco
        </a>{' '}
        se precisar.
      </div>
    )
  }

  const data = await getKanbanData(thesis.id, user.id)
  if (!data) redirect('/admin/login')

  return (
    <>
      <ThesisSummary thesis={data.thesis} />
      <KanbanBoard cards={data.cards} role="client" thesisId={data.thesis.id} />
    </>
  )
}
