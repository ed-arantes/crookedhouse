import { Resend } from 'resend'
import { json, requireAdmin, type AdminEnv } from '../../_lib/admin'

type PagesContext = { request: Request; env: AdminEnv }

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const unauthed = requireAdmin(env, request)
  if (unauthed) return unauthed

  const body = await request.json().catch(() => null) as { to?: unknown } | null
  const recipient = typeof body?.to === 'string' ? body.to.trim() : ''
  if (
    recipient.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)
  ) {
    return json({ error: 'Enter a valid recipient email address' }, 400)
  }

  if (!env.RESEND_API_KEY) {
    return json({ error: 'Resend API key is not configured' }, 500)
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL || 'Crooked House <reception@crookedhouse.it>',
      to: recipient,
      subject: 'Crooked House Email Test',
      text: 'Questa è un’email di prova dal pannello di amministrazione di Crooked House. Resend è connesso correttamente.',
      html: '<p>Questa è un’email di prova dal pannello di amministrazione di Crooked House.</p><p>Resend è connesso correttamente.</p>',
    }, {
      idempotencyKey: `admin-test/${crypto.randomUUID()}`,
    })

    if (error) {
      console.error('Resend test email failed', error)
      return json({ error: 'Resend could not send the test email' }, 502)
    }
    if (!data?.id) {
      console.error('Resend test email returned no email ID')
      return json({ error: 'Resend did not confirm the test email' }, 502)
    }

    return json({ ok: true, id: data.id })
  } catch (error) {
    console.error('Resend test email request failed', error)
    return json({ error: 'Unable to send the test email' }, 502)
  }
}
