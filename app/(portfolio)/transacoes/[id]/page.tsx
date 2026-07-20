import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import ClientTimeline from '@/components/transactions/ClientTimeline'
import DocumentsSection from '@/components/transactions/DocumentsSection'
import ParticipantsSection from '@/components/transactions/ParticipantsSection'
import CommentsSection from '@/components/transactions/CommentsSection'
import { countryFlag } from '@/lib/portfolio/types'
import type { Transaction } from '@/lib/admin/types'

export const dynamic = 'force-dynamic'

type Row = Transaction & {
  properties: { title: string; country_code: string; city: string } | null
}

// Detalhe da transação para o participante. O RLS decide o acesso: sem
// participação (ou sem papel team), a transação simplesmente não existe aqui.
export default async function TransacaoDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { cat?: string }
}) {
  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/admin/login')
  const isTeam = profile?.role === 'team' || profile === null

  const supabase = createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*, properties(title, country_code, city)')
    .eq('id', params.id)
    .maybeSingle()
  if (!data) notFound()
  const transaction = data as unknown as Row

  const basePath = `/transacoes/${transaction.id}`

  return (
    <>
      <Link href="/transacoes" style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        ← Minhas transações
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '12px 0 4px' }}>
        {transaction.properties
          ? `${countryFlag(transaction.properties.country_code)} ${transaction.properties.title}`
          : transaction.client_name}
      </h1>
      {transaction.properties && (
        <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.6)', marginBottom: 20 }}>
          {transaction.properties.city} · {transaction.properties.country_code}
        </p>
      )}

      <div style={{ display: 'grid', gap: 24, marginTop: 12 }}>
        <ClientTimeline transactionId={transaction.id} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 24 }}>
            <DocumentsSection
              transactionId={transaction.id}
              canManage={isTeam}
              basePath={basePath}
              filterCategory={searchParams.cat}
            />
          </div>
          <div style={{ display: 'grid', gap: 24 }}>
            <ParticipantsSection transactionId={transaction.id} canManage={false} />
            <CommentsSection transactionId={transaction.id} basePath={basePath} />
          </div>
        </div>
      </div>
    </>
  )
}
