export async function verifyTurnstile(token: string | null, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: true, skipped: true }
  if (!token) return { ok: false, skipped: false, error: 'Captcha token is required' }
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  const json = await res.json() as { success?: boolean; 'error-codes'?: string[] }
  return { ok: Boolean(json.success), skipped: false, error: json['error-codes']?.join(', ') }
}
