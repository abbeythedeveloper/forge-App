import type { VercelRequest, VercelResponse } from '@vercel/node'
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

  try {
    const event = req.body
    const uid = event?.data?.metadata?.firebase_uid
    const type = event.type

    console.log('Polar event:', type, '| uid:', uid)

    if (!uid) return res.status(200).send('OK — no uid')

    const firestore = getDb()
    const userRef = firestore.collection('users').doc(uid)

    if (type === 'subscription.created' || type === 'subscription.updated') {
      if (event.data?.status === 'active') {
        await userRef.update({ plan: 'pro', polarSubscriptionId: event.data?.id || null })
        console.log('User', uid, '→ pro via Polar')
      }
    }

    if (type === 'subscription.revoked') {
      await userRef.update({ plan: 'free', polarSubscriptionId: null })
      console.log('User', uid, '→ free via Polar')
    }

    return res.status(200).send('OK')
  } catch (err) {
    console.error('Polar webhook error:', err)
    return res.status(500).send('Server error')
  }
}
