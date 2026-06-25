'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
    width: '100%', padding: '14px 18px',
    borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#F5F7FA', fontSize: 15,
    fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block', marginBottom: 8,
    fontSize: 13, fontWeight: 600,
    color: 'rgba(245,247,250,0.7)',
    letterSpacing: '0.3px',
  }

  return (
    <>
      <Header />

      <section style={{
        background: 'linear-gradient(135deg, #070B24 0%, #0d1535 100%)',
        padding: '140px 24px 96px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,167,232,0.1) 0%, transparent 70%)',
        }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--color-blue)', background: 'rgba(30,167,232,0.12)',
            border: '1px solid rgba(30,167,232,0.25)',
            padding: '5px 12px', borderRadius: 20, marginBottom: 20,
          }}>
            {t('label')}
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800, color: '#F5F7FA',
            letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16,
          }}>
            {t('headline')}
          </h1>
          <p style={{ color: 'rgba(245,247,250,0.6)', fontSize: 17, lineHeight: 1.65 }}>
            {t('subheadline')}
          </p>
        </div>
      </section>

      <section style={{ background: 'var(--color-navy)', padding: '80px 24px 96px' }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 64,
        }}>
          {/* Form */}
          <div>
            {status === 'success' ? (
              <div style={{
                background: 'rgba(30,167,232,0.1)', border: '1px solid rgba(30,167,232,0.3)',
                borderRadius: 20, padding: '48px 40px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700,
                  color: '#F5F7FA', marginBottom: 12,
                }}>
                  {t('success')}
                </h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>{t('name_label')}</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder={t('name_placeholder')}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('email_label')}</label>
                    <input
                      type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder={t('email_placeholder')}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t('subject_label')}</label>
                  <input
                    type="text" required value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder={t('subject_placeholder')}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('message_label')}</label>
                  <textarea
                    required value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder={t('message_placeholder')}
                    rows={6}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    padding: '15px 32px', borderRadius: 12,
                    background: status === 'loading' ? 'rgba(30,167,232,0.6)' : 'var(--color-blue)',
                    color: '#fff', border: 'none',
                    fontSize: 15, fontWeight: 600,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {status === 'loading' ? '...' : t('submit')}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700,
                color: '#F5F7FA', marginBottom: 20,
              }}>
                {t('info_title')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(30,167,232,0.1)',
                    border: '1px solid rgba(30,167,232,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>✉️</div>
                  <a href={`mailto:${t('info_email')}`} style={{ color: 'var(--color-blue)', textDecoration: 'none', fontSize: 15 }}>
                    {t('info_email')}
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(30,167,232,0.1)',
                    border: '1px solid rgba(30,167,232,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>⏱️</div>
                  <span style={{ color: 'rgba(245,247,250,0.6)', fontSize: 14 }}>{t('info_response')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{
                fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
                color: '#F5F7FA', marginBottom: 14,
              }}>
                {t('info_social')}
              </h4>
              <div style={{ display: 'flex', gap: 12 }}>
                {['LinkedIn', 'Instagram', 'YouTube'].map(s => (
                  <div key={s} style={{
                    padding: '10px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 13, color: 'rgba(245,247,250,0.6)',
                    cursor: 'pointer',
                  }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative globe */}
            <div style={{
              marginTop: 24, padding: 40, borderRadius: 20,
              background: 'rgba(30,167,232,0.06)',
              border: '1px solid rgba(30,167,232,0.12)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🌍</div>
              <p style={{ color: 'rgba(245,247,250,0.5)', fontSize: 14, lineHeight: 1.65 }}>
                {`PT · EN · IT`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
