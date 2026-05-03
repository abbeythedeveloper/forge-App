import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import styles from './Footer.module.css'

const Footer = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>
        SM<span>E</span>LTR
      </div>

      <div className={styles.center}>
        <button
          className={styles.toggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <motion.div
            className={styles.toggleTrack}
            animate={{ backgroundColor: theme === 'dark' ? '#1E1E18' : '#EDEAE0' }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={styles.toggleThumb}
              animate={{ x: theme === 'dark' ? 2 : 22 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.div>
          <span className={styles.toggleLabel}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      <div className={styles.right}>
        <div className={styles.legalLinks}>
          <Link to="/legal/privacy" className={styles.legalLink}>Privacy</Link>
          <span className={styles.legalDot}>·</span>
          <Link to="/legal/terms" className={styles.legalLink}>Terms</Link>
        </div>
        <p className={styles.copy}>// Built for those who are serious. © 2026</p>
      </div>
    </footer>
  )
}

export default Footer
