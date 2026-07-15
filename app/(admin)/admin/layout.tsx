import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transaction Room — Globalle',
  robots: { index: false, follow: false },
}

// Ferramenta interna: fundo claro predominante, navy só no header,
// ciano só como indicador de ação/status.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#F4F9FE', color: '#0B1230', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
