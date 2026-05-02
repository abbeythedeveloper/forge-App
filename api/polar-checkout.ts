export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // @ts-ignore
    const accessToken = process.env.POLAR_ACCESS_TOKEN
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Polar access token not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
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

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data?.detail || 'Polar error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ url: data.url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
