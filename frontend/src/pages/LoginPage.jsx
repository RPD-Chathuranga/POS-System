import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Lock, Mail, ArrowRight, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    console.log('login submit fired')
    e.preventDefault()
    setLoading(true)

    try {
      const res = await login(form.email, form.password)

      if (res?.success === false) {
        toast.error(res.message || 'Login failed')
      } else {
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast('Password reset is not yet available. Please contact your admin.', {
      icon: '🔒',
      duration: 4000,
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid rgba(148,163,184,0.25)'
      }
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-3 sm:px-4 lg:px-6 py-4 sm:py-8 overflow-x-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-6xl rounded-[24px] sm:rounded-[28px] overflow-hidden border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-[1.05fr_1.45fr]"
        style={{ background: 'var(--bg-secondary)' }}
      >
        {/* Left panel */}
        <div
          className="relative flex flex-col justify-between px-5 sm:px-8 lg:pl-16 lg:pr-10 py-8 sm:py-10 lg:py-12 min-h-[320px] lg:min-h-[700px]"
          style={{
            background: 'linear-gradient(180deg, #16213b 0%, #1a2746 100%)',
          }}
        >
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  boxShadow: '0 10px 30px rgba(14,165,233,0.28)',
                }}
              >
                <Zap size={20} className="text-white" />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white leading-tight">
                  PlantWeb Solutions
                </h1>
                <p
                  className="text-xs sm:text-sm"
                  style={{ color: 'rgba(255,255,255,0.68)' }}
                >
                  Point of Sale
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggle}
              className="flex items-center justify-center rounded-2xl p-2.5 sm:p-3 transition-all shrink-0"
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.18)'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex flex-col items-start max-w-md mt-8 lg:mt-0">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-[24px] sm:rounded-[28px] flex items-center justify-center mb-6 sm:mb-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Zap size={36} className="text-cyan-400 sm:w-10 sm:h-10 lg:w-11 lg:h-11" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-[48px] leading-tight font-semibold text-white">
              Point of Sale
            </h2>

            <p
              className="mt-4 sm:mt-6 max-w-sm text-sm sm:text-base leading-6 sm:leading-7"
              style={{ color: 'rgba(255,255,255,0.72)' }}
            >
              Manage billing, products, and store operations with one clean dashboard.
            </p>
          </div>

          <div className="hidden lg:block">
            <div
              className="rounded-2xl px-4 py-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-sm text-white/90">Secure staff access</p>
              <p
                className="text-sm mt-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Built for fast retail workflows and controlled access.
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div
          className="relative flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-16"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 right-0 w-[180px] h-[140px] sm:w-[220px] sm:h-[180px] lg:w-[280px] lg:h-[240px] rounded-bl-[60px] sm:rounded-bl-[75px] lg:rounded-bl-[90px] opacity-25"
              style={{ background: 'var(--blob-color1)' }}
            />
            <div
              className="absolute bottom-0 left-0 w-[220px] h-[110px] sm:w-[280px] sm:h-[130px] lg:w-[340px] lg:h-[170px] rounded-tr-[60px] sm:rounded-tr-[75px] lg:rounded-tr-[90px] opacity-25"
              style={{ background: 'var(--blob-color2)' }}
            />
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[12%] right-[18%] w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full blur-3xl opacity-10"
              style={{ background: 'var(--blob-color3)' }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative z-10 w-full max-w-md"
          >
            <p
              className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase mb-3"
              style={{ color: '#2563eb' }}
            >
              PlantWeb Solutions
            </p>

            <h3
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight mb-6 sm:mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              Sign in
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email address"
                    className="input-field w-full h-12 sm:h-14 rounded-2xl pl-12 pr-4"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Password"
                    className="input-field w-full h-12 sm:h-14 rounded-2xl pl-12 pr-12"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="btn-ghost text-sm rounded-xl px-4 py-3 w-full sm:w-auto"
                  style={{
                    color: 'var(--accent)',
                    background: 'rgba(239,246,255,0.9)',
                    borderColor: 'rgba(191,219,254,0.85)'
                  }}
                >
                  Forgot your password?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className="btn-primary w-full h-12 sm:h-14 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>
            </form>

            <p
              className="text-xs mt-6 sm:mt-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              © {new Date().getFullYear()} PlantWeb Solutions. All rights reserved.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}