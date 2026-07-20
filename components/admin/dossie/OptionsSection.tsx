import { createClient } from '@/lib/supabase/server'
import { getKanbanData } from '@/lib/portfolio/queries'
import { getSessionProfile } from '@/lib/supabase/roles'
import KanbanBoard from '@/components/portfolio/KanbanBoard'
import ThesisSummary from '@/components/portfolio/ThesisSummary'

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(11,18,48,0.60)',
  marginBottom: 14,
}

// O kanban embutido no dossiê — mesmo componente que o cliente vê em
// "Opções", sem trocar de página. Só aparece quando há tese ativa.
export default async function OptionsSection({ clientId }: { clientId: string }) {
  const supabase = createClient()
  const { data: thesis } = await supabase
    .from('theses')
    .select('id')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!thesis) return null

  const { user } = await getSessionProfile()
  if (!user) return null

  const data = await getKanbanData(thesis.id, user.id)
  if (!data) return null

  return (
    <div>
      <h2 style={sectionTitle}>Opções</h2>
      <ThesisSummary thesis={data.thesis} />
      <KanbanBoard cards={data.cards} role="team" thesisId={data.thesis.id} />
    </div>
  )
}
