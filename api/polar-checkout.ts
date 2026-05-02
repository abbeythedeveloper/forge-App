export const config = { runtime: 'edge' }

declare const POLAR_ACCESS_TOKEN: string

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const accessToken = typeof POLAR_ACCESS_TOKEN !== 'undefined' ? POLAR_ACCESS_TOKEN : ''
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Polar not configured' }), { status: 500 })
    }

    const { productId, email, userId } = await req.json()
    const origin = new URL(req.url).origin

    const response = await fetch('https://api.polar.sh/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        customer_email: email,
        metadata: { firebase_uid: userId },
        success_url: `${origin}/upgrade?success=true`,
        cancel_url: `${origin}/pricing`,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    const data = await response.json()
    return new Response(JSON.stringify({ url: data.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
