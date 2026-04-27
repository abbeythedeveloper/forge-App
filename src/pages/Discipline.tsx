import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, query, orderBy, limit } from 'firebase/firestore'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../layouts/AppLayout'
import styles from './Discipline.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
})

type EntryType = 'lust' | 'impulse' | 'anger'
type Outcome = 'resisted' | 'gave_in'

interface LogForm {
  type: EntryType
  trigger: string
  outcome: Outcome
  notes: string
}


const TYPE_LABELS: Record<EntryType, string> = {
  lust: 'Lust / Temptation',
  impulse: 'Impulse / Reactive',
  anger: 'Anger / Frustration',
}

const TRIGGER_SUGGESTIONS = [
  'Boredom', 'Stress', 'Late night', 'Social media',
  'Loneliness', 'Tiredness', 'Financial pressure', 'Argument',
]

const Discipline = () => {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<LogForm>({
    type: 'lust', trigger: '', outcome: 'resisted', notes: '',
  })

  const entriesRef = user
    ? query(collection(db, 'discipline', user.uid, 'entries'), orderBy('timestamp', 'desc'), limit(30))
    : null

  const [entries = [], loading] = useCollectionData(entriesRef as any)

  const resistedCount = entries.filter((e: any) => e.outcome === 'resisted').length
  const slippedCount  = entries.filter((e: any) => e.outcome === 'gave_in').length

  const handleSubmit = async () => {
    if (!user || !form.trigger.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'discipline', user.uid, 'entries'), {
        ...form, timestamp: new Date().toISOString(),
      })
      setForm({ type: 'lust', trigger: '', outcome: 'resisted', notes: '' })
      setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div className={styles.header} {...fadeUp(0)}>
          <div>
            <p className={styles.dateLabel}>// Know your enemy</p>
            <h1 className={styles.title}>DISCIPLINE LOG</h1>
          </div>
          <motion.button className={styles.logBtn} onClick={() => setShowForm(v => !v)} whileTap={{ scale: 0.97 }}>
            {showForm ? 'Cancel' : '+ Log urge'}
          </motion.button>
        </motion.div>

        <motion.div className={styles.statsRow} {...fadeUp(0.08)}>
          <div className={styles.statCard}>
            <div className={styles.statNum} style={{ color: 'var(--teal)' }}>{resistedCount}</div>
            <div className={styles.statLabel}>times resisted</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum} style={{ color: 'var(--ember)' }}>{slippedCount}</div>
            <div className={styles.statLabel}>times slipped</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{entries.length}</div>
            <div className={styles.statLabel}>total entries</div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div className={styles.form}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <div className={styles.formInner}>
                <p className={styles.formLabel}>// What happened?</p>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Type of urge</label>
                  <div className={styles.typeRow}>
                    {(Object.keys(TYPE_LABELS) as EntryType[]).map(t => (
                      <button key={t}
                        className={`${styles.typeBtn} ${form.type === t ? styles.typeBtnActive : ''}`}
                        onClick={() => setForm(f => ({ ...f, type: t }))}>
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>What triggered it?</label>
                  <input className={styles.input} type="text"
                    placeholder="Be specific — boredom, stress, late night..."
                    value={form.trigger}
                    onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))} />
                  <div className={styles.suggestions}>
                    {TRIGGER_SUGGESTIONS.map(s => (
                      <button key={s} className={styles.suggestionBtn}
                        onClick={() => setForm(f => ({ ...f, trigger: s }))}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>What happened?</label>
                  <div className={styles.outcomeRow}>
                    <button className={`${styles.outcomeBtn} ${form.outcome === 'resisted' ? styles.outcomeBtnGreen : ''}`}
                      onClick={() => setForm(f => ({ ...f, outcome: 'resisted' }))}>✓ Resisted</button>
                    <button className={`${styles.outcomeBtn} ${form.outcome === 'gave_in' ? styles.outcomeBtnRed : ''}`}
                      onClick={() => setForm(f => ({ ...f, outcome: 'gave_in' }))}>✗ Gave in</button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Notes (optional)</label>
                  <textarea className={styles.textarea} rows={2}
                    placeholder="What will you do differently next time?"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                <motion.button className={styles.submitBtn} onClick={handleSubmit}
                  disabled={submitting || !form.trigger.trim()} whileTap={{ scale: 0.98 }}>
                  {submitting ? '// Saving...' : 'Save entry →'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div {...fadeUp(0.15)}>
          <p className={styles.sectionLabel}>// Recent entries</p>
          {loading ? (
            <div className={styles.loading}><p className={styles.loadingText}>// Loading entries...</p></div>
          ) : entries.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>NO ENTRIES YET.</p>
              <p className={styles.emptySub}>Log every urge — resisted or not. Patterns only emerge when you are honest.</p>
            </div>
          ) : (
            <div className={styles.entryList}>
              {entries.map((entry: any, i: number) => (
                <motion.div key={entry.id || i} className={styles.entryCard}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <div className={styles.entryTop}>
                    <span className={`${styles.typePill} ${styles[`type_${entry.type}`]}`}>
                      {TYPE_LABELS[entry.type as EntryType] || entry.type}
                    </span>
                    <span className={styles.entryTime}>{formatTime(entry.timestamp)}</span>
                  </div>
                  <p className={styles.entryTrigger}>
                    <span className={styles.entryTriggerLabel}>Trigger:</span> {entry.trigger}
                  </p>
                  {entry.notes && <p className={styles.entryNotes}>{entry.notes}</p>}
                  <div className={`${styles.outcomeTag} ${entry.outcome === 'resisted' ? styles.outcomeTagGreen : styles.outcomeTagRed}`}>
                    {entry.outcome === 'resisted' ? '✓ Resisted' : '✗ Gave in'}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </AppLayout>
  )
}

export default Discipline
