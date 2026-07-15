// Env values pasted into dashboards often arrive as "NAME\nvalue" or with
// stray whitespace. Keep only the last non-empty line, trimmed.
function clean(value: string | undefined): string | undefined {
  if (!value) return undefined
  const lines = value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.length ? lines[lines.length - 1] : undefined
}

export function supabaseUrl(): string | undefined {
  return clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
}

export function supabaseAnonKey(): string | undefined {
  return clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
