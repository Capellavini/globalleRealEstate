import { createBrowserClient } from '@supabase/ssr'
import { supabaseAnonKey, supabaseUrl } from './env'

// Browser-side client. Only call this inside event handlers / effects so the
// app still prerenders when the Supabase env vars are absent.
export function createClient() {
  return createBrowserClient(supabaseUrl()!, supabaseAnonKey()!)
}
