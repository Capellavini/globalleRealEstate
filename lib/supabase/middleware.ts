import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refreshes the Supabase session and gates /admin behind auth.
// If the env vars aren't set yet, everything funnels to /admin/login,
// which renders a "configure o Supabase" notice instead of the form.
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/admin/login'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (isLoginPage) return NextResponse.next({ request })
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    return NextResponse.redirect(redirectUrl)
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Do not run code between createServerClient and auth.getUser() —
  // it can cause random logouts (session refresh happens inside getUser).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isLoginPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
