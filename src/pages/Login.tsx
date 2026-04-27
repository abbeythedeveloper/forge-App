import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/auth.module.css'

const Login = () => {
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email || !password) return setError('Email and password are required.')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        setError('Incorrect email or password.')
      } else if (e.code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError('Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!email) return setError('Enter your email first.')
    try {
      await resetPassword(email)
      setResetSent(true)
      setError('')
    } catch {
      setError('Could not send reset email. Check the address.')
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
        <h1 className={styles.title}>WELCOME BACK.</h1>
        <p className={styles.sub}>The streak doesn't break itself. Let's go.</p>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
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
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button className={styles.forgotLink} onClick={handleReset} type="button">
            Forgot password?
          </button>
        </div>

        {error && <p className={styles.error}>// {error}</p>}
        {resetSent && <p className={styles.successMsg}>// Reset email sent. Check your inbox.</p>}

        <motion.button
          className={styles.btn}
          onClick={handleSubmit}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? '// Signing in...' : 'Sign in →'}
        </motion.button>

        <p className={styles.foot}>
          No account yet? <Link to="/signup">Create one</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login
