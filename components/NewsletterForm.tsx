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
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [focused, setFocused] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@') || !email.includes('.')) {
      setMsg(t('invalid')); setStatus('error'); return
    }
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('success'); setMsg(t('success')); setEmail('')
    } catch {
      setStatus('error'); setMsg(t('error'))
    }
  }

  const textColor = dark ? 'var(--color-ink)' : 'var(--color-ink-dark)'
  const fieldBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(11,18,48,0.04)'
  const baseBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(11,18,48,0.14)'

  if (status === 'success') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px', borderRadius: 14,
        background: 'rgba(30,167,232,0.12)',
        border: '1px solid rgba(30,167,232,0.35)',
        color: textColor, fontSize: 15, fontWeight: 500,
      }}>
        <span style={{ display: 'flex', color: 'var(--color-blue-bright)' }}><Icon name="check" size={20} strokeWidth={2.2} /></span>
        {msg}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        padding: 6, borderRadius: 16,
        background: fieldBg,
        border: `1px solid ${status === 'error' ? '#ef5a6f' : focused ? 'var(--color-blue)' : baseBorder}`,
        transition: 'border-color 0.2s',
      }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus('idle'); setMsg('') }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required
          style={{
            flex: '1 1 220px', minWidth: 0,
            padding: '12px 16px',
            borderRadius: 11, border: 'none', background: 'transparent',
            color: textColor, fontSize: 15.5, outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 11,
            background: status === 'loading' ? 'rgba(30,167,232,0.6)' : 'var(--color-blue)',
            color: '#04121f', border: 'none',
            fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            whiteSpace: 'nowrap', transition: 'background 0.2s, transform 0.15s',
          }}
          onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.background = 'var(--color-blue-bright)' }}
          onMouseLeave={e => { if (status !== 'loading') e.currentTarget.style.background = 'var(--color-blue)' }}
        >
          {status === 'loading' ? '…' : <>{cta}<Icon name="arrow" size={16} strokeWidth={2} /></>}
        </button>
      </div>
      {status === 'error' && msg && (
        <p style={{ marginTop: 10, fontSize: 13, color: '#ef5a6f', fontFamily: 'var(--font-body)' }}>{msg}</p>
      )}
      {note && status !== 'error' && (
        <p style={{ marginTop: 12, fontSize: 12.5, color: dark ? 'var(--color-ink-faint)' : 'var(--color-ink-dark-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
          {note}
        </p>
      )}
    </form>
  )
}
