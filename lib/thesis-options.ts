// Fonte ÚNICA das opções e regras de cascata do formulário de tese (Fase 1.5,
// Bloco 4). Nada de opções espalhadas em componentes.
//
// ARMAZENAMENTO (decisão documentada): sem colunas novas em `theses`.
//   - theses.objective: novos valores ('moradia' | 'para_renda' | 'revenda' |
//     'patrimonial' | 'desenvolvimento') — migração em migration-fase15.sql.
//   - theses.target_countries: códigos ('BR' | 'PT' | 'IT' | 'OUTROS').
//   - theses.target_cities: nomes das regiões escolhidas + texto livre de "Outros".
//   - theses.property_types: strings estruturadas "PAIS:categoria:Tipo"
//     (ex.: "PT:residencial:Apartamento") — categoria e tipo juntos, o mais
//     simples de guardar e de ler de volta.

export const THESIS_OBJECTIVES = [
  { value: 'moradia', label: 'Moradia ou Uso' },
  { value: 'para_renda', label: 'Para renda' },
  { value: 'revenda', label: 'Revenda' },
  { value: 'patrimonial', label: 'Patrimonial' },
  { value: 'desenvolvimento', label: 'Desenvolvimento' },
] as const

export const THESIS_COUNTRIES = [
  { value: 'BR', label: 'Brasil' },
  { value: 'PT', label: 'Portugal' },
  { value: 'IT', label: 'Itália' },
  { value: 'OUTROS', label: 'Outros' },
] as const

// Regiões por país. 'OUTROS' não tem lista — vira campo de texto livre.
export const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  PT: ['Porto', 'Lisboa', 'Outro'],
  BR: ['São Paulo'],
  IT: ['Milão', 'Roma', 'Torino', 'Toscana'],
}

export type PropertyCategory = 'comercial' | 'residencial'

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  comercial: 'Comercial',
  residencial: 'Residencial',
}

// Passo 1 — categorias disponíveis por país.
export const CATEGORIES_BY_COUNTRY: Record<string, PropertyCategory[]> = {
  PT: ['residencial', 'comercial'],
  BR: ['comercial'],
  IT: ['residencial'],
}

// Passo 2 — tipos por país + categoria.
export const TYPES_BY_COUNTRY_CATEGORY: Record<string, string[]> = {
  'PT:residencial': ['Apartamento', 'Moradia'],
  'PT:comercial': ['Loja', 'Desenvolvimento'],
  'BR:comercial': ['Laje', 'Loja', 'Prédio', 'Outro'],
  'IT:residencial': ['Apartamento'],
}

export function propertyTypeValue(country: string, category: PropertyCategory, type: string): string {
  return `${country}:${category}:${type}`
}

export function isStructuredPropertyType(value: string): boolean {
  return value.split(':').length === 3
}

// "PT:residencial:Apartamento" → "Apartamento · PT". Valores antigos (texto
// livre da Fase 1) voltam como estão.
export function formatPropertyType(value: string): string {
  const parts = value.split(':')
  if (parts.length !== 3) return value
  return `${parts[2]} · ${parts[0]}`
}
