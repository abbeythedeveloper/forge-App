import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Manifesto from './components/Manifesto/Manifesto'
import Features from './components/Features/Features'
import Countdown from './components/Countdown/Countdown'
import Battle from './components/Battle/Battle'
import Trading from './components/Trading/Trading'
import Waitlist from './components/Waitlist/Waitlist'
import Footer from './components/Footer/Footer'

import Signup from './pages/Signup'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import Discipline from './pages/Discipline'
import Coach from './pages/Coach'
import Trades from './pages/Trades'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Upgrade from './pages/Upgrade'
import Legal from './pages/Legal'

// ⚠️ DEV ONLY — remove before launch
import DevPanel from './components/DevPanel/DevPanel'

import './styles/global.css'

const LandingPage = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Manifesto />
      <Features />
      <Countdown />
      <Battle />
      <Trading />
      <Waitlist />
    </main>
    <Footer />
  </>
)

const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
)

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard"  element={<Protected><Dashboard /></Protected>} />
            <Route path="/habits"     element={<Protected><Habits /></Protected>} />
            <Route path="/discipline" element={<Protected><Discipline /></Protected>} />
            <Route path="/coach"      element={<Protected><Coach /></Protected>} />
            <Route path="/trades"     element={<Protected><Trades /></Protected>} />
            <Route path="/profile"    element={<Protected><Profile /></Protected>} />
            <Route path="/upgrade"    element={<Protected><Upgrade /></Protected>} />
            <Route path="/legal/:type" element={<Legal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* ⚠️ DEV ONLY — remove this line before launch */}
          <DevPanel />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
