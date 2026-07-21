import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CapRateCalculator from '@/components/CapRateCalculator'
import Reveal from '@/components/Reveal'

// Ferramenta pública de cap rate — réplica web da planilha do usuário
// ("Calculadora de Cap Rate.xlsx"). CTA pra LP de investidores removido a
// pedido do usuário (frase guardada em messages.calculadora.cta_note/cta
// pra quando quiser reativar).
export default function CalculadoraPage() {
  const t = useTranslations('calculadora')

  return (
    <>
      <Header />

      {/* Hero compacto */}
      <section className="grain" style={{ position: 'relative', background: 'var(--color-navy)', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '150px 28px 70px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
              <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('label')}</span>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4.8vw, 52px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.05, margin: '20px 0' }}>
            {t('headline')}
          </h1>
          <p style={{ color: 'var(--color-ink-dim)', fontSize: 17, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            {t('subheadline')}
          </p>
        </div>
      </section>

      {/* Calculadora */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-paper) 0%, var(--color-paper-2) 100%)', padding: '70px 28px 90px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <Reveal>
            <CapRateCalculator />
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
