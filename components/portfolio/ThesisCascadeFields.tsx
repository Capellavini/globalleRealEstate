'use client'

import { useState } from 'react'
import {
  CATEGORIES_BY_COUNTRY,
  CATEGORY_LABELS,
  isStructuredPropertyType,
  propertyTypeValue,
  REGIONS_BY_COUNTRY,
  THESIS_COUNTRIES,
  TYPES_BY_COUNTRY_CATEGORY,
  type PropertyCategory,
} from '@/lib/thesis-options'

// Campos em cascata da tese: Países → Região → Categoria → Tipo.
// Os checkboxes têm `name`, então o próprio <form> submete os valores
// (formData.getAll) — o estado React só controla a visibilidade da cascata.

const groupLabel: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
}

const checkLabel: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.14)',
  borderRadius: 8,
  padding: '7px 12px',
  cursor: 'pointer',
}

const subGroup: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 700,
  color: 'rgba(11,18,48,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

export default function ThesisCascadeFields({
  initialCountries = [],
  initialRegions = [],
  initialOtherRegion = '',
  initialTypes = [],
}: {
  initialCountries?: string[]
  initialRegions?: string[]
  initialOtherRegion?: string
  initialTypes?: string[]
}) {
  const validCountries = THESIS_COUNTRIES.map((c) => c.value as string)
  const [countries, setCountries] = useState<string[]>(initialCountries.filter((c) => validCountries.includes(c)))
  const [regions, setRegions] = useState<string[]>(initialRegions)
  const [types, setTypes] = useState<string[]>(initialTypes.filter(isStructuredPropertyType))
  const [categories, setCategories] = useState<string[]>(
    // categorias derivadas dos tipos iniciais ("PT:residencial:Apartamento" → "PT:residencial")
    [...new Set(initialTypes.filter(isStructuredPropertyType).map((t) => t.split(':').slice(0, 2).join(':')))]
  )
  const [otherRegion, setOtherRegion] = useState(initialOtherRegion)

  function toggleCountry(code: string) {
    setCountries((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
      if (prev.includes(code)) {
        // país desmarcado: limpa regiões/categorias/tipos dele
        setRegions((r) => r.filter((region) => !(REGIONS_BY_COUNTRY[code] ?? []).includes(region)))
        setCategories((c) => c.filter((cat) => !cat.startsWith(`${code}:`)))
        setTypes((t) => t.filter((type) => !type.startsWith(`${code}:`)))
        if (code === 'OUTROS') setOtherRegion('')
      }
      return next
    })
  }

  function toggleRegion(region: string) {
    setRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  function toggleCategory(key: string) {
    setCategories((prev) => {
      if (prev.includes(key)) {
        setTypes((t) => t.filter((type) => !type.startsWith(`${key}:`)))
        return prev.filter((c) => c !== key)
      }
      return [...prev, key]
    })
  }

  function toggleType(value: string) {
    setTypes((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]))
  }

  const selectedWithCategories = countries.filter((c) => CATEGORIES_BY_COUNTRY[c]?.length)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Países-alvo */}
      <div style={{ display: 'grid', gap: 8 }}>
        <span style={groupLabel}>Países-alvo</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {THESIS_COUNTRIES.map((country) => (
            <label key={country.value} style={checkLabel}>
              <input
                type="checkbox"
                name="target_countries"
                value={country.value}
                checked={countries.includes(country.value)}
                onChange={() => toggleCountry(country.value)}
              />
              {country.label}
            </label>
          ))}
        </div>
      </div>

      {/* Região */}
      {countries.length > 0 && (
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={groupLabel}>Região</span>
          {countries
            .filter((c) => REGIONS_BY_COUNTRY[c])
            .map((country) => (
              <div key={country} style={{ display: 'grid', gap: 6 }}>
                <span style={subGroup}>{THESIS_COUNTRIES.find((c) => c.value === country)?.label}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {REGIONS_BY_COUNTRY[country].map((region) => (
                    <label key={region} style={checkLabel}>
                      <input
                        type="checkbox"
                        name="target_cities"
                        value={region}
                        checked={regions.includes(region)}
                        onChange={() => toggleRegion(region)}
                      />
                      {region}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          {countries.includes('OUTROS') && (
            <div style={{ display: 'grid', gap: 6 }}>
              <span style={subGroup}>Outros</span>
              <input
                type="text"
                name="target_cities"
                value={otherRegion}
                onChange={(e) => setOtherRegion(e.target.value)}
                placeholder="Região (texto livre) — ex.: Miami, Dubai…"
                style={{
                  padding: '9px 12px',
                  border: '1px solid rgba(11,18,48,0.15)',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontFamily: 'inherit',
                  maxWidth: 360,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Tipo de imóvel: categoria → tipo, por país */}
      {selectedWithCategories.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={groupLabel}>Tipo de imóvel</span>
          {selectedWithCategories.map((country) => (
            <div key={country} style={{ display: 'grid', gap: 8, paddingLeft: 2 }}>
              <span style={subGroup}>{THESIS_COUNTRIES.find((c) => c.value === country)?.label}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(CATEGORIES_BY_COUNTRY[country] ?? []).map((category) => {
                  const key = `${country}:${category}`
                  return (
                    <label key={key} style={checkLabel}>
                      <input type="checkbox" checked={categories.includes(key)} onChange={() => toggleCategory(key)} />
                      {CATEGORY_LABELS[category as PropertyCategory]}
                    </label>
                  )
                })}
              </div>
              {(CATEGORIES_BY_COUNTRY[country] ?? [])
                .filter((category) => categories.includes(`${country}:${category}`))
                .map((category) => (
                  <div key={category} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 12 }}>
                    {(TYPES_BY_COUNTRY_CATEGORY[`${country}:${category}`] ?? []).map((type) => {
                      const value = propertyTypeValue(country, category as PropertyCategory, type)
                      return (
                        <label key={value} style={{ ...checkLabel, fontSize: 12.5, padding: '5px 10px' }}>
                          <input
                            type="checkbox"
                            name="property_types"
                            value={value}
                            checked={types.includes(value)}
                            onChange={() => toggleType(value)}
                          />
                          {type}
                        </label>
                      )
                    })}
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
