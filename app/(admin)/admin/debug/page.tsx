// TEMPORARY diagnostic page — remove after the /admin 500 is fixed.
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const out: string[] = []
  out.push('node: ' + process.version)
  out.push('configured: ' + String(isSupabaseConfigured()))

  try {
    const supabase = createClient()
    out.push('createClient: OK')
    const { data, error } = await supabase.auth.getUser()
    out.push('getUser: OK — user=' + String(data?.user) + ' error=' + (error ? `${error.name}: ${error.message}` : 'none'))
  } catch (e) {
    const err = e as Error
    out.push('THREW: ' + (err?.stack ?? err?.message ?? String(e)))
  }

  return <pre style={{ padding: 24, fontSize: 13, whiteSpace: 'pre-wrap' }}>{out.join('\n')}</pre>
}
