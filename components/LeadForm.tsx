'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Icon from './Icon'

// Formulário de captação de investidores — mesmo padrão visual em 2 passos
// do NewsletterForm, mas grava direto no CRM (POST /api/leads): cria a
// conta (gerenciada, sem convite ainda), o perfil e a tese do investidor.
// A equipe decide quando convidar de verdade a partir do Funil/Clientes.
export default function LeadForm() {
  const t = useTranslations('lead_form')
  const investidores = useTranslations('investidores')
  const locale = useLocale()
  const objectives = investidores.raw('objectives') as { value: string; title: string; body: string }[]
  const countries = t.raw('countries') as { value: string; label: string }[]
  const budgetRanges = t.raw('budget_ranges') as string[]
  const BUDGET_KEYS = ['ate_200k', '200k_500k', '500k_1m', 'acima_1m']

  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [objective, setObjective] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState('')
  const [currency, setCurrency] = useState<'EUR' | 'BRL'>('EUR')
  const [notes, setNotes] = useState('')
  const [website, setWebsite] = useState('') // honeypot — humanos não veem/preenchem isto
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [focused, setFocused] = useState(false)

  function validEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  function goToStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!validEmail(email)) {
      setMsg(t('invalid_email'))
      setStatus('error')
      return
    }
    setStatus('idle')
    setMsg('')
    setStep(2)
  }

  function toggleCountry(value: string) {
    setSelectedCountries((prev) => (prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]))
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          phone,
          objective,
          target_countries: selectedCountries,
          budget_range: BUDGET_KEYS[budgetRanges.indexOf(budgetRange)] ?? '',
          budget_currency: currency,
          notes,
          locale,
          website,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
      setMsg(t('error'))
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-ink-dark-dim)',
    marginBottom: 12,
  }
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderRadius: 11,
    border: '1px solid rgba(11,18,48,0.14)',
    background: 'rgba(11,18,48,0.03)',
    color: 'var(--color-ink-dark)',
    fontSize: 15,
    outline: 'none',
    fontFamily: 'var(--font-body)',
  }
  const chipBase: React.CSSProperties = {
    padding: '9px 15px',
    borderRadius: 100,
    fontSize: 13.5,
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid',
    background: 'transparent',
  }
  function chipStyle(active: boolean): React.CSSProperties {
    return {
      ...chipBase,
      borderColor: active ? 'var(--color-blue)' : 'rgba(11,18,48,0.14)',
      background: active ? 'rgba(30,167,232,0.12)' : 'rgba(11,18,48,0.03)',
      color: active ? '#0E6FA3' : 'var(--color-ink-dark-dim)',
    }
  }

  // ─── Success ───
  if (status === 'success') {
    return (
      <div
        role="status"
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          padding: '22px 24px',
          borderRadius: 16,
          background: 'rgba(30,167,232,0.08)',
          border: '1px solid rgba(30,167,232,0.3)',
        }}
      >
        <span style={{ display: 'flex', color: '#0E6FA3', flexShrink: 0, marginTop: 2 }}>
          <Icon name="check" size={22} strokeWidth={2.2} />
        </span>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--color-ink-dark)', marginBottom: 4 }}>
            {t('success_title')}
          </p>
          <p style={{ fontSize: 14.5, color: 'var(--color-ink-dark-dim)', lineHeight: 1.5 }}>{t('success_body')}</p>
        </div>
      </div>
    )
  }

  // ─── Step 1: email ───
  if (step === 1) {
    return (
      <form onSubmit={goToStep2} style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            padding: 6,
            borderRadius: 16,
            background: 'rgba(11,18,48,0.03)',
            border: `1px solid ${status === 'error' ? '#ef5a6f' : focused ? 'var(--color-blue)' : 'rgba(11,18,48,0.14)'}`,
            transition: 'border-color 0.2s',
          }}
        >
          <input
            type="email"
            value={email}
            aria-label={t('email_placeholder')}
            onChange={(e) => {
              setEmail(e.target.value)
              setStatus('idle')
              setMsg('')
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t('email_placeholder')}
            required
            style={{ flex: '1 1 220px', minWidth: 0, padding: '12px 16px', borderRadius: 11, border: 'none', background: 'transparent', color: 'var(--color-ink-dark)', fontSize: 15.5, outline: 'none', fontFamily: 'var(--font-body)' }}
          />
          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 11,
              background: 'var(--color-blue)',
              color: '#04121f',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t('continue')}
            <Icon name="arrow" size={16} strokeWidth={2} />
          </button>
        </div>
        {status === 'error' && msg && (
          <p role="alert" style={{ marginTop: 10, fontSize: 13, color: '#ef5a6f' }}>
            {msg}
          </p>
        )}
      </form>
    )
  }

  // ─── Step 2: thesis ───
  return (
    <form
      onSubmit={handleFinalSubmit}
      style={{ width: '100%', textAlign: 'left', padding: 26, borderRadius: 18, background: 'rgba(11,18,48,0.02)', border: '1px solid rgba(11,18,48,0.1)' }}
    >
      {/* honeypot — invisível, só bots preenchem */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 22 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink-dark)' }}>{t('step2_title')}</h3>
        <button
          type="button"
          onClick={() => {
            setStep(1)
            setStatus('idle')
            setMsg('')
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0E6FA3', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', flexShrink: 0 }}
        >
          {t('back')}
        </button>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="lf-name" style={labelStyle}>
          {t('name_label')}
        </label>
        <input id="lf-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('name_placeholder')} style={fieldStyle} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label htmlFor="lf-phone" style={labelStyle}>
          {t('phone_label')}
        </label>
        <input id="lf-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phone_placeholder')} style={fieldStyle} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{t('objective_label')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {objectives.map((o) => (
            <button key={o.value} type="button" aria-pressed={objective === o.value} onClick={() => setObjective(o.value)} style={chipStyle(objective === o.value)}>
              {o.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{t('countries_label')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {countries.map((c) => (
            <button key={c.value} type="button" aria-pressed={selectedCountries.includes(c.value)} onClick={() => toggleCountry(c.value)} style={chipStyle(selectedCountries.includes(c.value))}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>{t('budget_label')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {budgetRanges.map((r) => (
            <button key={r} type="button" aria-pressed={budgetRange === r} onClick={() => setBudgetRange(r)} style={chipStyle(budgetRange === r)}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['EUR', 'BRL'] as const).map((c) => (
            <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)} style={{ ...chipStyle(currency === c), padding: '6px 13px', fontSize: 12.5 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label htmlFor="lf-notes" style={labelStyle}>
          {t('notes_label')}
        </label>
        <textarea
          id="lf-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('notes_placeholder')}
          style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || !objective || !selectedCountries.length}
        style={{
          width: '100%',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          padding: '14px 24px',
          borderRadius: 12,
          background: status === 'loading' || !objective || !selectedCountries.length ? 'rgba(30,167,232,0.5)' : 'var(--color-blue)',
          color: '#04121f',
          border: 'none',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          cursor: status === 'loading' ? 'wait' : 'pointer',
        }}
      >
        {status === 'loading' ? '…' : (
          <>
            {t('submit')}
            <Icon name="arrow" size={16} strokeWidth={2} />
          </>
        )}
      </button>
      {status === 'error' && msg && (
        <p role="alert" style={{ marginTop: 10, fontSize: 13, color: '#ef5a6f' }}>
          {msg}
        </p>
      )}
    </form>
  )
}
