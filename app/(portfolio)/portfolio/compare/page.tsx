import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import { estimateForProperty, getCostRules } from '@/lib/portfolio/queries'
import {
  countryFlag,
  FIT_COLORS,
  FIT_LABELS,
  formatMoney,
  STATUS_COLORS,
  STATUS_LABELS,
  type Property,
} from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ids?: string; thesis?: string }
}) {
  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/admin/login')
  const isTeam = profile?.role !== 'client'

  const ids = (searchParams.ids ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4)

  const supabase = createClient()

  let thesisId = searchParams.thesis ?? null
  if (!thesisId && !isTeam) {
    const { data } = await supabase
      .from('theses')
      .select('id')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
    thesisId = data?.id ?? null
  }

  const backHref = isTeam && thesisId ? `/admin/portfolios/${thesisId}` : '/portfolio'

  if (ids.length < 2) {
    return (
      <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.6)' }}>
        Selecione de 2 a 4 imóveis no kanban para comparar. <Link href={backHref} style={{ color: '#0E6FA3' }}>Voltar</Link>
      </p>
    )
  }

  const [{ data: propertiesData }, { data: thesis }, rules] = await Promise.all([
    supabase.from('properties').select('*').in('id', ids),
    thesisId ? supabase.from('theses').select('*').eq('id', thesisId).maybeSingle() : Promise.resolve({ data: null }),
    getCostRules(),
  ])

  // mantém a ordem da seleção
  const properties = ids
    .map((id) => (propertiesData ?? []).find((p) => p.id === id))
    .filter(Boolean) as Property[]

  const [{ data: criteria }, { data: items }] = await Promise.all([
    thesisId
      ? supabase.from('thesis_criteria').select('*').eq('thesis_id', thesisId).order('sort_order')
      : Promise.resolve({ data: [] }),
    thesisId
      ? supabase.from('portfolio_items').select('*').eq('thesis_id', thesisId).in('property_id', ids)
      : Promise.resolve({ data: [] }),
  ])

  const itemByProperty = new Map((items ?? []).map((i) => [i.property_id, i]))
  const itemIds = (items ?? []).map((i) => i.id)
  const { data: fits } = itemIds.length
    ? await supabase.from('criterion_fits').select('*').in('portfolio_item_id', itemIds)
    : { data: [] }
  const fitLookup = new Map((fits ?? []).map((f) => [`${f.portfolio_item_id}:${f.criterion_id}`, f]))

  const estimates = properties.map((p) => estimateForProperty(p, thesis?.objective ?? 'arrendar', rules))

  const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 12,
    color: 'rgba(11,18,48,0.55)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    verticalAlign: 'top',
    background: 'rgba(11,18,48,0.03)',
  }
  const td: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13.5,
    verticalAlign: 'top',
    borderLeft: '1px solid rgba(11,18,48,0.06)',
    minWidth: 180,
  }

  return (
    <>
      <Link href={backHref} style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        {isTeam ? '← Voltar ao portfólio' : '← Voltar às opções'}
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '12px 0 20px' }}>Comparação de imóveis</h1>

      <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid rgba(11,18,48,0.10)', borderRadius: 14 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <th style={th}></th>
              {properties.map((p) => (
                <td key={p.id} style={{ ...td, padding: 0 }}>
                  <div
                    style={{
                      height: 130,
                      background: p.cover_photo_url
                        ? `url(${p.cover_photo_url}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #0E1530, #131B38)',
                      borderRadius: '12px 12px 0 0',
                      margin: 8,
                      marginBottom: 0,
                    }}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <th style={th}>Imóvel</th>
              {properties.map((p) => (
                <td key={p.id} style={td}>
                  <Link
                    href={`/portfolio/property/${p.id}${thesisId ? `?thesis=${thesisId}` : ''}`}
                    style={{ fontWeight: 800, color: '#0B1230', textDecoration: 'none', fontSize: 14.5 }}
                  >
                    {p.title}
                  </Link>
                  <div style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.55)', marginTop: 3 }}>
                    {countryFlag(p.country_code)} {p.city} · {p.country_code}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <th style={th}>Status</th>
              {properties.map((p) => {
                const item = itemByProperty.get(p.id)
                if (!item) return <td key={p.id} style={td}>—</td>
                const colors = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]
                return (
                  <td key={p.id} style={td}>
                    <span style={{ background: colors.bg, color: colors.fg, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                      {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </td>
                )
              })}
            </tr>
            <tr>
              <th style={th}>Preço pedido</th>
              {properties.map((p) => (
                <td key={p.id} style={{ ...td, fontWeight: 700 }}>
                  {formatMoney(Number(p.asking_price), p.currency)}
                </td>
              ))}
            </tr>
            <tr style={{ background: 'rgba(30,167,232,0.06)' }}>
              <th style={{ ...th, background: 'transparent' }}>Custo total de aquisição</th>
              {properties.map((p, i) => (
                <td key={p.id} style={{ ...td, fontWeight: 800, fontSize: 15 }}>
                  {estimates[i].lines.length ? formatMoney(estimates[i].grandTotal, p.currency) : '—'}
                  {estimates[i].lines.length > 0 && (
                    <div style={{ fontSize: 11, color: 'rgba(11,18,48,0.5)', fontWeight: 400 }}>
                      estimativa · +{formatMoney(estimates[i].costsTotal, p.currency)} em custos
                    </div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th style={th}>Preço/m²</th>
              {properties.map((p) => (
                <td key={p.id} style={td}>
                  {p.area_m2 ? formatMoney(Math.round(Number(p.asking_price) / Number(p.area_m2)), p.currency) : '—'}
                </td>
              ))}
            </tr>
            <tr>
              <th style={th}>Tipo · área · quartos</th>
              {properties.map((p) => (
                <td key={p.id} style={td}>
                  {p.property_type} · {p.area_m2 ? `${p.area_m2} m²` : '—'} · {p.bedrooms ?? '—'} qts
                </td>
              ))}
            </tr>
            {(criteria ?? []).map((criterion) => (
              <tr key={criterion.id} style={{ borderTop: '1px solid rgba(11,18,48,0.06)' }}>
                <th style={th}>{criterion.label}</th>
                {properties.map((p) => {
                  const item = itemByProperty.get(p.id)
                  const fit = item ? fitLookup.get(`${item.id}:${criterion.id}`) : null
                  return (
                    <td key={p.id} style={{ ...td, fontSize: 16, fontWeight: 800, color: fit ? FIT_COLORS[fit.fit as keyof typeof FIT_COLORS] : 'rgba(11,18,48,0.3)' }}>
                      {fit ? FIT_LABELS[fit.fit as keyof typeof FIT_LABELS] : '·'}
                      {fit?.note && (
                        <div style={{ fontSize: 11.5, fontWeight: 400, color: 'rgba(11,18,48,0.55)' }}>{fit.note}</div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)', marginTop: 10 }}>
        Custos de aquisição são estimativas com base nas regras fiscais vigentes cadastradas.
      </p>
    </>
  )
}
