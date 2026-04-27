import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTodayHabits, useStreak, useDisciplineStreak, HABITS } from '../hooks/useHabits'
import AppLayout from '../layouts/AppLayout'
import styles from './Dashboard.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
})

function getGreeting(name: string) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name || 'Warrior'}.`
}

function formatDate() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function ProgressRing({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-hover)" strokeWidth={5} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--ember)" strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', fill:'var(--text-primary)' }}>
        {pct}%
      </text>
    </svg>
  )
}

const Dashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { completed, score, loading } = useTodayHabits()
  const streak = useStreak()
  const lustStreak = useDisciplineStreak('nolust')
  const impulseStreak = useDisciplineStreak('nospend')

  const nextHabits = useMemo(() =>
    HABITS.filter(h => !completed.includes(h.id)).slice(0, 3), [completed])

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div className={styles.header} {...fadeUp(0)}>
          <div>
            <p className={styles.dateLabel}>// {formatDate()}</p>
            <h1 className={styles.greeting}>{getGreeting(profile?.name || '')}</h1>
          </div>
          <div className={styles.dayBadge}>Day {streak.current > 0 ? streak.current : 1}</div>
        </motion.div>

        <motion.div className={styles.statsRow} {...fadeUp(0.1)}>
          <div className={styles.statCard} style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <ProgressRing pct={score} />
            <div>
              <div className={styles.statNum}>{completed.length}<span>/{HABITS.length}</span></div>
              <div className={styles.statLabel}>habits today</div>
              <div className={styles.statSub}>
                {score===100?'Fully forged.':score>=70?'Solid day.':score>=40?'Keep pushing.':'Just getting started.'}
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumLarge}>{streak.current}</div>
            <div className={styles.statLabel}>day streak</div>
            <div className={styles.statSub}>Best: {streak.best} days</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumLarge} style={{ color: score>=70?'var(--teal)':'var(--ember)' }}>{score}%</div>
            <div className={styles.statLabel}>completion</div>
            <div className={styles.statSub}>{score>=70?'Above threshold':'Below 70% target'}</div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)}>
          <p className={styles.sectionLabel}>// Battle status</p>
          <div className={styles.battleRow}>
            {[
              { icon:'L', name:'Lust — clean', s: lustStreak },
              { icon:'I', name:'Impulse — controlled', s: impulseStreak },
            ].map(b => (
              <div key={b.icon} className={styles.battleCard}>
                <div className={styles.battleIcon}>{b.icon}</div>
                <div>
                  <div className={styles.battleName}>{b.name}</div>
                  <div className={styles.battleStreak}>{b.s}d streak</div>
                </div>
                <div className={`${styles.battlePill} ${b.s>0?styles.battleGreen:styles.battleRed}`}>
                  {b.s>0?`${b.s}d`:'Broken'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.3)}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>// Next up</p>
            <button className={styles.seeAll} onClick={() => navigate('/habits')}>See all {HABITS.length} →</button>
          </div>
          {loading ? (
            <div className={styles.loadingBox}><p className={styles.loadingText}>// Loading...</p></div>
          ) : nextHabits.length === 0 ? (
            <div className={styles.allDoneBox}>
              <p className={styles.allDoneTitle}>ALL HABITS COMPLETE.</p>
              <p className={styles.allDoneSub}>Every single one. That's what forged looks like.</p>
            </div>
          ) : (
            <div className={styles.habitList}>
              {nextHabits.map((h, i) => (
                <motion.div key={h.id} className={styles.habitRow}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: 0.35 + i*0.07 }}
                  onClick={() => navigate('/habits')}>
                  <div className={styles.habitCheck} />
                  <div className={styles.habitInfo}>
                    <div className={styles.habitName}>{h.name}</div>
                    <div className={styles.habitTag}>{h.tag}</div>
                  </div>
                  <div className={styles.habitGroup}>{h.group}</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.4)}>
          <div className={styles.coachCard}
            onClick={() => navigate(profile?.plan==='pro'?'/coach':'/pricing')}>
            <div>
              <p className={styles.coachLabel}>// AI Coach</p>
              <p className={styles.coachText}>
                {profile?.plan==='pro'
                  ? 'Your daily debrief is ready. Reflect on today.'
                  : 'Upgrade to Pro to unlock your daily AI debrief.'}
              </p>
            </div>
            <div className={styles.coachArrow}>→</div>
          </div>
        </motion.div>

      </div>
    </AppLayout>
  )
}

export default Dashboard
