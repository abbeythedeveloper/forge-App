import { useState, useEffect } from 'react'
import {
  doc, getDoc, setDoc, onSnapshot
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HabitLog {
  completedIds: string[]
  score: number
  reflectionText: string
  savedAt: string
}

export interface StreakData {
  current: number
  best: number
  lastCompletedDate: string
}

export interface DisciplineEntry {
  id: string
  type: 'lust' | 'impulse' | 'anger'
  trigger: string
  outcome: 'resisted' | 'gave_in'
  timestamp: string
  notes: string
}

// ── Habits for today ──────────────────────────────────────────────────────────

export const HABITS = [
  { id: 'wake',      name: 'Wake on time',            tag: 'no snooze',            group: 'morning' },
  { id: 'nolust',    name: 'No lust / no porn',        tag: 'first battle won',     group: 'morning' },
  { id: 'water',     name: 'Drink water first',        tag: 'before phone',         group: 'morning' },
  { id: 'journal',   name: 'Morning intention',        tag: '5 min focus',          group: 'morning' },
  { id: 'read',      name: 'Read 20 pages',            tag: 'books only',           group: 'mind' },
  { id: 'pause',     name: 'Pause before reacting',    tag: 'no impulsive moves',   group: 'mind' },
  { id: 'trade',     name: 'Trading study / review',   tag: 'discipline in markets',group: 'mind' },
  { id: 'noscroll',  name: 'Limit mindless scrolling', tag: '< 30 min total',       group: 'mind' },
  { id: 'exercise',  name: 'Move your body',           tag: 'any form counts',      group: 'body' },
  { id: 'eat',       name: 'Eat one clean meal',       tag: 'intentional',          group: 'body' },
  { id: 'nospend',   name: 'No reactive spending',     tag: 'think before you buy', group: 'body' },
  { id: 'sleep',     name: 'In bed on time',           tag: 'protect your sleep',   group: 'body' },
  { id: 'gratitude', name: '3 things grateful for',    tag: 'write them down',      group: 'evening' },
  { id: 'tomorrow',  name: 'Plan tomorrow',            tag: 'top 3 priorities',     group: 'evening' },
]

export const TODAY = new Date().toISOString().split('T')[0]

export function useTodayHabits() {
  const { user } = useAuth()
  const [completed, setCompleted] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const docRef = user ? doc(db, 'habits', user.uid, 'logs', TODAY) : null

  useEffect(() => {
    if (!docRef) return
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setCompleted(snap.data().completedIds || [])
      }
      setLoading(false)
    })
    return unsub
  }, [user])

  const toggle = async (habitId: string) => {
    if (!docRef) return
    const next = completed.includes(habitId)
      ? completed.filter(id => id !== habitId)
      : [...completed, habitId]
    setCompleted(next)
    const score = Math.round((next.length / HABITS.length) * 100)
    await setDoc(docRef, {
      completedIds: next,
      score,
      savedAt: new Date().toISOString(),
    }, { merge: true })
    // update streak
    if (user) await updateStreak(user.uid, next.length > 0)
  }

  const score = Math.round((completed.length / HABITS.length) * 100)

  return { completed, toggle, score, loading }
}

// ── Streak ────────────────────────────────────────────────────────────────────

export async function updateStreak(uid: string, hasActivity: boolean) {
  const ref = doc(db, 'streaks', uid)
  const snap = await getDoc(ref)
  const today = TODAY
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (!snap.exists()) {
    await setDoc(ref, { current: hasActivity ? 1 : 0, best: hasActivity ? 1 : 0, lastCompletedDate: today })
    return
  }

  const data = snap.data() as StreakData
  if (data.lastCompletedDate === today) return // already updated today

  let current = data.current
  if (hasActivity) {
    current = data.lastCompletedDate === yesterday ? current + 1 : 1
  } else {
    current = 0
  }

  await setDoc(ref, {
    current,
    best: Math.max(current, data.best || 0),
    lastCompletedDate: today,
  }, { merge: true })
}

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState<StreakData>({ current: 0, best: 0, lastCompletedDate: '' })

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'streaks', user.uid), (snap) => {
      if (snap.exists()) setStreak(snap.data() as StreakData)
    })
    return unsub
  }, [user])

  return streak
}

// ── Discipline entries ────────────────────────────────────────────────────────

export function useDisciplineStreak(type: 'nolust' | 'nospend') {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!user) return
    // Count consecutive days where this habit was completed
    const fetchStreak = async () => {
      let count = 0
      let date = new Date()
      for (let i = 0; i < 30; i++) {
        const dateStr = date.toISOString().split('T')[0]
        const snap = await getDoc(doc(db, 'habits', user.uid, 'logs', dateStr))
        if (snap.exists() && (snap.data().completedIds || []).includes(type)) {
          count++
          date = new Date(date.getTime() - 86400000)
        } else {
          break
        }
      }
      setStreak(count)
    }
    fetchStreak()
  }, [user, type])

  return streak
}

// ── Gratitude ─────────────────────────────────────────────────────────────────

export function useGratitude() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<string[]>(['', '', ''])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const docRef = user ? doc(db, 'habits', user.uid, 'logs', TODAY) : null

  useEffect(() => {
    if (!docRef) return
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data().gratitude) {
        setEntries(snap.data().gratitude)
        setSaved(true)
      }
    })
    return unsub
  }, [user])

  const save = async (values: string[], markComplete: () => void) => {
    if (!docRef) return
    const filled = values.filter(v => v.trim())
    if (filled.length === 0) return
    setSaving(true)
    await setDoc(docRef, { gratitude: values, savedAt: new Date().toISOString() }, { merge: true })
    setSaved(true)
    setSaving(false)
    markComplete()
  }

  return { entries, setEntries, saved, saving, save }
}
