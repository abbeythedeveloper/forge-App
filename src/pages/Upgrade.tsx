import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useRegion } from '../hooks/useRegion'
import AppLayout from '../layouts/AppLayout'
import styles from './Upgrade.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
})

type BillingPeriod = 'monthly' | 'yearly'

const Upgrade = () => {
  const { user, profile, updateProfile } = useAuth()
  const region = useRegion()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'

  const [billing, setBilling] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle success redirect — poll for plan update
  useEffect(() => {
    if (!isSuccess || !user) return
    const poll = setInterval(async () => {
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('../lib/firebase')
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists() && snap.data().plan === 'pro') {
        clearInterval(poll)
        await updateProfile({ plan: 'pro' })
        navigate('/dashboard')
      }
    }, 2000)
    // Stop polling after 30s
    setTimeout(() => clearInterval(poll), 30000)
    return () => clearInterval(poll)
  }, [isSuccess, user])

  const handleUpgrade = async () => {
    if (!user || !profile) return
    setLoading(true)
    setError('')

    try {
      if (region.isAfrica) {
        // Paystack
        const res = await fetch('/api/paystack-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billing,
            email: profile.email,
            userId: user.uid,
          }),
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
        else setError('Could not initiate payment. Try again.')
      } else {
        // Polar
        const res = await fetch('/api/polar-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billing,
            email: profile.email,
            userId: user.uid,
          }),
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
        else setError('Could not initiate payment. Try again.')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Already pro
  if (profile?.plan === 'pro') {
    return (
      <AppLayout>
        <div className={styles.page}>
          <motion.div className={styles.alreadyPro} {...fadeUp(0)}>
            <p className={styles.label}>// You are on Pro</p>
            <h1 className={styles.title}>YOU'RE ALL SET.</h1>
            <p className={styles.sub}>Full access is active. Go use it.</p>
            <button className={styles.btnPrimary} onClick={() => navigate('/dashboard')}>
              Back to dashboard →
            </button>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  // Payment success — waiting for webhook
  if (isSuccess) {
    return (
      <AppLayout>
        <div className={styles.page}>
          <motion.div className={styles.successState} {...fadeUp(0)}>
            <p className={styles.label}>// Payment received</p>
            <h1 className={styles.title}>ACTIVATING PRO.</h1>
            <p className={styles.sub}>
              Payment confirmed. Activating your Pro access now — this takes a few seconds.
            </p>
            <div className={styles.spinner} />
            <p className={styles.spinnerNote}>// Syncing with server...</p>
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={styles.page}>

        <motion.div className={styles.header} {...fadeUp(0)}>
          <p className={styles.label}>// Upgrade to Pro</p>
          <h1 className={styles.title}>UNLOCK THE<br />FULL SMELTR.</h1>
          <p className={styles.sub}>
            AI coach, trade journal, full history, pattern alerts.
            Everything you need to go further faster.
          </p>
        </motion.div>

        {/* Region indicator */}
        <motion.div className={styles.regionBadge} {...fadeUp(0.08)}>
          {region.loading ? (
            <span className={styles.regionLoading}>// Detecting your region...</span>
          ) : (
            <span>
              {region.isAfrica ? '🌍' : '🌐'} Paying from <strong>{region.country}</strong>
              {' — '}
              {region.isAfrica ? 'Paystack (₦ NGN)' : 'Polar ($ USD)'}
            </span>
          )}
        </motion.div>

        {/* Billing toggle */}
        <motion.div className={styles.billingToggle} {...fadeUp(0.12)}>
          <button
            className={`${styles.billingBtn} ${billing === 'monthly' ? styles.billingActive : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.billingBtn} ${billing === 'yearly' ? styles.billingActive : ''}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly
            <span className={styles.saveBadge}>Save $24</span>
          </button>
        </motion.div>

        {/* Price card */}
        <motion.div className={styles.priceCard} {...fadeUp(0.16)}>
          <div className={styles.priceTop}>
            <p className={styles.planName}>SMELTR Pro</p>
            <div className={styles.priceDisplay}>
              {region.isAfrica ? (
                <>
                  <span className={styles.priceNum}>
                    {billing === 'monthly' ? '₦7,000' : '₦60,000'}
                  </span>
                  <span className={styles.pricePer}>
                    /{billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </>
              ) : (
                <>
                  <span className={styles.priceNum}>
                    {billing === 'monthly' ? '$7' : '$60'}
                  </span>
                  <span className={styles.pricePer}>
                    /{billing === 'monthly' ? 'month' : 'year'}
                  </span>
                </>
              )}
            </div>
            {billing === 'yearly' && (
              <p className={styles.yearlyNote}>
                {region.isAfrica ? 'Save ₦24,000 vs monthly' : 'Save $24 vs monthly'}
              </p>
            )}
          </div>

          <ul className={styles.featureList}>
            {[
              'AI daily debrief — powered by Claude',
              'Trade journal + pattern alerts',
              'Unlimited habit history',
              'Habit score graph — up to 90 days',
              'Weekly performance summary',
            ].map(f => (
              <li key={f} className={styles.featureItem}>
                <span className={styles.featureIcon}>◈</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {error && <p className={styles.error}>// {error}</p>}

          <motion.button
            className={styles.btnPrimary}
            onClick={handleUpgrade}
            disabled={loading || region.loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading
              ? '// Redirecting to payment...'
              : region.isAfrica
              ? `Pay with Paystack →`
              : `Pay with Polar →`
            }
          </motion.button>

          <p className={styles.guarantee}>
            Cancel anytime from your profile. No questions asked.
          </p>
        </motion.div>

      </div>
    </AppLayout>
  )
}

export default Upgrade
