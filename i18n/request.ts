import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import pt from '../messages/pt.json'
import en from '../messages/en.json'

const messageMap = { pt, en }

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'pt' | 'en')) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: messageMap[locale as 'pt' | 'en'],
  }
})
