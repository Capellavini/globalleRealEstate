import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionProfile } from '@/lib/supabase/roles'
import { estimateForProperty, getCostRules } from '@/lib/portfolio/queries'
import { setCriterionFit } from '@/app/actions/portfolio'
import PropertyChat from '@/components/portfolio/PropertyChat'
import { AreaIcon, BedIcon, HomeIcon, TrendingUpIcon } from '@/components/icons/LineIcons'
import {
  countryFlag,
  FIT_COLORS,
  FIT_LABELS,
  formatMoney,
  formatMoneyExact,
  SOURCE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type CriterionFit,
  type FitValue,
  type Property,
  type SourceType,
} from '@/lib/portfolio/types'

export const dynamic = 'force-dynamic'

import { cardStyle as card } from '@/lib/ui/style'

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(11,18,48,0.60)',
  marginBottom: 12,
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { thesis?: string }
}) {
  const { user, profile } = await getSessionProfile()
  if (!user) redirect('/admin/login')
  const isTeam = profile?.role !== 'client'

  const supabase = createClient()

  // Contexto da tese: query param (equipe) ou tese ativa do cliente.
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

  const { data: propertyRow } = await supabase.from('properties').select('*').eq('id', params.id).maybeSingle()
  if (!propertyRow) notFound()
  const property = propertyRow as Property
  const photos: string[] = Array.isArray(property.photos) ? property.photos : []
  const gallery = [property.cover_photo_url, ...photos.filter((p) => p !== property.cover_photo_url)].filter(
    Boolean
  ) as string[]

  const { data: thesis } = thesisId
    ? await supabase.from('theses').select('*').eq('id', thesisId).maybeSingle()
    : { data: null }

  const { data: item } = thesisId
    ? await supabase
        .from('portfolio_items')
        .select('*')
        .eq('thesis_id', thesisId)
        .eq('property_id', property.id)
        .maybeSingle()
    : { data: null }

  const [criteria, fits, comments, history, rules] = await Promise.all([
    isTeam && thesisId
      ? supabase.from('thesis_criteria').select('*').eq('thesis_id', thesisId).order('sort_order').then((r) => r.data ?? [])
      : Promise.resolve([]),
    isTeam && item
      ? supabase.from('criterion_fits').select('*').eq('portfolio_item_id', item.id).then((r) => r.data ?? [])
      : Promise.resolve([]),
    item
      ? supabase
          .from('comments')
          .select('*, profiles(full_name, role)')
          .eq('portfolio_item_id', item.id)
          .order('created_at')
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
    isTeam && item
      ? supabase
          .from('status_history')
          .select('*, profiles(full_name)')
          .eq('portfolio_item_id', item.id)
          .order('changed_at')
          .then((r) => r.data ?? [])
      : Promise.resolve([]),
    getCostRules(),
  ])

  const fitByCriterion = new Map<string, CriterionFit>(
    (fits as CriterionFit[]).map((f) => [f.criterion_id, f] as [string, CriterionFit])
  )
  const estimate = estimateForProperty(property, thesis?.objective ?? 'para_renda', rules)
  const currencyMismatch = estimate.lines.some((l) => l.currency !== property.currency)
  const selfPath = `/portfolio/property/${property.id}${thesisId ? `?thesis=${thesisId}` : ''}`
  const backHref = isTeam && thesisId ? `/admin/portfolios/${thesisId}` : '/portfolio'

  const monthlyRent = property.expected_monthly_rent ? Number(property.expected_monthly_rent) : null
  const yieldPct =
    monthlyRent && Number(property.asking_price) > 0 ? ((monthlyRent * 12) / Number(property.asking_price)) * 100 : null

  return (
    <>
      <Link href={backHref} style={{ fontSize: 13, color: 'rgba(11,18,48,0.60)', textDecoration: 'none' }}>
        {isTeam ? '← Voltar ao portfólio' : '← Voltar às opções'}
      </Link>

      {/* Fotos — hero grande + miniaturas, como num portal de imóveis */}
      {gallery.length > 0 ? (
        <div style={{ margin: '12px 0 20px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[0]}
            alt=""
            style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 16, display: 'block' }}
          />
          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 8 }}>
              {gallery.slice(1).map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" style={{ height: 76, width: 100, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ))}
            </div>
          )}
        </div>
      ) : (
        isTeam && (
          <div
            style={{
              margin: '12px 0 20px',
              height: 120,
              borderRadius: 16,
              border: '1px dashed rgba(11,18,48,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              color: 'rgba(11,18,48,0.5)',
            }}
          >
            Sem fotos — adicione em{' '}
            <Link href={`/admin/properties/${property.id}`} style={{ color: '#0E6FA3', marginLeft: 4 }}>
              editar imóvel
            </Link>
          </div>
        )
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, margin: '0 0 4px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{property.title}</h1>
        {item && (
          <span
            style={{
              background: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS].bg,
              color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS].fg,
              borderRadius: 999,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]}
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.6)', marginBottom: 12 }}>
        {countryFlag(property.country_code)} {property.city}
        {property.municipality ? ` · ${property.municipality}` : ''} · {property.country_code}
        {property.address ? ` — ${property.address}` : ''}
      </p>

      {/* Preço em destaque + faixa de fatos-chave, como num portal */}
      <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>
        {formatMoney(Number(property.asking_price), property.currency)}
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 14, color: 'rgba(11,18,48,0.75)', marginBottom: 24, alignItems: 'center' }}>
        {property.bedrooms !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <BedIcon size={17} style={{ color: 'rgba(11,18,48,0.5)' }} /> {property.bedrooms} quartos
          </span>
        )}
        {property.area_m2 !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <AreaIcon size={17} style={{ color: 'rgba(11,18,48,0.5)' }} /> {property.area_m2} m²
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, textTransform: 'capitalize' }}>
          <HomeIcon size={17} style={{ color: 'rgba(11,18,48,0.5)' }} /> {property.property_type}
        </span>
        {property.area_m2 && (
          <span>
            Preço/m² {formatMoney(Math.round(Number(property.asking_price) / Number(property.area_m2)), property.currency)}
          </span>
        )}
        {yieldPct !== null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#1E7A44', fontWeight: 700 }}>
            <TrendingUpIcon size={17} /> Yield {yieldPct.toFixed(1)}%/ano
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
        <section style={{ display: 'grid', gap: 24 }}>
          {/* Descrição */}
          <div style={card}>
            <h2 style={sectionTitle}>Sobre o anúncio</h2>
            {property.description ? (
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(11,18,48,0.8)', whiteSpace: 'pre-wrap' }}>
                {property.description}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.45)', fontStyle: 'italic' }}>
                {isTeam ? (
                  <>
                    Sem descrição —{' '}
                    <Link href={`/admin/properties/${property.id}`} style={{ color: '#0E6FA3' }}>
                      adicione ao editar o imóvel
                    </Link>
                    .
                  </>
                ) : (
                  'Descrição em breve.'
                )}
              </p>
            )}
            {isTeam && (
              <div style={{ fontSize: 13, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(11,18,48,0.08)' }}>
                <span style={{ color: 'rgba(11,18,48,0.55)' }}>Origem: </span>
                <strong>
                  {SOURCE_LABELS[property.source_type as SourceType] ?? property.source_type}
                  {property.source_name ? ` — ${property.source_name}` : ''}
                </strong>
              </div>
            )}
            {property.listing_url && (
              <a
                href={property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 14, fontSize: 13, fontWeight: 700, color: '#0E6FA3' }}
              >
                Ver anúncio original ↗
              </a>
            )}
          </div>

          {/* Custos de aquisição */}
          <div style={card}>
            <h2 style={sectionTitle}>Custos de aquisição</h2>
            {estimate.lines.length === 0 ? (
              <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>
                Sem regras de custo cadastradas para {property.country_code}. A equipe pode adicionar em Custos.
              </p>
            ) : (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(11,18,48,0.08)' }}>
                      <td style={{ padding: '8px 0', color: 'rgba(11,18,48,0.55)' }}>Preço pedido</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>
                        {formatMoneyExact(Number(property.asking_price), property.currency)}
                      </td>
                    </tr>
                    {estimate.lines.map((line) => (
                      <tr key={line.label} style={{ borderBottom: '1px solid rgba(11,18,48,0.08)' }}>
                        <td style={{ padding: '8px 0', color: 'rgba(11,18,48,0.75)' }}>
                          {line.label}
                          {line.municipal && (
                            <span style={{ fontSize: 11, color: 'rgba(11,18,48,0.45)' }}> (municipal)</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatMoneyExact(line.amount, line.currency)}</td>
                      </tr>
                    ))}
                    {currencyMismatch ? (
                      <tr>
                        <td colSpan={2} style={{ padding: '10px 0', fontSize: 12, color: '#A03030' }}>
                          ⚠ Preço e custos estão em moedas diferentes — corrija a moeda do imóvel para ver o total.
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td style={{ padding: '10px 0', fontWeight: 800 }}>Custo total de aquisição</td>
                        <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 800, fontSize: 16 }}>
                          {formatMoneyExact(estimate.grandTotal, property.currency)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <p style={{ fontSize: 11.5, color: 'rgba(11,18,48,0.5)', marginTop: 8 }}>
                  Estimativa — regras vigentes de {estimate.rulesAsOf ? formatDateTime(estimate.rulesAsOf) : '—'}. Valores
                  finais dependem de escritura e enquadramento fiscal.
                </p>
              </>
            )}
          </div>

          {/* Histórico — só equipe */}
          {isTeam && (history as any[]).length > 0 && (
            <div style={card}>
              <h2 style={sectionTitle}>Histórico</h2>
              <div style={{ display: 'grid', gap: 8 }}>
                {(history as any[]).map((h) => (
                  <div key={h.id} style={{ fontSize: 13, color: 'rgba(11,18,48,0.7)' }}>
                    <strong style={{ color: '#0B1230' }}>{formatDateTime(h.changed_at)}</strong>
                    {' — '}
                    {h.from_status ? `${STATUS_LABELS[h.from_status as keyof typeof STATUS_LABELS]} → ` : ''}
                    {STATUS_LABELS[h.to_status as keyof typeof STATUS_LABELS]}
                    {' · '}
                    {h.profiles?.full_name ?? '—'}
                    {h.reason && <em style={{ display: 'block', color: 'rgba(11,18,48,0.55)' }}>“{h.reason}”</em>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section style={{ display: 'grid', gap: 24 }}>
          {/* Fit com a tese — só equipe */}
          {isTeam && (
            <div style={card}>
              <h2 style={sectionTitle}>Fit com a tese</h2>
              {!thesisId || (criteria as any[]).length === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>
                  {thesisId ? 'A tese ainda não tem critérios cadastrados.' : 'Sem contexto de tese para avaliar o fit.'}
                </p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {(criteria as any[]).map((criterion) => {
                    const fit = fitByCriterion.get(criterion.id)
                    return (
                      <div key={criterion.id} style={{ borderBottom: '1px solid rgba(11,18,48,0.07)', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5 }}>
                          <span>{criterion.label}</span>
                          <strong style={{ color: fit ? FIT_COLORS[fit.fit] : 'rgba(11,18,48,0.35)', fontSize: 15 }}>
                            {fit ? FIT_LABELS[fit.fit] : '·'}
                          </strong>
                        </div>
                        {fit?.note && (
                          <p style={{ fontSize: 12.5, color: 'rgba(11,18,48,0.55)', marginTop: 4 }}>{fit.note}</p>
                        )}
                        {item && (
                          <form action={setCriterionFit} style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <input type="hidden" name="portfolio_item_id" value={item.id} />
                            <input type="hidden" name="criterion_id" value={criterion.id} />
                            <input type="hidden" name="revalidate" value={selfPath} />
                            <select
                              name="fit"
                              defaultValue={fit?.fit ?? ''}
                              required
                              style={{ padding: '5px 8px', border: '1px solid rgba(11,18,48,0.14)', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit' }}
                            >
                              <option value="" disabled>
                                avaliar…
                              </option>
                              <option value="sim">✓ atende</option>
                              <option value="parcial">~ parcial</option>
                              <option value="nao">✗ não atende</option>
                            </select>
                            <input
                              type="text"
                              name="note"
                              defaultValue={fit?.note ?? ''}
                              placeholder="nota (opcional)"
                              style={{ flex: 1, minWidth: 120, padding: '5px 8px', border: '1px solid rgba(11,18,48,0.14)', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit' }}
                            />
                            <button
                              type="submit"
                              style={{ padding: '5px 12px', border: '1px solid rgba(11,18,48,0.15)', borderRadius: 6, background: 'none', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
                            >
                              Salvar
                            </button>
                          </form>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Comentários — chat em tempo real (Supabase Realtime) */}
          <div style={card}>
            <h2 style={sectionTitle}>Comentários</h2>
            {!item ? (
              <p style={{ fontSize: 13, color: 'rgba(11,18,48,0.55)' }}>
                Este imóvel ainda não está num portfólio — sem thread de comentários.
              </p>
            ) : (
              <PropertyChat itemId={item.id} initialComments={comments as any[]} currentUserId={user.id} />
            )}
          </div>
        </section>
      </div>
    </>
  )
}
