import { motion } from 'framer-motion'
import styles from './Navbar.module.css'

const Navbar = () => {
  return (
    <motion.nav
      className={styles.nav}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.logo}>
       SM<span>E</span>LTR
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
  <a href="/pricing" className={styles.pricingLink}>
    Pricing
  </a>
  <a href="#waitlist" className={styles.cta}>
    Early access
  </a>
</div>
    </motion.nav>
  )
}

export default Navbar
