import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Warehouse, LogOut, ChevronRight, Zap, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'cashier'] },
  { to: '/pos', icon: ShoppingCart, label: 'Point of Sale', badge: true, roles: ['admin', 'cashier'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['admin'] },
  { to: '/sales', icon: BarChart3, label: 'Sales History', roles: ['admin'] },
  { to: '/inventory', icon: Warehouse, label: 'Inventory', roles: ['admin'] },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-64 z-30 lg:translate-x-0 lg:static lg:z-auto flex flex-col"
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 12px rgba(14,165,233,0.4)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>PlanWeb Solutions</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Retail System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNavItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && itemCount > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: '#0ea5e9' }}>
                      {itemCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-3 pb-4 space-y-2 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs capitalize truncate" style={{ color: 'var(--text-secondary)' }}>{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
