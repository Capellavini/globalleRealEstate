import { NextResponse } from 'next/server'

// Newsletter signup → Beehiiv. The API key lives only on the server (env), never in the browser.
// Custom fields (Nome, Empresa, Perfil, Idiomas) must already exist in the Beehiiv publication,
// otherwise Beehiiv silently discards them.
export async function POST(req: Request) {
  let email = ''
  let name = ''
  let company = ''
  let profile = ''
  let languages = ''
  try {
    const body = await req.json()
    email = (body?.email ?? '').toString().trim()
    name = (body?.name ?? '').toString().trim()
    company = (body?.company ?? '').toString().trim()
    profile = (body?.profile ?? '').toString().trim()
    languages = (body?.languages ?? '').toString().trim()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  const pubId = process.env.BEEHIIV_PUBLICATION_ID
  if (!apiKey || !pubId) {
    console.error('[subscribe] Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID')
    return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  }

  const customFields: { name: string; value: string }[] = []
  if (name) customFields.push({ name: 'Nome', value: name })
  if (company) customFields.push({ name: 'Empresa', value: company })
  if (profile) customFields.push({ name: 'Perfil', value: profile })
  if (languages) customFields.push({ name: 'Idiomas', value: languages })

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: 'website',
        referring_site: 'globalle',
        ...(customFields.length ? { custom_fields: customFields } : {}),
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('[subscribe] Beehiiv error', res.status, detail)
      return NextResponse.json({ error: 'subscribe_failed' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribe] Network error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
