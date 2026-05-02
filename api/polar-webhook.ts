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

  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  const signature = req.headers.get('webhook-signature') || ''

  // Verify signature
  if (webhookSecret) {
    const body = await req.text()
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expected = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0')).join('')

    if (!signature.includes(expected)) {
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    await handleEvent(event)
  } else {
    const event = await req.json()
    await handleEvent(event)
  }

  return new Response('OK', { status: 200 })
}

async function handleEvent(event: any) {
  const type = event.type
  const uid = event.data?.metadata?.firebase_uid

  if (!uid) return

  const db = getAdminDb()
  const userRef = db.collection('users').doc(uid)

  if (type === 'subscription.created' || type === 'subscription.updated') {
    const status = event.data?.status
    if (status === 'active') {
      await userRef.update({ plan: 'pro', polarSubscriptionId: event.data?.id })
    }
  }

  if (type === 'subscription.revoked') {
    await userRef.update({ plan: 'free', polarSubscriptionId: null })
  }
}
