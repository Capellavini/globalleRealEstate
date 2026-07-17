'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Destino do link mágico de notificação (participante já com conta):
// estabelece a sessão a partir do URL e manda cada papel para o seu lugar.
export default function MagicEntry() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      let ok = false

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) ok = true

      if (!ok) {
        const hash = new URLSearchParams(window.location.hash.slice(1))
        const access_token = hash.get('access_token')
        const refresh_token = hash.get('refresh_token')
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          ok = !error
        }
      }

      if (!ok) {
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          ok = !error
        }
      }

      if (!ok) {
        setError('Link inválido ou expirado. Faça login normalmente em /admin/login.')
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        : { data: null }

      const target =
        profile?.role === 'team' ? '/admin' : profile?.role === 'lawyer' ? '/transacoes' : '/transacoes'
      router.replace(target)
      router.refresh()
    }
    init()
  }, [router])

  if (error) return <p style={{ fontSize: 14, color: '#A03030', lineHeight: 1.5 }}>{error}</p>
  return <p style={{ fontSize: 14, color: 'rgba(11,18,48,0.6)' }}>Entrando…</p>
}
