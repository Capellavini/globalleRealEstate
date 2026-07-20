'use client'

import { useState } from 'react'
import { PROPERTY_TYPES, SOURCE_LABELS, type Property, type SourceType } from '@/lib/portfolio/types'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid rgba(11,18,48,0.15)',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  background: '#fff',
  color: '#0B1230',
}

// Moeda padrão por país — evita o erro clássico de cadastrar um imóvel em
// Portugal com moeda BRL (ou vice-versa), que quebra a tabela de custos.
const CURRENCY_BY_COUNTRY: Record<string, string> = {
  PT: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  BR: 'BRL',
  US: 'USD',
  AE: 'AED',
  GB: 'GBP',
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'grid', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
      <span>
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'rgba(11,18,48,0.5)' }}> — {hint}</span>}
      </span>
      {children}
    </label>
  )
}

// Campos do formulário de imóvel (criar/editar). BR exige município (ITBI).
export default function PropertyFormFields({ property }: { property?: Property }) {
  const [currency, setCurrency] = useState(property?.currency ?? 'EUR')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Título">
          <input name="title" type="text" required defaultValue={property?.title} placeholder="T2 renovado na Foz" style={inputStyle} />
        </Field>
      </div>

      <Field label="País (ISO)" hint="dirige o motor de custos e a moeda">
        <select
          name="country_code"
          required
          defaultValue={property?.country_code ?? ''}
          style={inputStyle}
          onChange={(e) => {
            const suggested = CURRENCY_BY_COUNTRY[e.target.value]
            if (suggested) setCurrency(suggested)
          }}
        >
          <option value="" disabled>
            selecione…
          </option>
          <option value="PT">🇵🇹 Portugal</option>
          <option value="BR">🇧🇷 Brasil</option>
          <option value="ES">🇪🇸 Espanha</option>
          <option value="IT">🇮🇹 Itália</option>
          <option value="US">🇺🇸 Estados Unidos</option>
          <option value="AE">🇦🇪 Emirados Árabes</option>
        </select>
      </Field>
      <Field label="Cidade">
        <input name="city" type="text" required defaultValue={property?.city} style={inputStyle} />
      </Field>
      <Field label="Município" hint="obrigatório no BR (ITBI)">
        <input name="municipality" type="text" defaultValue={property?.municipality ?? ''} style={inputStyle} />
      </Field>
      <Field label="Endereço">
        <input name="address" type="text" defaultValue={property?.address ?? ''} style={inputStyle} />
      </Field>

      <Field label="Tipo">
        <select name="property_type" required defaultValue={property?.property_type ?? ''} style={inputStyle}>
          <option value="" disabled>
            selecione…
          </option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Preço pedido">
        <input name="asking_price" type="number" step="any" required defaultValue={property?.asking_price} style={inputStyle} />
      </Field>
      <Field label="Moeda" hint="preenchida pelo país, pode ajustar">
        <select
          name="currency"
          required
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={inputStyle}
        >
          <option value="EUR">EUR</option>
          <option value="BRL">BRL</option>
          <option value="USD">USD</option>
          <option value="AED">AED</option>
          <option value="GBP">GBP</option>
        </select>
      </Field>
      <Field label="Área (m²)">
        <input name="area_m2" type="number" step="any" defaultValue={property?.area_m2 ?? ''} style={inputStyle} />
      </Field>
      <Field label="Quartos">
        <input name="bedrooms" type="number" defaultValue={property?.bedrooms ?? ''} style={inputStyle} />
      </Field>
      <Field label="Renda mensal esperada" hint="opcional, mesma moeda do preço — calcula o yield">
        <input name="expected_monthly_rent" type="number" step="any" defaultValue={property?.expected_monthly_rent ?? ''} style={inputStyle} />
      </Field>

      <Field label="Origem" hint="semente da rede">
        <select name="source_type" required defaultValue={property?.source_type ?? 'portal'} style={inputStyle}>
          {(Object.keys(SOURCE_LABELS) as SourceType[]).map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Nome da origem" hint="portal / corretor parceiro">
        <input name="source_name" type="text" defaultValue={property?.source_name ?? ''} style={inputStyle} />
      </Field>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Descrição" hint="texto que o cliente vê na página do imóvel">
          <textarea
            name="description"
            rows={4}
            defaultValue={property?.description ?? ''}
            placeholder="Ex.: T2 renovado, luz natural todo o dia, a 5 min a pé do metro…"
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </Field>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="Link do anúncio">
          <input name="listing_url" type="url" defaultValue={property?.listing_url ?? ''} style={inputStyle} />
        </Field>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <Field label="URL da foto de capa" hint="ou envie fotos na tela de edição">
          <input name="cover_photo_url" type="url" defaultValue={property?.cover_photo_url ?? ''} style={inputStyle} />
        </Field>
      </div>
    </div>
  )
}
