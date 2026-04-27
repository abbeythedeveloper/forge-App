import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Trading.module.css'

const Trading = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className={styles.trading} ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.copy}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.label}>// For traders</p>
          <h2 className={styles.headline}>
            YOUR INNER WORLD<br />SHOWS IN YOUR<br />CHARTS.
          </h2>
          <p className={styles.desc}>
            Impulsive entries. Emotional exits. Revenge trading. These aren't market
            problems — they're <strong>you</strong> problems. Smeltr connects your daily
            discipline score to your trading decisions and shows you the pattern
            you've been ignoring.
          </p>
        </motion.div>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <p className={styles.cardLabel}>// AI pattern alert</p>
          <div className={styles.insight}>
            <p>You trade significantly better on days when your habit score is above 70%. Today is 71%. Good conditions for a disciplined entry.</p>
            <span>— Smeltr coach · based on 14 days of data</span>
          </div>
          <div className={styles.insight}>
            <p>3 of your last 4 losing trades happened after days you skipped the "pause before reacting" habit. Pattern flagged.</p>
            <span>— Smeltr coach · discipline correlation</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Trading
