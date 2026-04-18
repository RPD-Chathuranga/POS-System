import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

// ── Spinner ──────────────────────────────────────────────
export const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} style={{ color: 'var(--accent)' }} />
)

// ── Modal ─────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className={`relative w-full ${sizes[size]} glass-card rounded-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col`}
            style={{ background: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
              <button onClick={onClose}
                className="p-2 rounded-xl transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── Confirm Dialog ────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="space-y-5">
      <div className="flex gap-3 p-4 rounded-xl" style={{ background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(14,165,233,0.08)' }}>
        <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: danger ? '#ef4444' : '#0ea5e9' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
        <button onClick={() => { onConfirm(); onClose() }}
          className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}>
          Confirm
        </button>
      </div>
    </div>
  </Modal>
)

// ── Empty State ───────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.15)' }}>
      <Icon size={28} style={{ color: '#0ea5e9' }} />
    </div>
    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
    <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    {action}
  </div>
)

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = '#0ea5e9', trend, trendLabel, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="stat-card"
  >
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5"
      style={{ background: color, transform: 'translate(30%, -30%)' }} />
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
        <Icon size={21} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={trend >= 0 ? 'badge-success' : 'badge-danger'}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-display font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
    {trendLabel && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{trendLabel}</p>}
  </motion.div>
)

// ── Badge ─────────────────────────────────────────────────
export const Badge = ({ children, variant = 'neutral' }) => (
  <span className={`badge-${variant}`}>{children}</span>
)

// ── Loading Skeleton ──────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`}
    style={{ background: 'var(--glass-bg)' }} />
)

// ── Alert ─────────────────────────────────────────────────
export const Alert = ({ type = 'info', title, message }) => {
  const config = {
    info: { color: '#0ea5e9', Icon: Info, bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.2)' },
    success: { color: '#10b981', Icon: CheckCircle2, bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    warning: { color: '#f59e0b', Icon: AlertTriangle, bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    danger: { color: '#ef4444', Icon: AlertTriangle, bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  }[type]

  return (
    <div className="flex gap-3 p-4 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
      <config.Icon size={18} className="shrink-0 mt-0.5" style={{ color: config.color }} />
      <div>
        {title && <p className="text-sm font-semibold mb-0.5" style={{ color: config.color }}>{title}</p>}
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      </div>
    </div>
  )
}
