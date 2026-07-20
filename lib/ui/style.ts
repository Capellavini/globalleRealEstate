import type { CSSProperties } from 'react'

// Estilo de card compartilhado — usado em quase toda página do admin e do
// portal do cliente. Sombra suave (não só borda) é o que tira a sensação de
// "flat demo" e dá profundidade real à interface.
export const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid rgba(11,18,48,0.08)',
  borderRadius: 14,
  padding: 20,
  boxShadow: '0 1px 2px rgba(11,18,48,0.04), 0 10px 28px rgba(11,18,48,0.07)',
}
