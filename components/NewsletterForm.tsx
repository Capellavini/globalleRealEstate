'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Icon from './Icon'

interface Props {
  placeholder: string
  cta: string
  dark?: boolean
  note?: string
}

export default function NewsletterForm({ placeholder, cta, dark = true, note }: Props) {
  const t = useTranslations('newsletter_form')
  const profileOptions = t.raw('profile_options') as string[]
  const languageOptions = t.raw('languages_options') as string[]

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [profile, setProfile] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [focused, setFocused] = useState(false)

  const textColor = dark ? 'var(--color-ink)' : 'var(--color-ink-dark)'
  const dimColor = dark ? 'var(--color-ink-dim)' : 'var(--color-ink-dark-dim)'
  const faintColor = dark ? 'var(--color-ink-faint)' : 'var(--color-ink-dark-dim)'
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(11,18,48,0.04)'
  const baseBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(11,18,48,0.14)'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(11,18,48,0.02)'

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!validEmail(email)) { setMsg(t('invalid')); setStatus('error'); return }
    setStatus('idle'); setMsg(''); setStep(2)
  }

  function toggleLanguage(lang: string) {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, profile, languages }),
      })
      if (!res.ok) throw new Error()
      setStatus('success'); setMsg(t('success'))
    } catch {
      setStatus('error'); setMsg(t('error'))
    }
  }

  // ─── Success ───
  if (status === 'success') {
    return (
      <div role="status" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px', borderRadius: 14,
        background: 'rgba(30,167,232,0.12)', border: '1px solid rgba(30,167,232,0.35)',
        color: textColor, fontSize: 15, fontWeight: 500,
      }}>
        <span style={{ display: 'flex', color: 'var(--color-blue-bright)', flexShrink: 0 }}><Icon name="check" size={20} strokeWidth={2.2} /></span>
        {msg}
      </div>
    )
  }

  // ─── Step 1: email ───
  if (step === 1) {
    return (
      <form onSubmit={goToStep2} style={{ width: '100%' }}>
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', padding: 6, borderRadius: 16, background: fieldBg,
          border: `1px solid ${status === 'error' ? '#ef5a6f' : focused ? 'var(--color-blue)' : baseBorder}`,
          transition: 'border-color 0.2s',
        }}>
          <input
            type="email" value={email} aria-label={placeholder}
            onChange={e => { setEmail(e.target.value); setStatus('idle'); setMsg('') }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder={placeholder} required
            style={{ flex: '1 1 220px', minWidth: 0, padding: '12px 16px', borderRadius: 11, border: 'none', background: 'transparent', color: textColor, fontSize: 15.5, outline: 'none', fontFamily: 'var(--font-body)' }}
          />
          <button type="submit" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 11,
            background: 'var(--color-blue)', color: '#04121f', border: 'none', fontSize: 15, fontWeight: 700,
            fontFamily: 'var(--font-display)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-blue-bright)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-blue)')}
          >
            {cta}<Icon name="arrow" size={16} strokeWidth={2} />
          </button>
        </div>
        {status === 'error' && msg && <p role="alert" style={{ marginTop: 10, fontSize: 13, color: '#ef5a6f' }}>{msg}</p>}
        {note && status !== 'error' && (
          <p style={{ marginTop: 12, fontSize: 12.5, color: faintColor, fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>{note}</p>
        )}
      </form>
    )
  }

  // ─── Step 2: profile ───
  const chipBase = { padding: '9px 15px', borderRadius: 100, fontSize: 13.5, fontFamily: 'var(--font-display)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', border: '1px solid', background: 'transparent' as const }
  const labelStyle = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: dimColor, marginBottom: 12 }

  function chipStyle(active: boolean): React.CSSProperties {
    return {
      ...chipBase,
      borderColor: active ? 'var(--color-blue)' : baseBorder,
      background: active ? 'rgba(30,167,232,0.15)' : fieldBg,
      color: active ? 'var(--color-blue-bright)' : dimColor,
    }
  }

  return (
    <form onSubmit={handleFinalSubmit} style={{
      width: '100%', textAlign: 'left', padding: 24, borderRadius: 18,
      background: cardBg, border: `1px solid ${baseBorder}`,
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 4 }}>{t('step2_title')}</h3>
        <p style={{ fontSize: 14, color: dimColor, lineHeight: 1.5 }}>{t('step2_subtitle')}</p>
      </div>

      {/* confirmed email */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 11, background: fieldBg, border: `1px solid ${baseBorder}`, marginBottom: 18 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color: textColor, fontSize: 14, minWidth: 0 }}>
          <span style={{ display: 'flex', color: 'var(--color-blue-bright)', flexShrink: 0 }}><Icon name="check" size={16} strokeWidth={2.2} /></span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
        </span>
        <button type="button" onClick={() => { setStep(1); setStatus('idle'); setMsg('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue-bright)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
          {t('back')}
        </button>
      </div>

      {/* name */}
      <div style={{ marginBottom: 18 }}>
        <label htmlFor="nf-name" style={labelStyle}>{t('name_label')}</label>
        <input
          id="nf-name" type="text" value={name} required
          onChange={e => setName(e.target.value)} placeholder={t('name_placeholder')}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: 11, border: `1px solid ${baseBorder}`, background: fieldBg, color: textColor, fontSize: 15, outline: 'none', fontFamily: 'var(--font-body)' }}
        />
      </div>

      {/* profile (single) */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{t('profile_label')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {profileOptions.map(opt => (
            <button key={opt} type="button" aria-pressed={profile === opt} onClick={() => setProfile(opt)} style={chipStyle(profile === opt)}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* languages (multi) */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>{t('languages_label')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {languageOptions.map(lang => (
            <button key={lang} type="button" aria-pressed={languages.includes(lang)} onClick={() => toggleLanguage(lang)} style={chipStyle(languages.includes(lang))}>
              {lang}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={status === 'loading'} style={{
        width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        padding: '14px 24px', borderRadius: 12, background: status === 'loading' ? 'rgba(30,167,232,0.6)' : 'var(--color-blue)',
        color: '#04121f', border: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
        cursor: status === 'loading' ? 'wait' : 'pointer', transition: 'background 0.2s',
      }}>
        {status === 'loading' ? '…' : <>{t('submit')}<Icon name="arrow" size={16} strokeWidth={2} /></>}
      </button>
      {status === 'error' && msg && <p role="alert" style={{ marginTop: 10, fontSize: 13, color: '#ef5a6f' }}>{msg}</p>}
    </form>
  )
}
