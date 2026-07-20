import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileSection from '@/components/admin/dossie/ProfileSection'
import ThesisSection from '@/components/admin/dossie/ThesisSection'
import OptionsSection from '@/components/admin/dossie/OptionsSection'
import TransactionSection from '@/components/admin/dossie/TransactionSection'
import HistorySection from '@/components/admin/dossie/HistorySection'
import type { Profile } from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

// O dossiê: a jornada inteira do cliente numa página só — Perfil → Tese →
// Opções → Transação → Histórico. Substitui as páginas separadas de
// tese/portfólio/transação que existiam antes (Passo 3 da consolidação).
export default async function ClientDossierPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { ok?: string; erro?: string; custos?: string; cat?: string }
}) {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', params.id).eq('role', 'client').maybeSingle()
  if (!data) notFound()
  const profile = data as Profile
  const basePath = `/admin/clientes/${profile.id}`

  return (
    <>
      <Link href="/admin/clientes" style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        ← Clientes
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

      <div style={{ display: 'grid', gap: 24, marginTop: 16, maxWidth: 920 }}>
        <ProfileSection profile={profile} redirectTo={basePath} />
        <ThesisSection clientId={profile.id} />
        <OptionsSection clientId={profile.id} />
        <TransactionSection
          clientId={profile.id}
          basePath={basePath}
          costFilter={searchParams.custos}
          docCategory={searchParams.cat}
        />
        <HistorySection clientId={profile.id} />
      </div>
    </>
  )
}
