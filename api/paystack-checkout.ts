export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // @ts-ignore
    const secretKey = process.env.PAYSTACK_SECRET_KEY
    // @ts-ignore
    const monthlyPlan = process.env.PAYSTACK_MONTHLY_PLAN_CODE
    // @ts-ignore
    const yearlyPlan = process.env.PAYSTACK_YEARLY_PLAN_CODE

    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: 'Paystack not configured — missing secret key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { billing, email, userId } = await req.json()
    const planCode = billing === 'yearly' ? yearlyPlan : monthlyPlan

    if (!planCode) {
      return new Response(
        JSON.stringify({ error: `Plan code not configured for billing: ${billing}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

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
        // Amount in kobo — monthly: ₦7,000 = 700000, yearly: ₦60,000 = 6000000
        amount: billing === 'yearly' ? 8499900 : 900000,
        metadata: { firebase_uid: userId, cancel_action: `${origin}/pricing` },
        callback_url: `${origin}/upgrade?success=true`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data?.message || 'Paystack error', detail: data }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ url: data.data?.authorization_url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}