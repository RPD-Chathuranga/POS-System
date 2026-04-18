import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview & analytics' },
  '/pos': { title: 'Point of Sale', sub: 'Scan & checkout' },
  '/products': { title: 'Products', sub: 'Manage inventory items' },
  '/sales': { title: 'Sales History', sub: 'Transaction records' },
  '/inventory': { title: 'Inventory', sub: 'Stock management' },
}

export default function Header({ onMenuClick }) {
  const { isDark, toggle } = useTheme()
  const location = useLocation()
  const [time, setTime] = useState(new Date())
  const page = pageTitles[location.pathname] || { title: 'PlanWeb Solutions', sub: '' }

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)' }}>
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>{page.title}</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{page.sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live clock */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{timeStr}</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{dateStr}</span>
        </div>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="p-2.5 rounded-xl transition-colors"
          style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </motion.button>
      </div>
    </header>
  )
}
