import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Battle.module.css'

const battles = [
  {
    icon: 'L',
    title: 'Lust & temptation',
    desc: "It drains your energy, your focus, and your sense of self. Smeltr tracks it daily, surfaces your triggers, and holds you accountable to the streak.",
  },
  {
    icon: 'I',
    title: 'Impulsiveness',
    desc: "Reactive decisions cost you money, relationships and respect. The pause habit — built into every day — trains the muscle that separates you from your worst self.",
  },
  {
    icon: 'B',
    title: 'Broke thinking',
    desc: "It's not about your salary. It's about your relationship with money. Smeltr builds daily habits that compound into wealth — starting with not spending what you don't have.",
  },
  {
    icon: 'C',
    title: 'Comfort',
    desc: "The snooze. The scroll. The 'I'll start Monday.' Smeltr starts today. Every morning alarm is a choice point. Every check is a vote for the person you're becoming.",
  },
]

const Battle = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className={styles.battle}>
      <div className={styles.inner} ref={ref}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          // What you're actually fighting
        </motion.p>
        <motion.h2
          className={styles.headline}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          THE REAL ENEMIES<br />ARE INTERNAL.
        </motion.h2>
        <ul className={styles.list}>
          {battles.map((b, i) => (
            <motion.li
              key={b.icon}
              className={styles.item}
              initial={{ opacity: 0, x: -24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}
            >
              <div className={styles.icon}>{b.icon}</div>
              <div>
                <p className={styles.itemTitle}>{b.title}</p>
                <p className={styles.itemDesc}>{b.desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Battle
