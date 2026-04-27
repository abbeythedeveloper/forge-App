import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import styles from './Hero.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

const stats = [
  { num: '14+', label: 'daily habits tracked' },
  { num: '1×', label: 'AI coach. daily. personal.' },
  { num: "Q4'26", label: 'launch target' },
]

const Hero = () => {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0)
  const heroRef = useRef<HTMLElement>(null)
  const glowX = useTransform(mouseX, v => `${v}px`)
  const glowY = useTransform(mouseY, v => `${v}px`)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section className={styles.hero} ref={heroRef}>
      <div className={styles.heroBg} />
      <div className={styles.heroGrid} />
      <div className={styles.scanlines} />
      <motion.div className={styles.cursorGlow} style={{ left: glowX, top: glowY }} />

      <motion.p className={styles.tag} variants={fadeUp} custom={0.2} initial="hidden" animate="show">
        // The accountability OS for young men
      </motion.p>

      <motion.h1 className={styles.headline} variants={fadeUp} custom={0.4} initial="hidden" animate="show">
        BECOME<br />
        WHO YOU'RE<br />
        <span className={styles.accent}>SUPPOSED TO.</span>
      </motion.h1>

      <motion.p className={styles.sub} variants={fadeUp} custom={0.6} initial="hidden" animate="show">
        Smeltr is not a habit tracker. It's a <strong>daily reckoning</strong> — built for young men
        fighting lust, impulsiveness, broke thinking, and everything else standing between them
        and the person they're supposed to be.
      </motion.p>

      <motion.div className={styles.actions} variants={fadeUp} custom={0.8} initial="hidden" animate="show">
        <a href="#waitlist">
          <motion.button className={styles.btnPrimary} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            Join the waitlist
          </motion.button>
        </a>
        <button
          className={styles.btnGhost}
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          See how it works →
        </button>
      </motion.div>

      <motion.div className={styles.statRow} variants={fadeUp} custom={1.0} initial="hidden" animate="show">
        {stats.map(s => (
          <div className={styles.stat} key={s.label}>
            <div className={styles.statNum}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      <div className={styles.edgeBar} />
    </section>
  )
}

export default Hero
