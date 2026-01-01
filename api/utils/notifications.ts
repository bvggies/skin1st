import fetch from 'node-fetch'

export async function sendWhatsappNotification(to: string, message: string) {
  const webhook = process.env.WHATSAPP_WEBHOOK_URL
  if (!webhook) throw new Error('WHATSAPP_WEBHOOK_URL not configured')

  const payload = { to, message }
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`WhatsApp webhook returned ${res.status}`)
  try {
    return await res.json()
  } catch (e) {
    return {}
  }
}
