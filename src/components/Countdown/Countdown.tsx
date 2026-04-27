import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Countdown.module.css'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const TARGET = new Date('2026-10-01T00:00:00Z')
const pad = (n: number) => String(n).padStart(2, '0')

const Countdown = () => {
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = TARGET.getTime() - Date.now()
      if (diff <= 0) return
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'DAYS', value: time.days },
    { label: 'HRS', value: time.hours },
    { label: 'MIN', value: time.minutes },
    { label: 'SEC', value: time.seconds },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.scanlines} />
      <motion.p
        className={styles.label}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        // Time until smeltr goes live
      </motion.p>
      <div className={styles.timer}>
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            className={styles.unit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.block}>
              <span className={styles.num}>{pad(u.value)}</span>
              <div className={styles.noise} />
            </div>
            <p className={styles.unitLabel}>{u.label}</p>
          </motion.div>
        ))}
      </div>
      <motion.p
        className={styles.sub}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        Q4 2026 · The hammer drops.
      </motion.p>
    </section>
  )
}

export default Countdown
