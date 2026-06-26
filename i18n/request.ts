import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import pt from '../messages/pt.json'

// Site is Portuguese-only. Single locale, static messages.
export default getRequestConfig(async () => {
  return {
    locale: routing.defaultLocale,
    messages: pt,
  }
})
