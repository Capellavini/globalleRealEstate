export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#070B24', color: '#F5F7FA', fontFamily: 'var(--font-heading)',
      flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24,
    }}>
      <h1 style={{ fontSize: 80, fontWeight: 800, margin: 0, color: '#1EA7E8' }}>404</h1>
      <p style={{ fontSize: 20, color: 'rgba(245,247,250,0.6)' }}>Página não encontrada</p>
      <a href="/" style={{
        marginTop: 16, color: '#1EA7E8', textDecoration: 'none',
        fontSize: 15, fontWeight: 600,
      }}>
        ← Voltar ao início
      </a>
    </div>
  )
}
