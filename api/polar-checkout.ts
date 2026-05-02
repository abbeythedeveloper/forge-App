export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const accessToken = process.env.POLAR_ACCESS_TOKEN
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Polar not configured' }), { status: 500 })
  }

  try {
    const { productId, email, userId } = await req.json()

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
        success_url: `${new URL(req.url).origin}/upgrade?success=true`,
        cancel_url: `${new URL(req.url).origin}/pricing`,
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
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
