import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import SmeltrCanvas from '../SmeltrCanvas/SmeltrCanvas'
import styles from './Waitlist.module.css'

const Waitlist = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const handleSubmit = () => {
    if (!email || !email.includes('@')) {
      setError(true)
      setTimeout(() => setError(false), 1500)
      return
    }
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section className={styles.waitlist} id="waitlist" ref={ref}>
      <SmeltrCanvas />
      <div className={styles.scanlines} />
      <div className={styles.inner}>
        <motion.p
          className={styles.label}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          // Q4 2026 launch
        </motion.p>

        <motion.h2
          className={styles.headline}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          READY TO<br />START THE FORGE?
        </motion.h2>

        <motion.p
          className={styles.sub}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Join the waitlist. Be first in when we launch. No spam — just one email when the doors open.
        </motion.p>

        <motion.div
          className={styles.form}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          {!submitted ? (
            <>
              <input
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <motion.button
                className={styles.btn}
                onClick={handleSubmit}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Join waitlist
              </motion.button>
            </>
          ) : (
            <motion.p
              className={styles.success}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              You're on the list. The hammer drops Q4.
            </motion.p>
          )}
        </motion.div>

        <motion.p
          className={styles.note}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          // No spam. One email at launch. That's it.
        </motion.p>
      </div>
    </section>
  )
}

export default Waitlist
