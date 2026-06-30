import { headers } from 'next/headers'

export type Currency = 'brl' | 'eur'

// Visitors from Brazil see R$, everyone else € (no manual switch).
// Vercel sets `x-vercel-ip-country` in production; locally it falls back to EUR.
export function detectCurrency(): Currency {
  const country = headers().get('x-vercel-ip-country') || ''
  return country === 'BR' ? 'brl' : 'eur'
}
