import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as admin from 'firebase-admin'

function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return admin.firestore()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  try {
    const event = req.body
    const uid = event?.data?.metadata?.firebase_uid

    if (!uid) return res.status(200).send('OK')

    const db = getAdminDb()
    const userRef = db.collection('users').doc(uid)
    const type = event.type

    if (type === 'subscription.created' || type === 'subscription.updated') {
      if (event.data?.status === 'active') {
        await userRef.update({ plan: 'pro', polarSubscriptionId: event.data?.id || null })
      }
    }

    if (type === 'subscription.revoked') {
      await userRef.update({ plan: 'free', polarSubscriptionId: null })
    }

    return res.status(200).send('OK')
  } catch (err) {
    console.error('Polar webhook error:', err)
    return res.status(500).send('Server error')
  }
}
