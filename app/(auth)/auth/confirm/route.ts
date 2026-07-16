import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// Destino do template de convite do Supabase (Authentication → Email Templates →
// Invite user): {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
// Verifica o token no servidor (cookies de sessão são gravados) e manda o
// usuário definir a senha.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = (url.searchParams.get('type') ?? 'invite') as EmailOtpType
  const next = url.searchParams.get('next') ?? '/auth/set-password'

  if (token_hash) {
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin))
    }
  }

  return NextResponse.redirect(
    new URL('/auth/set-password?error=' + encodeURIComponent('Link inválido ou expirado.'), url.origin)
  )
}
