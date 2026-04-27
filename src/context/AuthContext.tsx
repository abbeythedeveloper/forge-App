import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export interface UserProfile {
  uid: string
  name: string
  email: string
  goals: string[]
  wakeTime: string
  shiftType: 'morning' | 'night' | 'none'
  onboarded: boolean
  createdAt: string
  plan: 'free' | 'pro'
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      name: '',
      email,
      goals: [],
      wakeTime: '06:00',
      shiftType: 'none',
      onboarded: false,
      createdAt: new Date().toISOString(),
      plan: 'free',
    }
    await setDoc(doc(db, 'users', cred.user.uid), newProfile)
    setProfile(newProfile)
  }

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    await signOut(auth)
    setProfile(null)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, data, { merge: true })
    setProfile(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signup, login, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
