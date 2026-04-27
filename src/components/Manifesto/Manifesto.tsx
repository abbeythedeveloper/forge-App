import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import styles from './Manifesto.module.css'

const Manifesto = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className={styles.manifesto}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className={styles.label}>// The truth</p>
        <p className={styles.text}>
          <span className={styles.dim}>You already know </span>
          WHAT YOU NEED TO DO.{' '}
          <span className={styles.dim}>The problem is </span>
          YOU KEEP{' '}
          <span className={styles.ember}>CHOOSING</span>{' '}
          <span className={styles.dim}>not to. </span>
          SMELTR{' '}
          <span className={styles.dim}>closes that gap. </span>
          EVERY. SINGLE. DAY.
        </p>
      </motion.div>
    </section>
  )
}

export default Manifesto
