'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  placeholder: string
  cta: string
  dark?: boolean
}

export default function NewsletterForm({ placeholder, cta, dark = true }: Props) {
  const t = useTranslations('newsletter_form')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) {
      setMsg(t('invalid'))
      setStatus('error')
      return
    }
    setStatus('loading')

    // TODO: conectar a ESP — ex. Mailerlite, ConvertKit, Systeme.io
    // const res = await fetch('/api/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify({ email }),
    //   headers: { 'Content-Type': 'application/json' },
    // })
    // if (!res.ok) throw new Error()

    await new Promise(r => setTimeout(r, 800)) // simulate
    setStatus('success')
    setMsg(t('success'))
    setEmail('')
  }

  const bg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(11,18,48,0.06)'
  const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(11,18,48,0.15)'
  const textColor = dark ? '#F5F7FA' : '#0B1230'
  const placeholderStyle = dark ? 'rgba(245,247,250,0.4)' : 'rgba(11,18,48,0.4)'

  if (status === 'success') {
    return (
      <div style={{
        padding: '16px 24px',
        borderRadius: 12,
        background: 'rgba(30,167,232,0.15)',
        border: '1px solid rgba(30,167,232,0.3)',
        color: dark ? '#F5F7FA' : '#0B1230',
        fontSize: 15,
        fontWeight: 500,
      }}>
        ✓ {msg}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus('idle'); setMsg('') }}
          placeholder={placeholder}
          required
          style={{
            flex: '1 1 240px',
            padding: '14px 18px',
            borderRadius: 12,
            border: `1px solid ${status === 'error' ? '#ef4444' : border}`,
            background: bg,
            color: textColor,
            fontSize: 15,
            outline: 'none',
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '14px 28px',
            borderRadius: 12,
            background: status === 'loading' ? 'rgba(30,167,232,0.6)' : 'var(--color-blue)',
            color: '#fff',
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.2s',
            fontFamily: 'var(--font-body)',
          }}
        >
          {status === 'loading' ? '...' : cta}
        </button>
      </div>
      {status === 'error' && msg && (
        <p style={{ marginTop: 8, fontSize: 13, color: '#ef4444' }}>{msg}</p>
      )}
    </form>
  )
}
