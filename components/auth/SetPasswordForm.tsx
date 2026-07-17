'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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

// O convite pode chegar de 3 jeitos: sessão já criada por /auth/confirm
// (token_hash), tokens no fragmento (#access_token) ou código PKCE (?code=).
export default function SetPasswordForm() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [fatal, setFatal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setReady(true)
        return
      }

      const hash = new URLSearchParams(window.location.hash.slice(1))
      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (!error) {
          setReady(true)
          return
        }
      }

      const query = new URLSearchParams(window.location.search)
      const code = query.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          setReady(true)
          return
        }
      }

      setFatal(
        query.get('error') ||
          hash.get('error_description') ||
          'Link inválido ou expirado. Peça um novo convite à equipe Globalle.'
      )
    }
    init()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('A senha precisa de pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setSaving(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error || !data.user) {
      setError(error?.message ?? 'Erro ao definir a senha.')
      setSaving(false)
      return
    }

    // Redireciona conforme o papel; cliente novo passa pelo onboarding do perfil.
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    const target =
      profile?.role === 'team'
        ? '/admin/portfolios'
        : profile?.role === 'lawyer'
          ? '/transacoes'
          : '/perfil/completar'
    router.push(target)
    router.refresh()
  }

  if (fatal) {
    return <p style={{ fontSize: 14, color: '#A03030', lineHeight: 1.5 }}>{fatal}</p>
  }

  if (!ready) {
    return <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.6)' }}>Validando o convite…</p>
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
      <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
        Nova senha
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600 }}>
        Confirmar senha
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
        />
      </label>
      {error && <p style={{ color: '#A03030', fontSize: 13, margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={saving}
        style={{
          padding: '12px 14px',
          border: 'none',
          borderRadius: 8,
          background: '#070B24',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: saving ? 'wait' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'Salvando…' : 'Definir senha e entrar'}
      </button>
    </form>
  )
}
