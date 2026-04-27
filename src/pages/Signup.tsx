import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/auth.module.css'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email || !password || !confirm) return setError('All fields are required.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await signup(email, password)
      navigate('/onboarding')
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') setError('An account with this email already exists.')
      else if (e.code === 'auth/invalid-email') setError('Invalid email address.')
      else setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.grid} />
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className={styles.logo}>SM<span>E</span>LTR</Link>
        <h1 className={styles.title}>START FORGING.</h1>
        <p className={styles.sub}>Create your account. No fluff — just results.</p>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={`${styles.input} ${error && !email ? styles.inputError : ''}`}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Confirm password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <p className={styles.error}>// {error}</p>}

        <motion.button
          className={styles.btn}
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? '// Creating account...' : 'Create account →'}
        </motion.button>

        <p className={styles.foot}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
