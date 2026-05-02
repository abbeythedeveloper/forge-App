export const config = { runtime: 'edge' }

declare const PAYSTACK_SECRET_KEY: string

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const secretKey = typeof PAYSTACK_SECRET_KEY !== 'undefined' ? PAYSTACK_SECRET_KEY : ''
    const { planCode, email, userId } = await req.json()
    const origin = new URL(req.url).origin

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email,
        plan: planCode,
        metadata: { firebase_uid: userId, cancel_action: `${origin}/pricing` },
        callback_url: `${origin}/upgrade?success=true`,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    const data = await response.json()
    return new Response(JSON.stringify({ url: data.data?.authorization_url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
