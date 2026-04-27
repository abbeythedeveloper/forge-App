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
      <a href="#waitlist" className={styles.cta}>
        Early access
      </a>
    </motion.nav>
  )
}

export default Navbar
