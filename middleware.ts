import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  // /admin é o Transaction Room (interno) — auth Supabase, sem locale prefix.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return updateSession(request)
  }
  return intlMiddleware(request)
}

export const config = {
  // Exclude /api (and Next internals + files) so API routes aren't locale-prefixed.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
