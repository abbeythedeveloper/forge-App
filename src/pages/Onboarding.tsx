import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import styles from './Onboarding.module.css'

const GOALS = [
  'Beat lust & temptation',
  'Control impulsiveness',
  'Build wealth',
  'Become well spoken',
  'Trade with discipline',
  'Build daily habits',
  'Get physically fit',
  'Improve mental clarity',
]

const step = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

const Onboarding = () => {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()

  const [current, setCurrent] = useState(0)
  const [name, setName] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [wakeTime, setWakeTime] = useState('06:00')
  const [shiftType, setShiftType] = useState<'morning' | 'night' | 'none'>('none')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleGoal = (g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  const next = () => {
    setError('')
    if (current === 0 && !name.trim()) return setError('Enter your name to continue.')
    if (current === 1 && goals.length === 0) return setError('Pick at least one goal.')
    setCurrent(c => c + 1)
  }

  const finish = async () => {
    setLoading(true)
    try {
      await updateProfile({ name: name.trim(), goals, wakeTime, shiftType, onboarded: true })
      navigate('/dashboard')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    // Step 0 — name
    <motion.div key="step0" variants={step} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <p className={styles.stepLabel}>// Step 1 of 3</p>
      <h2 className={styles.stepTitle}>WHAT DO<br />WE CALL YOU?</h2>
      <p className={styles.stepSub}>This is how your coach will address you.</p>
      <input
        className={styles.input}
        type="text"
        placeholder="Your first name"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && next()}
        autoFocus
      />
      {error && <p className={styles.error}>// {error}</p>}
      <button className={styles.btn} onClick={next}>Continue →</button>
    </motion.div>,

    // Step 1 — goals
    <motion.div key="step1" variants={step} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <p className={styles.stepLabel}>// Step 2 of 3</p>
      <h2 className={styles.stepTitle}>WHAT ARE YOU<br />FIGHTING FOR?</h2>
      <p className={styles.stepSub}>Pick everything that applies. Be honest.</p>
      <div className={styles.goalGrid}>
        {GOALS.map(g => (
          <button
            key={g}
            className={`${styles.goalBtn} ${goals.includes(g) ? styles.goalActive : ''}`}
            onClick={() => toggleGoal(g)}
          >
            {goals.includes(g) && <span className={styles.checkMark}>✓ </span>}
            {g}
          </button>
        ))}
      </div>
      {error && <p className={styles.error}>// {error}</p>}
      <div className={styles.btnRow}>
        <button className={styles.btnBack} onClick={() => setCurrent(0)}>← Back</button>
        <button className={styles.btn} onClick={next}>Continue →</button>
      </div>
    </motion.div>,

    // Step 2 — schedule
    <motion.div key="step2" variants={step} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <p className={styles.stepLabel}>// Step 3 of 3</p>
      <h2 className={styles.stepTitle}>YOUR<br />SCHEDULE.</h2>
      <p className={styles.stepSub}>We'll use this to time your reminders right.</p>

      <label className={styles.fieldLabel}>Wake time</label>
      <input
        className={styles.input}
        type="time"
        value={wakeTime}
        onChange={e => setWakeTime(e.target.value)}
      />

      <label className={styles.fieldLabel} style={{ marginTop: '20px' }}>Shift type</label>
      <div className={styles.shiftRow}>
        {(['none', 'morning', 'night'] as const).map(s => (
          <button
            key={s}
            className={`${styles.shiftBtn} ${shiftType === s ? styles.shiftActive : ''}`}
            onClick={() => setShiftType(s)}
          >
            {s === 'none' ? 'No shift' : s === 'morning' ? 'Morning shift' : 'Night shift'}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>// {error}</p>}
      <div className={styles.btnRow}>
        <button className={styles.btnBack} onClick={() => setCurrent(1)}>← Back</button>
        <button className={styles.btn} onClick={finish} disabled={loading}>
          {loading ? '// Setting up...' : "Let's smeltr →"}
        </button>
      </div>
    </motion.div>,
  ]

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.grid} />
      <div className={styles.card}>
        <div className={styles.logo}>F<span>O</span>RGE</div>
        <div className={styles.progressRow}>
          {[0, 1, 2].map(i => (
            <div key={i} className={`${styles.progressDot} ${i <= current ? styles.progressActive : ''}`} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          {steps[current]}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Onboarding
