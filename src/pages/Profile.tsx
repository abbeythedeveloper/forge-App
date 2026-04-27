import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useStreak, HABITS } from '../hooks/useHabits'
import AppLayout from '../layouts/AppLayout'
import styles from './Profile.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
})

const GOALS = [
  'Beat lust & temptation', 'Control impulsiveness', 'Build wealth',
  'Become well spoken', 'Trade with discipline', 'Build daily habits',
  'Get physically fit', 'Improve mental clarity',
]

const DAY_OPTIONS = [7, 14, 30, 60, 90]

interface DayLog { date: string; score: number; completed: number }

const Profile = () => {
  const { profile, updateProfile, logout } = useAuth()
  const streak = useStreak()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [goals, setGoals] = useState<string[]>(profile?.goals || [])
  const [wakeTime, setWakeTime] = useState(profile?.wakeTime || '06:00')
  const [shiftType, setShiftType] = useState(profile?.shiftType || 'none')

  const [historyDays, setHistoryDays] = useState(30)
  const [historyData, setHistoryData] = useState<DayLog[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<DayLog | null>(null)

  // Load streak history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile) return
      setLoadingHistory(true)
      const data: DayLog[] = []
      for (let i = historyDays - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
        try {
          const { getDoc, doc } = await import('firebase/firestore')
          const snap = await getDoc(doc(db, 'habits', profile.uid, 'logs', date))
          if (snap.exists()) {
            const d = snap.data()
            data.push({ date, score: d.score || 0, completed: (d.completedIds || []).length })
          } else {
            data.push({ date, score: 0, completed: 0 })
          }
        } catch {
          data.push({ date, score: 0, completed: 0 })
        }
      }
      setHistoryData(data)
      setLoadingHistory(false)
    }
    fetchHistory()
  }, [profile, historyDays])

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({ name, goals, wakeTime, shiftType: shiftType as any })
    setSaving(false)
    setEditing(false)
  }

  const toggleGoal = (g: string) =>
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const avgScore = historyData.length
    ? Math.round(historyData.reduce((s, d) => s + d.score, 0) / historyData.length)
    : 0
  const bestDay = historyData.reduce((best, d) => d.score > best.score ? d : best, { date: '', score: 0, completed: 0 })
  const activeDays = historyData.filter(d => d.completed > 0).length

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <AppLayout>
      <div className={styles.page}>

        {/* Header */}
        <motion.div className={styles.header} {...fadeUp(0)}>
          <div>
            <p className={styles.dateLabel}>// Your profile</p>
            <h1 className={styles.title}>{profile?.name?.toUpperCase() || 'PROFILE'}</h1>
          </div>
          <div className={styles.planBadge}
            style={{ borderColor: profile?.plan === 'pro' ? 'var(--teal)' : 'var(--ember)',
                     color: profile?.plan === 'pro' ? 'var(--teal)' : 'var(--ember)' }}>
            {profile?.plan === 'pro' ? 'Pro' : 'Free'}
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div className={styles.statsRow} {...fadeUp(0.08)}>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{streak.current}</div>
            <div className={styles.statLabel}>current streak</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{streak.best}</div>
            <div className={styles.statLabel}>best streak</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{avgScore}%</div>
            <div className={styles.statLabel}>{historyDays}d average</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{activeDays}</div>
            <div className={styles.statLabel}>active days</div>
          </div>
        </motion.div>

        {/* Streak history graph */}
        <motion.div className={styles.graphSection} {...fadeUp(0.12)}>
          <div className={styles.graphHeader}>
            <p className={styles.sectionLabel}>// Habit score history</p>
            <div className={styles.daySelector}>
              {DAY_OPTIONS.map(d => (
                <button key={d}
                  className={`${styles.dayBtn} ${historyDays === d ? styles.dayBtnActive : ''}`}
                  onClick={() => setHistoryDays(d)}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {loadingHistory ? (
            <div className={styles.graphLoading}>
              <p className={styles.loadingText}>// Loading history...</p>
            </div>
          ) : (
            <div className={styles.graphWrap}>
              {/* Y axis labels */}
              <div className={styles.yAxis}>
                {[100, 75, 50, 25, 0].map(v => (
                  <span key={v} className={styles.yLabel}>{v}%</span>
                ))}
              </div>

              {/* Graph area */}
              <div className={styles.graphArea}>
                {/* Grid lines */}
                <div className={styles.gridLines}>
                  {[100, 75, 50, 25, 0].map(v => (
                    <div key={v} className={styles.gridLine}
                      style={{ bottom: `${v}%` }}
                    />
                  ))}
                  {/* 70% threshold line */}
                  <div className={styles.thresholdLine} style={{ bottom: '70%' }}>
                    <span className={styles.thresholdLabel}>70%</span>
                  </div>
                </div>

                {/* Bars */}
                <div className={styles.bars}>
                  {historyData.map((day, i) => (
                    <div key={day.date} className={styles.barWrap}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}>
                      <motion.div
                        className={styles.bar}
                        style={{
                          background: day.score >= 100 ? 'var(--teal)' :
                                      day.score >= 70  ? 'var(--ember)' :
                                      day.score > 0   ? 'var(--border-hover)' :
                                      'transparent',
                          height: `${(day.score / 100) * 100}%`,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.score / 100) * 100}%` }}
                        transition={{ duration: 0.4, delay: i * 0.01, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  ))}
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredDay && (
                    <motion.div className={styles.tooltip}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <p className={styles.tooltipDate}>{formatDate(hoveredDay.date)}</p>
                      <p className={styles.tooltipScore}>{hoveredDay.score}%</p>
                      <p className={styles.tooltipHabits}>{hoveredDay.completed}/{HABITS.length} habits</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Graph summary */}
          {!loadingHistory && historyData.length > 0 && (
            <div className={styles.graphSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} style={{ background: 'var(--teal)' }} />
                <span>100% — perfect day</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} style={{ background: 'var(--ember)' }} />
                <span>70–99% — above threshold</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryDot} style={{ background: 'var(--border-hover)' }} />
                <span>Below 70%</span>
              </div>
              {bestDay.score > 0 && (
                <div className={styles.summaryBest}>
                  Best day: <strong>{formatDate(bestDay.date)}</strong> — {bestDay.score}%
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Profile details */}
        <motion.div className={styles.detailsSection} {...fadeUp(0.18)}>
          <div className={styles.detailsHeader}>
            <p className={styles.sectionLabel}>// Your details</p>
            <button className={styles.editBtn} onClick={() => {
              setEditing(v => !v)
              setName(profile?.name || '')
              setGoals(profile?.goals || [])
              setWakeTime(profile?.wakeTime || '06:00')
              setShiftType(profile?.shiftType || 'none')
            }}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editing ? (
            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailVal}>{profile?.name || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailVal}>{profile?.email || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Wake time</span>
                <span className={styles.detailVal}>{profile?.wakeTime || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Shift type</span>
                <span className={styles.detailVal}>{profile?.shiftType || '—'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Goals</span>
                <div className={styles.goalTags}>
                  {(profile?.goals || []).map(g => (
                    <span key={g} className={styles.goalTag}>{g}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div className={styles.editForm}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Name</label>
                  <input className={styles.input} type="text" value={name}
                    onChange={e => setName(e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Wake time</label>
                  <input className={styles.input} type="time" value={wakeTime}
                    onChange={e => setWakeTime(e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Shift type</label>
                  <div className={styles.shiftRow}>
                    {(['none', 'morning', 'night'] as const).map(s => (
                      <button key={s}
                        className={`${styles.shiftBtn} ${shiftType === s ? styles.shiftActive : ''}`}
                        onClick={() => setShiftType(s)}>
                        {s === 'none' ? 'No shift' : s === 'morning' ? 'Morning' : 'Night'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Goals</label>
                  <div className={styles.goalGrid}>
                    {GOALS.map(g => (
                      <button key={g}
                        className={`${styles.goalSelectBtn} ${goals.includes(g) ? styles.goalSelectActive : ''}`}
                        onClick={() => toggleGoal(g)}>
                        {goals.includes(g) && <span className={styles.goalCheck}>✓ </span>}
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? '// Saving...' : 'Save changes →'}
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Plan */}
        <motion.div className={styles.planSection} {...fadeUp(0.22)}>
          <p className={styles.sectionLabel}>// Plan</p>
          <div className={styles.planCard}>
            <div>
              <p className={styles.planName}>
                {profile?.plan === 'pro' ? 'Pro — $7/month' : 'Free tier'}
              </p>
              <p className={styles.planDesc}>
                {profile?.plan === 'pro'
                  ? 'Full access — AI coach, trade journal, unlimited history.'
                  : 'Upgrade to unlock AI coach, trade journal, and full history.'}
              </p>
            </div>
            {profile?.plan !== 'pro' && (
              <button className={styles.upgradeBtn}
                onClick={() => window.location.href = '/pricing'}>
                Upgrade →
              </button>
            )}
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div {...fadeUp(0.26)}>
          <button className={styles.signOutBtn} onClick={logout}>
            Sign out
          </button>
        </motion.div>

      </div>
    </AppLayout>
  )
}

export default Profile
