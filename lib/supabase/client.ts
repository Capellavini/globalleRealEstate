import { createBrowserClient } from '@supabase/ssr'

// Browser-side client. Only call this inside event handlers / effects so the
// app still prerenders when the Supabase env vars are absent.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
