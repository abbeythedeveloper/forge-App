import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Features.module.css'

const features = [
  {
    num: '01',
    title: 'Daily habit engine',
    desc: '14 non-negotiable habits grouped by time of day. Morning through evening. Check them off as you go. Your streak is always watching.',
    tag: 'morning · mind · body · evening',
  },
  {
    num: '02',
    title: 'Discipline log',
    desc: 'Track every urge — lust, impulse spending, reactive anger. Log the trigger. Log the outcome. Over time, patterns emerge. So does power.',
    tag: 'lust · impulse · anger',
  },
  {
    num: '03',
    title: 'AI daily debrief',
    desc: 'Every night, an AI coach reads your habit data and reflection — then talks back. Directly. No generic tips. It remembers your patterns and calls them out.',
    tag: 'powered by Claude',
  },
  {
    num: '04',
    title: 'Trade journal',
    desc: 'Log every trade alongside your emotional state. Smeltr then shows you the correlation between your daily discipline score and your trading performance.',
    tag: 'discipline meets markets',
  },
]

const Features = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className={styles.features} id="features">
      <motion.p
        className={styles.label}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        // What smeltr gives you
      </motion.p>
      <div className={styles.grid} ref={ref}>
        {features.map((f, i) => (
          <motion.div
            key={f.num}
            className={styles.card}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
            whileHover={{ backgroundColor: 'var(--card-hover)' }}
          >
            <div className={styles.accent} />
            <p className={styles.num}>{f.num}</p>
            <h3 className={styles.title}>{f.title}</h3>
            <p className={styles.desc}>{f.desc}</p>
            <span className={styles.tag}>{f.tag}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default Features
