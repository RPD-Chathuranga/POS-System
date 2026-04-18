import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, ShoppingBag, TrendingUp, AlertTriangle,
  Package, Clock, CreditCard, Banknote, ArrowUpRight, Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import api from '../utils/api'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import { StatCard, Skeleton, Alert } from '../components/ui/Components'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl p-3 text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [paymentData, setPaymentData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/sales/analytics?period=7')
        ])
        setStats(statsRes.data.stats)

        const { salesByDay, paymentBreakdown, topProducts: tp } = analyticsRes.data

        const chart = salesByDay.map(d => ({
          day: `${d._id.month}/${d._id.day}`,
          revenue: parseFloat(d.revenue.toFixed(2)),
          transactions: d.transactions
        }))
        setChartData(chart)

        const pay = paymentBreakdown.map(p => ({
          name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
          value: p.count,
          revenue: p.total
        }))
        setPaymentData(pay)
        setTopProducts(tp)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  if (error) return (
    <div className="p-6"><Alert type="danger" title="Error" message={error} /></div>
  )

  const paymentMethodIcon = { cash: Banknote, card: CreditCard }

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Stat cards - Different for cashier vs admin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue" value={formatCurrency(stats?.today?.revenue)}
          icon={DollarSign} color="#0ea5e9"
          trend={stats?.today?.revenueChange}
          trendLabel="vs yesterday"
          delay={0}
        />
        <StatCard
          label="Transactions Today" value={stats?.today?.transactions || 0}
          icon={ShoppingBag} color="#10b981" delay={0.05}
        />
        {isAdmin ? (
          <>
            <StatCard
              label="Monthly Revenue" value={formatCurrency(stats?.month?.revenue)}
              icon={TrendingUp} color="#f59e0b" delay={0.1}
            />
            <StatCard
              label="Low Stock Items" value={stats?.inventory?.lowStockCount || 0}
              icon={AlertTriangle} color="#ef4444" delay={0.15}
              trendLabel={`${stats?.inventory?.outOfStock || 0} out of stock`}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Items in Cart" value={0}
              icon={Package} color="#f59e0b" delay={0.1}
            />
            <StatCard
              label="Quick Actions" value="POS Ready"
              icon={Zap} color="#8b5cf6" delay={0.15}
            />
          </>
        )}
      </div>

      {/* Cashier quick actions */}
      {!isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/pos"
              className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white' }}
            >
              <ShoppingBag size={24} />
              <div>
                <p className="font-semibold">Start Selling</p>
                <p className="text-sm opacity-90">Open POS Terminal</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
              <Clock size={24} style={{ color: 'var(--text-secondary)' }} />
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Current Shift</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active session</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts row - Admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 lg:col-span-2"
        >
          <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
            7-Day Revenue
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
            Payment Methods
          </h3>
          {paymentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="value" stroke="none">
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [v + ' transactions', p.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {paymentData.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>No data</p>
          )}
        </motion.div>
      </div>
      )}

      {/* Bottom row - Admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="font-display font-bold text-base mb-4" style={{ color: 'var(--text-primary)' }}>
            Top Products (7 Days)
          </h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold w-5 text-center" style={{ color: 'var(--text-secondary)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.totalQuantity} units sold</p>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#0ea5e9' }}>
                  {formatCurrency(p.totalRevenue)}
                </span>
              </div>
            )) : (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No sales data yet</p>
            )}
          </div>
        </motion.div>

        {/* Recent sales + low stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          {/* Low stock alert */}
          {stats?.inventory?.lowStockItems?.length > 0 && (
            <div className="glass-card rounded-2xl p-5" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                <h3 className="font-display font-bold text-sm" style={{ color: '#f59e0b' }}>Low Stock Alert</h3>
              </div>
              <div className="space-y-2">
                {stats.inventory.lowStockItems.map(item => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <span className={`badge-${item.stock === 0 ? 'danger' : 'warning'}`}>
                      {item.stock === 0 ? 'Out of stock' : `${item.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent transactions */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-3" style={{ color: 'var(--text-primary)' }}>
              Recent Transactions
            </h3>
            <div className="space-y-2">
              {stats?.recentSales?.length > 0 ? stats.recentSales.map(sale => (
                <div key={sale._id} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: 'var(--glass-bg)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(14,165,233,0.1)' }}>
                    {sale.paymentMethod === 'card'
                      ? <CreditCard size={14} style={{ color: '#0ea5e9' }} />
                      : <Banknote size={14} style={{ color: '#0ea5e9' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {sale.receiptNumber}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {sale.items?.length} items · {formatDateTime(sale.createdAt).split(',')[1]}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No recent sales</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  )
}
