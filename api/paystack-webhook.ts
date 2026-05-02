export const config = { runtime: 'edge' }

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  const body = await req.text()

  // Verify Paystack signature
  if (secretKey) {
    const signature = req.headers.get('x-paystack-signature') || ''
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    if (signature !== expected) {
      return new Response('Invalid signature', { status: 401 })
    }
  }

  const event = JSON.parse(body)
  await handleEvent(event)

  return new Response('OK', { status: 200 })
}

async function handleEvent(event: any) {
  const type = event.event
  const uid = event.data?.metadata?.firebase_uid

  if (!uid) return

  const db = getAdminDb()
  const userRef = db.collection('users').doc(uid)

  // Subscription activated
  if (type === 'subscription.create' || type === 'charge.success') {
    await userRef.update({
      plan: 'pro',
      paystackSubscriptionCode: event.data?.subscription_code || null,
      paystackCustomerCode: event.data?.customer?.customer_code || null,
    })
  }

  // Subscription disabled or not renewed
  if (type === 'subscription.disable' || type === 'subscription.expiry_reminder') {
    if (type === 'subscription.disable') {
      await userRef.update({ plan: 'free', paystackSubscriptionCode: null })
    }
  }
}
