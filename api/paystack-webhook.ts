import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as crypto from 'crypto'
import admin from 'firebase-admin'

let db: admin.firestore.Firestore | null = null

function getDb(): admin.firestore.Firestore {
  if (db) return db

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '')

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey,
      }),
    })
  }

  db = admin.firestore()
  return db
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  const signature = req.headers['x-paystack-signature'] as string

  if (secretKey && signature) {
    const body = JSON.stringify(req.body)
    const expected = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex')
    if (signature !== expected) return res.status(401).send('Invalid signature')
  }

  try {
    const event = req.body
    const type = event.event
    const uid = event?.data?.metadata?.firebase_uid

    console.log('Paystack event:', type, '| uid:', uid)

    if (!uid) return res.status(200).send('OK — no uid')

    const firestore = getDb()
    const userRef = firestore.collection('users').doc(uid)

    if (type === 'subscription.create' || type === 'charge.success') {
      await userRef.update({
        plan: 'pro',
        paystackSubscriptionCode: event.data?.subscription_code || null,
        paystackCustomerCode: event.data?.customer?.customer_code || null,
      })
      console.log('User', uid, '→ pro')
    }

    if (type === 'subscription.disable') {
      await userRef.update({ plan: 'free', paystackSubscriptionCode: null })
      console.log('User', uid, '→ free')
    }

    return res.status(200).send('OK')
  } catch (err) {
    console.error('Paystack webhook error:', err)
    return res.status(500).send('Server error')
  }
}
