import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTodayHabits, useGratitude, HABITS } from '../hooks/useHabits'
import AppLayout from '../layouts/AppLayout'
import styles from './Habits.module.css'

const GROUPS = [
  { key: 'morning', label: 'Morning' },
  { key: 'mind',    label: 'Mind & Discipline' },
  { key: 'body',    label: 'Body & Health' },
  { key: 'evening', label: 'Evening Wind-Down' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
})

const Habits = () => {
  const { completed, toggle, score, loading } = useTodayHabits()
  const { entries: gratEntries, setEntries: setGratEntries, saved: gratSaved, saving: gratSaving, save: saveGratitude } = useGratitude()
  const [gratOpen, setGratOpen] = useState(false)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const handleGratitudeRowClick = () => {
    // if already done just toggle check like normal
    if (completed.includes('gratitude') && gratSaved) {
      setGratOpen(v => !v)
      return
    }
    setGratOpen(v => !v)
  }

  const handleGratitudeSave = () => {
    saveGratitude(gratEntries, () => {
      if (!completed.includes('gratitude')) toggle('gratitude')
      setGratOpen(false)
    })
  }

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div className={styles.header} {...fadeUp(0)}>
          <div>
            <p className={styles.dateLabel}>// {today}</p>
            <h1 className={styles.title}>DAILY HABITS</h1>
          </div>
          <div className={styles.scoreBadge} style={{
            borderColor: score >= 70 ? 'var(--teal)' : 'var(--ember)',
            color: score >= 70 ? 'var(--teal)' : 'var(--ember)',
          }}>
            {completed.length}/{HABITS.length}
          </div>
        </motion.div>

        <motion.div className={styles.progressWrap} {...fadeUp(0.05)}>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              style={{ background: score >= 70 ? 'var(--teal)' : 'var(--ember)' }}
            />
          </div>
          <span className={styles.progressLabel}>{score}% complete</span>
        </motion.div>

        <AnimatePresence>
          {completed.length === HABITS.length && (
            <motion.div
              className={styles.allDone}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className={styles.allDoneTitle}>ALL 14 COMPLETE.</p>
              <p className={styles.allDoneSub}>Every habit done. That is a perfect day in the smelter.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className={styles.loading}>
            <p className={styles.loadingText}>// Loading your habits...</p>
          </div>
        ) : (
          GROUPS.map((group, gi) => {
            const groupHabits = HABITS.filter(h => h.group === group.key)
            const groupDone = groupHabits.filter(h => completed.includes(h.id)).length
            return (
              <motion.div key={group.key} className={styles.group} {...fadeUp(0.1 + gi * 0.06)}>
                <div className={styles.groupHeader}>
                  <p className={styles.groupLabel}>// {group.label}</p>
                  <span className={styles.groupCount}>{groupDone}/{groupHabits.length}</span>
                </div>
                <div className={styles.habitList}>
                  {groupHabits.map((habit, hi) => {
                    const done = completed.includes(habit.id)

                    // ── Gratitude special row ──────────────────────────────
                    if (habit.id === 'gratitude') {
                      return (
                        <div key={habit.id}>
                          <motion.div
                            className={`${styles.habitRow} ${done ? styles.habitDone : ''}`}
                            onClick={handleGratitudeRowClick}
                            whileTap={{ scale: 0.98 }}
                            layout
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + gi * 0.06 + hi * 0.04 }}
                          >
                            <motion.div
                              className={`${styles.check} ${done ? styles.checkDone : ''}`}
                              animate={{ scale: done ? [1, 1.2, 1] : 1 }}
                              transition={{ duration: 0.25 }}
                            >
                              {done && (
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                  <motion.path d="M2 5.5l2.5 2.5 4.5-4.5"
                                    stroke="white" strokeWidth="1.8"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.25 }} />
                                </svg>
                              )}
                            </motion.div>
                            <div className={styles.habitInfo}>
                              <p className={styles.habitName}>{habit.name}</p>
                              <p className={styles.habitTag}>
                                {done && gratSaved ? 'saved for today' : habit.tag}
                              </p>
                            </div>
                            <span className={styles.expandCaret}>
                              {gratOpen ? '▲' : '▼'}
                            </span>
                          </motion.div>

                          <AnimatePresence>
                            {gratOpen && (
                              <motion.div
                                className={styles.gratitudePanel}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div className={styles.gratitudeInner}>
                                  <p className={styles.gratitudeLabel}>
                                    // Three things you're grateful for today
                                  </p>
                                  {[0, 1, 2].map(i => (
                                    <div key={i} className={styles.gratitudeField}>
                                      <span className={styles.gratitudeNum}>{i + 1}</span>
                                      <input
                                        className={styles.gratitudeInput}
                                        type="text"
                                        placeholder={
                                          i === 0 ? 'I am grateful for...' :
                                          i === 1 ? 'I am grateful for...' :
                                          'I am grateful for...'
                                        }
                                        value={gratEntries[i] || ''}
                                        onChange={e => {
                                          const next = [...gratEntries]
                                          next[i] = e.target.value
                                          setGratEntries(next)
                                        }}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter' && i === 2) handleGratitudeSave()
                                        }}
                                      />
                                    </div>
                                  ))}
                                  <button
                                    className={styles.gratitudeSaveBtn}
                                    onClick={handleGratitudeSave}
                                    disabled={gratSaving || gratEntries.every(e => !e.trim())}
                                  >
                                    {gratSaving ? '// Saving...' : gratSaved ? 'Update ✓' : 'Save & complete →'}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    // ── Regular habit row ──────────────────────────────────
                    return (
                      <motion.div
                        key={habit.id}
                        className={`${styles.habitRow} ${done ? styles.habitDone : ''}`}
                        onClick={() => toggle(habit.id)}
                        whileTap={{ scale: 0.98 }}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + gi * 0.06 + hi * 0.04 }}
                      >
                        <motion.div
                          className={`${styles.check} ${done ? styles.checkDone : ''}`}
                          animate={{ scale: done ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 0.25 }}
                        >
                          {done && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <motion.path d="M2 5.5l2.5 2.5 4.5-4.5"
                                stroke="white" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                transition={{ duration: 0.25 }} />
                            </svg>
                          )}
                        </motion.div>
                        <div className={styles.habitInfo}>
                          <p className={styles.habitName}>{habit.name}</p>
                          <p className={styles.habitTag}>{habit.tag}</p>
                        </div>
                        {habit.id === 'nolust' && (
                          <span className={styles.priorityBadge}>Priority</span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })
        )}

        {new Date().getHours() >= 18 && (
          <motion.div className={styles.reflectionPrompt} {...fadeUp(0.5)}>
            <p className={styles.reflectionLabel}>// Evening reflection</p>
            <p className={styles.reflectionText}>
              Day is nearly done. Head to your AI Coach to debrief — or write your reflection below.
            </p>
            <textarea
              className={styles.reflectionInput}
              placeholder="How did today go? Be honest..."
              rows={3}
            />
          </motion.div>
        )}

      </div>
    </AppLayout>
  )
}

export default Habits
