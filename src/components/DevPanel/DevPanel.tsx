import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { setDevRegionOverride, getDevRegionOverride } from '../../hooks/useRegion'
import styles from './DevPanel.module.css'

const DevPanel = () => {
  const [open, setOpen] = useState(false)
  const [override, setOverride] = useState<'africa' | 'international' | null>(null)

  useEffect(() => {
    setOverride(getDevRegionOverride())
  }, [])

  const handleSet = (val: 'africa' | 'international' | null) => {
    setDevRegionOverride(val)
    setOverride(val)
  }

  return (
    <div className={styles.wrap}>
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.panelHeader}>
              <p className={styles.panelTitle}>// Dev — Region override</p>
              <span className={styles.warning}>⚠ Remove before launch</span>
            </div>
            <p className={styles.panelSub}>
              Simulate different regions to test Polar vs Paystack routing.
            </p>
            <div className={styles.btnGroup}>
              <button
                className={`${styles.btn} ${override === null ? styles.btnActive : ''}`}
                onClick={() => handleSet(null)}
              >
                Auto detect
              </button>
              <button
                className={`${styles.btn} ${override === 'africa' ? styles.btnActiveAfrica : ''}`}
                onClick={() => handleSet('africa')}
              >
                🌍 Africa (Paystack)
              </button>
              <button
                className={`${styles.btn} ${override === 'international' ? styles.btnActiveIntl : ''}`}
                onClick={() => handleSet('international')}
              >
                🌐 International (Polar)
              </button>
            </div>
            <div className={styles.currentStatus}>
              <span className={styles.statusLabel}>Current:</span>
              <span className={styles.statusVal}>
                {override === null ? 'Auto' : override === 'africa' ? '🌍 Africa' : '🌐 International'}
              </span>
            </div>
            <p className={styles.reminder}>
              ⚠️ Remember to remove {'<DevPanel />'} from App.tsx before going live.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className={`${styles.toggle} ${override !== null ? styles.toggleActive : ''}`}
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.95 }}
        title="Dev: Region override"
      >
        {override !== null ? '⚡ DEV' : '⚙ DEV'}
      </motion.button>
    </div>
  )
}

export default DevPanel
