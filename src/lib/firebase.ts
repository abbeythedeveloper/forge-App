import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAYbv1iQ3PBP5W8oUn5PSm-Y_ADcd580pE",
  authDomain: "forge-app-a808f.firebaseapp.com",
  projectId: "forge-app-a808f",
  storageBucket: "forge-app-a808f.firebasestorage.app",
  messagingSenderId: "786557033605",
  appId: "1:786557033605:web:87d9768bde3db681825dec"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
