import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Exclude /api (and Next internals + files) so API routes aren't locale-prefixed.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
