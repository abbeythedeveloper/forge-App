import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../layouts/AppLayout'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import styles from './Pricing.module.css'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
})

const FREE_FEATURES = [
  'Full 14-habit daily checklist',
  'Streak tracking',
  'Discipline log — lust & impulse',
  'Evening reflection',
  'Gratitude journal',
  '7 days of history',
]

const PRO_FEATURES = [
  'Everything in Free',
  'AI daily debrief — powered by Claude',
  'Trade journal + entry/exit logging',
  'AI pattern alerts — habits vs trades',
  'Full history — unlimited days',
  'Habit score graph — up to 90 days',
  'Weekly performance summary',
  'Priority support',
]

const PricingContent = ({ isLoggedIn, plan }: { isLoggedIn: boolean; plan?: string }) => (
  <div className={styles.page}>
    <motion.div className={styles.header} {...fadeUp(0)}>
      <p className={styles.label}>// Simple pricing</p>
      <h1 className={styles.title}>ONE DECISION.<br />EVERY DAY.</h1>
      <p className={styles.sub}>
        Free gets you started. Pro gets you there faster.
        No hidden fees. Cancel anytime.
      </p>
    </motion.div>

    <div className={styles.cards}>

      {/* Free */}
      <motion.div className={styles.card} {...fadeUp(0.1)}>
        <div className={styles.cardTop}>
          <p className={styles.cardLabel}>// Free</p>
          <div className={styles.price}>
            <span className={styles.priceNum}>$0</span>
            <span className={styles.pricePer}>/month</span>
          </div>
          <p className={styles.priceDesc}>Start here. No card needed.</p>
        </div>
        <ul className={styles.featureList}>
          {FREE_FEATURES.map(f => (
            <li key={f} className={styles.featureItem}>
              <span className={styles.featureIcon}>○</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className={styles.cardBottom}>
          {isLoggedIn ? (
            <div className={styles.currentPlan}>
              {plan === 'free' ? '// Your current plan' : '// Downgrade not available'}
            </div>
          ) : (
            <button className={styles.btnSecondary}
              onClick={() => window.location.href = '/signup'}>
              Get started free →
            </button>
          )}
        </div>
      </motion.div>

      {/* Pro */}
      <motion.div className={`${styles.card} ${styles.cardPro}`} {...fadeUp(0.18)}>
        <div className={styles.proTag}>Most value</div>
        <div className={styles.cardTop}>
          <p className={styles.cardLabel} style={{ color: 'var(--ember)' }}>// Pro</p>
          <div className={styles.price}>
            <span className={styles.priceNum}>$7</span>
            <span className={styles.pricePer}>/month</span>
          </div>
          <div className={styles.annualNote}>
            or $60/year — save $24
          </div>
          <div className={styles.nairaNote}>
            Nigeria: ₦7,000/mo · ₦60,000/yr
          </div>
        </div>
        <ul className={styles.featureList}>
          {PRO_FEATURES.map(f => (
            <li key={f} className={styles.featureItem}>
              <span className={styles.featureIconPro}>◈</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className={styles.cardBottom}>
          {plan === 'pro' ? (
            <div className={styles.currentPlan} style={{ color: 'var(--teal)', borderColor: 'var(--teal)' }}>
              // Your current plan
            </div>
          ) : (
            <button className={styles.btnPrimary}
              onClick={() => window.location.href = isLoggedIn ? '/upgrade' : '/signup'}>
              {isLoggedIn ? 'Upgrade to Pro →' : 'Start with Pro →'}
            </button>
          )}
        </div>
      </motion.div>

    </div>

    {/* Comparison table */}
    <motion.div className={styles.tableSection} {...fadeUp(0.26)}>
      <p className={styles.tableLabel}>// Full comparison</p>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.tableFeatureCol} />
          <div className={styles.tableCol}>Free</div>
          <div className={`${styles.tableCol} ${styles.tableColPro}`}>Pro</div>
        </div>
        {[
          ['Habit checklist (14 habits)', true, true],
          ['Streak tracking', true, true],
          ['Discipline log', true, true],
          ['Gratitude journal', true, true],
          ['Evening reflection', true, true],
          ['Habit history', '7 days', 'Unlimited'],
          ['Habit score graph', false, 'Up to 90 days'],
          ['AI daily debrief', false, true],
          ['Trade journal', false, true],
          ['AI pattern alerts', false, true],
          ['Weekly summary', false, true],
        ].map(([feature, free, pro]) => (
          <div key={String(feature)} className={styles.tableRow}>
            <div className={styles.tableFeatureCol}>{feature}</div>
            <div className={styles.tableCol}>
              {free === true ? <span className={styles.checkYes}>✓</span> :
               free === false ? <span className={styles.checkNo}>—</span> :
               <span className={styles.checkText}>{free}</span>}
            </div>
            <div className={`${styles.tableCol} ${styles.tableColPro}`}>
              {pro === true ? <span className={styles.checkYes} style={{ color: 'var(--ember)' }}>✓</span> :
               pro === false ? <span className={styles.checkNo}>—</span> :
               <span className={styles.checkText} style={{ color: 'var(--ember)' }}>{pro}</span>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* FAQ */}
    <motion.div className={styles.faq} {...fadeUp(0.32)}>
      <p className={styles.tableLabel}>// Common questions</p>
      {[
        ['Can I cancel anytime?', 'Yes. Cancel from your profile page and you keep Pro access until the end of your billing period.'],
        ['What payment methods are accepted?', 'International users pay via Stripe — all major cards accepted. Nigerian users are prompted to pay via Paystack in naira.'],
        ['Is there a free trial for Pro?', 'No trial — but the free tier is genuinely useful. Try it first, upgrade when you\'re ready.'],
        ['What happens to my data if I cancel?', 'Everything stays. Your habit history, discipline logs, and trade journal are yours. You just lose access to Pro features.'],
      ].map(([q, a]) => (
        <div key={String(q)} className={styles.faqItem}>
          <p className={styles.faqQ}>{q}</p>
          <p className={styles.faqA}>{a}</p>
        </div>
      ))}
    </motion.div>

  </div>
)

const Pricing = () => {
  const { user, profile } = useAuth()

  // If logged in — wrap in AppLayout
  if (user) {
    return (
      <AppLayout>
        <PricingContent isLoggedIn={true} plan={profile?.plan} />
      </AppLayout>
    )
  }

  // If not logged in — wrap in landing page nav
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>
        <PricingContent isLoggedIn={false} />
      </div>
      <Footer />
    </>
  )
}

export default Pricing
