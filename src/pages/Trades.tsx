import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, query, orderBy, limit } from 'firebase/firestore'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useTodayHabits } from '../hooks/useHabits'
import AppLayout from '../layouts/AppLayout'
import styles from './Trades.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
})

type Emotion = 'calm' | 'anxious' | 'greedy' | 'disciplined' | 'frustrated' | 'confident'
type Result = 'profit' | 'loss' | 'breakeven'

interface TradeForm {
  instrument: string
  entry: string
  exit: string
  result: Result
  emotion: Emotion
  followedPlan: boolean
  notes: string
}

const EMOTIONS: Emotion[] = ['calm', 'disciplined', 'confident', 'anxious', 'greedy', 'frustrated']
const EMOTION_COLORS: Record<Emotion, string> = {
  calm:        'var(--teal)',
  disciplined: 'var(--teal)',
  confident:   'var(--teal)',
  anxious:     'var(--ember)',
  greedy:      'var(--ember)',
  frustrated:  'var(--ember)',
}

const INSTRUMENTS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'NAS100', 'SPX500', 'Other']

const Trades = () => {
  const { user, profile } = useAuth()
  const { score } = useTodayHabits()
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<TradeForm>({
    instrument: 'XAUUSD',
    entry: '',
    exit: '',
    result: 'profit',
    emotion: 'calm',
    followedPlan: true,
    notes: '',
  })

  const tradesRef = user
    ? query(collection(db, 'trades', user.uid, 'entries'), orderBy('timestamp', 'desc'), limit(20))
    : null

  const [trades = [], loading] = useCollectionData(tradesRef as any)

  const profitCount   = trades.filter((t: any) => t.result === 'profit').length
  const lossCount     = trades.filter((t: any) => t.result === 'loss').length
  const planCount     = trades.filter((t: any) => t.followedPlan).length
  const planPct       = trades.length ? Math.round((planCount / trades.length) * 100) : 0
  const calmTrades    = trades.filter((t: any) => ['calm','disciplined','confident'].includes(t.emotion))
  const calmWinRate   = calmTrades.length
    ? Math.round((calmTrades.filter((t: any) => t.result === 'profit').length / calmTrades.length) * 100)
    : 0

  const handleSubmit = async () => {
    if (!user || !form.entry || !form.exit) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'trades', user.uid, 'entries'), {
        ...form,
        entry: parseFloat(form.entry),
        exit: parseFloat(form.exit),
        habitScore: score,
        timestamp: new Date().toISOString(),
      })
      setForm({ instrument: 'XAUUSD', entry: '', exit: '', result: 'profit', emotion: 'calm', followedPlan: true, notes: '' })
      setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' · ' + new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  // Pro gate
  if (profile?.plan !== 'pro') {
    return (
      <AppLayout>
        <div className={styles.page}>
          <motion.div className={styles.gate} {...fadeUp(0)}>
            <p className={styles.gateLabel}>// Pro feature</p>
            <h1 className={styles.gateTitle}>TRADE JOURNAL</h1>
            <p className={styles.gateSub}>
              Log every trade with your emotional state. SMELTR correlates your
              daily discipline score with your trading performance and shows you
              the pattern you have been ignoring.
            </p>
            <div className={styles.gateFeatures}>
              {[
                'Log entry, exit, result and emotion per trade',
                'Habit score vs trade outcome correlation',
                'Win rate when disciplined vs reactive',
                'AI pattern alerts in your daily debrief',
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
            <p className={styles.dateLabel}>// Discipline meets markets</p>
            <h1 className={styles.title}>TRADE JOURNAL</h1>
          </div>
          <motion.button className={styles.logBtn}
            onClick={() => setShowForm(v => !v)} whileTap={{ scale: 0.97 }}>
            {showForm ? 'Cancel' : '+ Log trade'}
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div className={styles.statsRow} {...fadeUp(0.08)}>
          <div className={styles.statCard}>
            <div className={styles.statNum} style={{ color: 'var(--teal)' }}>{profitCount}</div>
            <div className={styles.statLabel}>profitable</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum} style={{ color: 'var(--ember)' }}>{lossCount}</div>
            <div className={styles.statLabel}>losses</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum}>{planPct}%</div>
            <div className={styles.statLabel}>plan followed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNum} style={{ color: 'var(--teal)' }}>{calmWinRate}%</div>
            <div className={styles.statLabel}>win rate calm</div>
          </div>
        </motion.div>

        {/* Pattern alert */}
        {trades.length >= 5 && (
          <motion.div className={styles.patternAlert} {...fadeUp(0.12)}>
            <p className={styles.patternLabel}>// AI pattern alert</p>
            <p className={styles.patternText}>
              {calmWinRate > 50
                ? `You win ${calmWinRate}% of trades when calm or disciplined. Your habit score today is ${score}%. ${score >= 70 ? 'Good conditions.' : 'Get above 70% before your next entry.'}`
                : `Your win rate when reactive or anxious is low. The market is showing you what your habits already know. Build the discipline first.`
              }
            </p>
          </motion.div>
        )}

        {/* Log form */}
        <AnimatePresence>
          {showForm && (
            <motion.div className={styles.form}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <div className={styles.formInner}>
                <p className={styles.formLabel}>// Log a trade</p>

                {/* Instrument */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Instrument</label>
                  <div className={styles.chipRow}>
                    {INSTRUMENTS.map(inst => (
                      <button key={inst}
                        className={`${styles.chip} ${form.instrument === inst ? styles.chipActive : ''}`}
                        onClick={() => setForm(f => ({ ...f, instrument: inst }))}>
                        {inst}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Entry / Exit */}
                <div className={styles.twoCol}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Entry price</label>
                    <input className={styles.input} type="number" placeholder="0.00"
                      value={form.entry} onChange={e => setForm(f => ({ ...f, entry: e.target.value }))} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Exit price</label>
                    <input className={styles.input} type="number" placeholder="0.00"
                      value={form.exit} onChange={e => setForm(f => ({ ...f, exit: e.target.value }))} />
                  </div>
                </div>

                {/* Result */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Result</label>
                  <div className={styles.outcomeRow}>
                    {(['profit', 'loss', 'breakeven'] as Result[]).map(r => (
                      <button key={r}
                        className={`${styles.outcomeBtn} ${form.result === r ? styles[`outcome_${r}`] : ''}`}
                        onClick={() => setForm(f => ({ ...f, result: r }))}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotion */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Emotional state entering</label>
                  <div className={styles.chipRow}>
                    {EMOTIONS.map(e => (
                      <button key={e}
                        className={`${styles.chip} ${form.emotion === e ? styles.chipActive : ''}`}
                        onClick={() => setForm(f => ({ ...f, emotion: e }))}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Followed plan */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Followed your plan?</label>
                  <div className={styles.outcomeRow}>
                    <button
                      className={`${styles.outcomeBtn} ${form.followedPlan ? styles.outcome_profit : ''}`}
                      onClick={() => setForm(f => ({ ...f, followedPlan: true }))}>
                      Yes
                    </button>
                    <button
                      className={`${styles.outcomeBtn} ${!form.followedPlan ? styles.outcome_loss : ''}`}
                      onClick={() => setForm(f => ({ ...f, followedPlan: false }))}>
                      No
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Notes (optional)</label>
                  <textarea className={styles.textarea} rows={2}
                    placeholder="What did you do right or wrong?"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                <motion.button className={styles.submitBtn} onClick={handleSubmit}
                  disabled={submitting || !form.entry || !form.exit} whileTap={{ scale: 0.98 }}>
                  {submitting ? '// Saving...' : 'Save trade →'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trade history */}
        <motion.div {...fadeUp(0.15)}>
          <p className={styles.sectionLabel}>// Trade history</p>
          {loading ? (
            <div className={styles.loading}><p className={styles.loadingText}>// Loading trades...</p></div>
          ) : trades.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>NO TRADES LOGGED.</p>
              <p className={styles.emptySub}>Every trade you log becomes data. Data becomes patterns. Patterns become discipline.</p>
            </div>
          ) : (
            <div className={styles.tradeList}>
              {trades.map((trade: any, i: number) => (
                <motion.div key={trade.id || i} className={styles.tradeCard}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <div className={styles.tradeTop}>
                    <div className={styles.tradeLeft}>
                      <span className={styles.tradeInstrument}>{trade.instrument}</span>
                      <span className={styles.tradeTime}>{formatTime(trade.timestamp)}</span>
                    </div>
                    <span className={`${styles.resultPill} ${styles[`result_${trade.result}`]}`}>
                      {trade.result}
                    </span>
                  </div>
                  <div className={styles.tradeStats}>
                    <div className={styles.tradeStat}>
                      <span className={styles.tradeStatLabel}>Entry</span>
                      <span className={styles.tradeStatVal}>{trade.entry}</span>
                    </div>
                    <div className={styles.tradeStat}>
                      <span className={styles.tradeStatLabel}>Exit</span>
                      <span className={styles.tradeStatVal}>{trade.exit}</span>
                    </div>
                    <div className={styles.tradeStat}>
                      <span className={styles.tradeStatLabel}>Emotion</span>
                      <span className={styles.tradeStatVal} style={{ color: EMOTION_COLORS[trade.emotion as Emotion] }}>
                        {trade.emotion}
                      </span>
                    </div>
                    <div className={styles.tradeStat}>
                      <span className={styles.tradeStatLabel}>Plan</span>
                      <span className={styles.tradeStatVal} style={{ color: trade.followedPlan ? 'var(--teal)' : 'var(--ember)' }}>
                        {trade.followedPlan ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className={styles.tradeStat}>
                      <span className={styles.tradeStatLabel}>Habit score</span>
                      <span className={styles.tradeStatVal}>{trade.habitScore ?? '—'}%</span>
                    </div>
                  </div>
                  {trade.notes && <p className={styles.tradeNotes}>{trade.notes}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </AppLayout>
  )
}

export default Trades
