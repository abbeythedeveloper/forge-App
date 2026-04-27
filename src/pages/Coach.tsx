import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useTodayHabits, HABITS, TODAY } from '../hooks/useHabits'
import AppLayout from '../layouts/AppLayout'
import styles from './Coach.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
})

interface DebriefEntry {
  habitScore: number
  reflectionInput: string
  coachResponse: string
  createdAt: string
}

const Coach = () => {
  const { user, profile } = useAuth()
  const { completed, score } = useTodayHabits()

  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [todayEntry, setTodayEntry] = useState<DebriefEntry | null>(null)
  const [loadingEntry, setLoadingEntry] = useState(true)
  const [error, setError] = useState('')

  // Load today's existing debrief if any
  useEffect(() => {
    if (!user) return
    const fetchEntry = async () => {
      const snap = await getDoc(doc(db, 'ai_debriefs', user.uid, 'debriefs', TODAY))
      if (snap.exists()) {
        const data = snap.data() as DebriefEntry
        setTodayEntry(data)
        setResponse(data.coachResponse)
        setReflection(data.reflectionInput)
      }
      setLoadingEntry(false)
    }
    fetchEntry()
  }, [user])

  // Build last 7 days history for context
  const buildHistory = async () => {
    if (!user) return []
    const history = []
    for (let i = 1; i <= 7; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      const snap = await getDoc(doc(db, 'habits', user.uid, 'logs', date))
      if (snap.exists()) {
        history.push({ date, score: snap.data().score || 0 })
      }
    }
    return history
  }

  const handleDebrief = async () => {
    if (!user || !reflection.trim()) return
    setLoading(true)
    setError('')

    try {
      const history = await buildHistory()
      const habitData = HABITS.reduce((acc, h) => ({
        ...acc,
        [h.name]: completed.includes(h.id),
      }), {} as Record<string, boolean>)

      const res = await fetch('/api/debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, reflection, habitData, history }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      const coachResponse = data.response

      // Save to Firestore
      const entry: DebriefEntry = {
        habitScore: score,
        reflectionInput: reflection,
        coachResponse,
        createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db, 'ai_debriefs', user.uid, 'debriefs', TODAY), entry)

      setResponse(coachResponse)
      setTodayEntry(entry)
    } catch (e) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Pro gate
  if (profile?.plan !== 'pro') {
    return (
      <AppLayout>
        <div className={styles.page}>
          <motion.div className={styles.gate} {...fadeUp(0)}>
            <p className={styles.gateLabel}>// Pro feature</p>
            <h1 className={styles.gateTitle}>AI COACH</h1>
            <p className={styles.gateSub}>
              Your daily debrief is waiting. The coach reads your habit data,
              your reflection, and your recent history — then talks back directly.
              No generic tips. No sugarcoating.
            </p>
            <div className={styles.gateFeatures}>
              {[
                'Daily debrief based on your real data',
                'Pattern recognition across 7 days',
                'Trade discipline correlation',
                'Direct, personal feedback',
              ].map(f => (
                <div key={f} className={styles.gateFeature}>
                  <span className={styles.gateCheck}>◈</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button className={styles.upgradeBtn}
              onClick={() => window.location.href = '/pricing'}>
              Upgrade to Pro — $7/month →
            </button>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div className={styles.header} {...fadeUp(0)}>
          <div>
            <p className={styles.dateLabel}>// Daily debrief</p>
            <h1 className={styles.title}>AI COACH</h1>
          </div>
          <div className={styles.scorePill} style={{
            borderColor: score >= 70 ? 'var(--teal)' : 'var(--ember)',
            color: score >= 70 ? 'var(--teal)' : 'var(--ember)',
          }}>
            {score}% today
          </div>
        </motion.div>

        {/* Habit snapshot */}
        <motion.div className={styles.snapshot} {...fadeUp(0.08)}>
          <p className={styles.snapshotLabel}>// Today's habit snapshot</p>
          <div className={styles.snapshotGrid}>
            {HABITS.map(h => (
              <div
                key={h.id}
                className={`${styles.snapshotDot} ${completed.includes(h.id) ? styles.snapshotDotDone : ''}`}
                title={h.name}
              />
            ))}
          </div>
          <p className={styles.snapshotCount}>
            {completed.length} of {HABITS.length} habits complete
          </p>
        </motion.div>

        {loadingEntry ? (
          <div className={styles.loading}>
            <p className={styles.loadingText}>// Loading your debrief...</p>
          </div>
        ) : (
          <>
            {/* Reflection input */}
            {!response && (
              <motion.div className={styles.reflectionSection} {...fadeUp(0.12)}>
                <p className={styles.sectionLabel}>// Your reflection</p>
                <p className={styles.reflectionHint}>
                  How did today actually go? Be honest — the coach reads everything.
                </p>
                <textarea
                  className={styles.reflectionInput}
                  placeholder="What did I do well? Where did I slip? What's been triggering me?"
                  rows={5}
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                />
                {error && <p className={styles.error}>// {error}</p>}
                <motion.button
                  className={styles.debriefBtn}
                  onClick={handleDebrief}
                  disabled={loading || !reflection.trim()}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className={styles.loadingDots}>
                      // Coach is reading your day
                      <span className={styles.dot1}>.</span>
                      <span className={styles.dot2}>.</span>
                      <span className={styles.dot3}>.</span>
                    </span>
                  ) : (
                    'Get my debrief →'
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Coach response */}
            <AnimatePresence>
              {response && (
                <motion.div
                  className={styles.responseSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.coachHeader}>
                    <span className={styles.coachIcon}>◈</span>
                    <p className={styles.coachLabel}>// SMELTR Coach</p>
                    {todayEntry && (
                      <span className={styles.coachTime}>
                        {new Date(todayEntry.createdAt).toLocaleTimeString('en-GB', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div className={styles.coachBubble}>
                    <p className={styles.coachResponse}>{response}</p>
                  </div>

                  {/* User's reflection shown below */}
                  <div className={styles.userBubble}>
                    <p className={styles.userLabel}>// Your reflection</p>
                    <p className={styles.userReflection}>{reflection}</p>
                  </div>

                  {/* Redo button */}
                  <button
                    className={styles.redoBtn}
                    onClick={() => { setResponse(''); setTodayEntry(null) }}
                  >
                    ↺ Write new reflection
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </div>
    </AppLayout>
  )
}

export default Coach
