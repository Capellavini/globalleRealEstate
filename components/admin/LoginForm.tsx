'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid rgba(11,18,48,0.15)',
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'inherit',
    background: '#fff',
    color: '#0B1230',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
        E-mail
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
        Senha
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />
      </label>
      {error && (
        <p style={{ color: '#A03030', fontSize: 13, margin: 0 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '12px 14px',
          border: 'none',
          borderRadius: 8,
          background: '#070B24',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
