'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Icon from '@/components/Icon'

export default function ContatoPage() {
  const t = useTranslations('contato')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    // TODO: conectar a backend / Resend / Formspree
    await new Promise(r => setTimeout(r, 900))
    setStatus('success')
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    borderRadius: 12, border: '1px solid var(--color-line)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-ink)', fontSize: 15,
    fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    display: 'block', marginBottom: 8,
    fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    color: 'var(--color-ink-dim)',
  }

  return (
    <>
      <Header />

      <section className="grain" style={{ position: 'relative', background: 'linear-gradient(135deg, var(--color-navy) 0%, var(--color-navy-2) 100%)', padding: '170px 28px 80px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <span className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--color-gold)' }}>—</span>
            <span className="kicker" style={{ color: 'var(--color-ink-faint)' }}>{t('label')}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800, color: 'var(--color-ink)', letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 18 }}>
            {t('headline')}
          </h1>
          <p style={{ color: 'var(--color-ink-dim)', fontSize: 17, lineHeight: 1.6 }}>{t('subheadline')}</p>
        </div>
      </section>

      <section style={{ background: 'var(--color-navy)', padding: '70px 28px 100px' }}>
        <div className="contact-grid" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Form */}
          <div>
            {status === 'success' ? (
              <div style={{ background: 'rgba(30,167,232,0.1)', border: '1px solid rgba(30,167,232,0.3)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-blue-bright)', marginBottom: 18 }}><Icon name="check" size={44} strokeWidth={2} /></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: 'var(--color-ink)' }}>{t('success')}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>{t('name_label')}</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('name_placeholder')} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('email_label')}</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('email_placeholder')} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t('subject_label')}</label>
                  <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder={t('subject_placeholder')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('message_label')}</label>
                  <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t('message_placeholder')} rows={6} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={status === 'loading'} style={{
                  display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                  padding: '15px 32px', borderRadius: 12,
                  background: status === 'loading' ? 'rgba(30,167,232,0.6)' : 'var(--color-blue)',
                  color: '#04121f', border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                }}>
                  {status === 'loading' ? '…' : <>{t('submit')} <Icon name="arrow" size={16} strokeWidth={2} /></>}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <p style={{ ...labelStyle, marginBottom: 18 }}>{t('info_title')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href={`mailto:${t('info_email')}`} style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(30,167,232,0.1)', border: '1px solid rgba(30,167,232,0.2)', color: 'var(--color-blue-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="mail" size={20} /></span>
                  <span style={{ color: 'var(--color-blue-bright)', fontSize: 15 }}>{t('info_email')}</span>
                </a>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-line)', color: 'var(--color-ink-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="clock" size={20} /></span>
                  <span style={{ color: 'var(--color-ink-dim)', fontSize: 14.5 }}>{t('info_response')}</span>
                </div>
              </div>
            </div>

            <div>
              <p style={{ ...labelStyle, marginBottom: 14 }}>{t('info_social')}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['LinkedIn', 'Instagram', 'YouTube'].map(s => (
                  <span key={s} style={{ padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-line)', fontSize: 13.5, color: 'var(--color-ink-dim)', cursor: 'pointer' }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 8, padding: 36, borderRadius: 20, background: 'rgba(30,167,232,0.05)', border: '1px solid rgba(30,167,232,0.12)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-blue-bright)', marginBottom: 14 }}><Icon name="globe" size={42} strokeWidth={1.3} /></div>
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-dim)', fontSize: 13, letterSpacing: '0.12em' }}>PT · EN · IT</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        .contact-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 56px; }
        @media (max-width: 800px) { .contact-grid { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>
    </>
  )
}
