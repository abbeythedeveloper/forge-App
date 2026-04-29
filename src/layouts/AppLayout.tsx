import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import styles from './AppLayout.module.css'

const NAV = [
  { to: '/dashboard', label: 'Home',       icon: '⌂' },
  { to: '/habits',    label: 'Habits',     icon: '✓' },
  { to: '/discipline',label: 'Discipline', icon: '⚔' },
  { to: '/coach',     label: 'AI Coach',   icon: '◈' },
  { to: '/trades',    label: 'Trades',     icon: '◎' },
  { to: '/profile',   label: 'Profile',    icon: '○' },
]

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <motion.aside
        className={styles.sidebar}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.sideTop}>
          <div className={styles.logo} onClick={() => navigate('/dashboard')}>
            SM<span>E</span>LTR
          </div>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className={styles.userName}>{profile?.name || 'Smeltr User'}</div>
              <div className={styles.userPlan}>{profile?.plan === 'pro' ? 'Pro' : 'Free'}</div>
            </div>
          </div>
          <nav className={styles.nav}>
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navActive : ''}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className={styles.sideBottom}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            <span>{theme === 'dark' ? '◑' : '◐'}</span>
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </motion.aside>

      {/* Mobile top bar */}
      <div className={styles.mobileBar}>
        <div className={styles.logo} style={{ fontSize: '20px' }}>
          SM<span>E</span>LTR
        </div>
        <div className={styles.mobileNav}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ''}`
              }
            >
              {item.icon}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className={styles.main}>
        <motion.div
          key={window.location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={styles.content}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}

export default AppLayout
