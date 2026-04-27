import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '12px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ember)',
        }}>
          // Loading...
        </p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user && profile && !profile.onboarded) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

export default ProtectedRoute
