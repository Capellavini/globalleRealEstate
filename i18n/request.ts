import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import pt from '../messages/pt.json'
import en from '../messages/en.json'
import it from '../messages/it.json'
import es from '../messages/es.json'

// Messages are imported statically (not `import(`../messages/${locale}.json`)`) —
// the dynamic form broke on Vercel's runtime.
const messages = { pt, en, it, es }

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: messages[locale],
  }
})
