import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Warehouse, AlertTriangle, PackageX, TrendingDown, Edit2, Plus, Search } from 'lucide-react'
import api from '../utils/api'
import { Skeleton, EmptyState, StatCard, Modal } from '../components/ui/Components'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [adjustQty, setAdjustQty] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/products?limit=100'
      if (search) url += `&search=${encodeURIComponent(search)}`
      const { data } = await api.get(url)
      setProducts(data.products || [])
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300)
    return () => clearTimeout(t)
  }, [fetchProducts])

  const filtered = products.filter(p => {
    if (filter === 'outOfStock') return p.stock === 0
    if (filter === 'lowStock') return p.stock > 0 && p.stock <= p.lowStockThreshold
    if (filter === 'healthy') return p.stock > p.lowStockThreshold
    return true
  })

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    healthy: products.filter(p => p.stock > p.lowStockThreshold).length,
  }

  const handleAdjust = async () => {
    const qty = parseInt(adjustQty)
    if (isNaN(qty)) return toast.error('Enter a valid quantity')
    setAdjustLoading(true)
    try {
      await api.put(`/products/${adjustTarget._id}`, { stock: qty })
      toast.success(`Stock updated to ${qty}`)
      setAdjustTarget(null)
      setAdjustQty('')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setAdjustLoading(false)
    }
  }

  const getStockBar = (product) => {
    const maxStock = Math.max(product.stock, product.lowStockThreshold * 3, 50)
    const pct = Math.min((product.stock / maxStock) * 100, 100)
    const color = product.stock === 0 ? '#ef4444' : product.stock <= product.lowStockThreshold ? '#f59e0b' : '#10b981'
    return { pct, color }
  }

  const filterTabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'healthy', label: 'Healthy', count: stats.healthy, color: '#10b981' },
    { id: 'lowStock', label: 'Low Stock', count: stats.lowStock, color: '#f59e0b' },
    { id: 'outOfStock', label: 'Out of Stock', count: stats.outOfStock, color: '#ef4444' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total SKUs" value={stats.total} icon={Warehouse} color="#0ea5e9" delay={0} />
        <StatCard label="Healthy Stock" value={stats.healthy} icon={Warehouse} color="#10b981" delay={0.05} />
        <StatCard label="Low Stock" value={stats.lowStock} icon={TrendingDown} color="#f59e0b" delay={0.1} />
        <StatCard label="Out of Stock" value={stats.outOfStock} icon={PackageX} color="#ef4444" delay={0.15} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory…" className="input-field pl-9 h-10 w-full" />
        </div>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
          {filterTabs.map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className="px-4 h-10 text-sm font-medium transition-all flex items-center gap-1.5"
              style={{
                background: filter === tab.id ? (tab.color ? `${tab.color}14` : 'rgba(14,165,233,0.12)') : 'var(--glass-bg)',
                color: filter === tab.id ? (tab.color || '#0ea5e9') : 'var(--text-secondary)',
                borderRight: '1px solid var(--border-color)'
              }}>
              {tab.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(148,163,184,0.15)', color: 'inherit' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Out of stock banner */}
      {stats.outOfStock > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <span className="font-bold" style={{ color: '#ef4444' }}>{stats.outOfStock} product(s)</span>
            {' '}are out of stock and cannot be sold. Restock them immediately.
          </p>
        </motion.div>
      )}

      {/* Inventory grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Warehouse} title="No products" message="No products match your current filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((product, idx) => {
            const { pct, color } = getStockBar(product)
            const isOut = product.stock === 0
            const isLow = !isOut && product.stock <= product.lowStockThreshold
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-card rounded-2xl p-5 relative overflow-hidden"
                style={{ borderColor: isOut ? 'rgba(239,68,68,0.2)' : isLow ? 'rgba(245,158,11,0.2)' : 'var(--border-color)' }}
              >
                {/* Status accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>{product.barcode}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="badge-neutral text-xs">{product.category}</span>
                      <span className="text-xs font-semibold" style={{ color: '#0ea5e9' }}>{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                  <button onClick={() => { setAdjustTarget(product); setAdjustQty(product.stock.toString()) }}
                    className="p-2 rounded-xl shrink-0 transition-colors"
                    style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                    <Edit2 size={13} />
                  </button>
                </div>

                {/* Stock bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Stock Level</span>
                    <span className="text-sm font-bold" style={{ color }}>
                      {product.stock} {product.unit}
                      {isOut && <span className="ml-1 text-xs font-normal">(OUT)</span>}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-bg)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: idx * 0.03 + 0.2, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>Threshold: {product.lowStockThreshold}</span>
                    {isLow && <span style={{ color: '#f59e0b' }}>⚠ Low stock</span>}
                    {isOut && <span style={{ color: '#ef4444' }}>✗ Out of stock</span>}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Stock adjustment modal */}
      <Modal isOpen={!!adjustTarget} onClose={() => { setAdjustTarget(null); setAdjustQty('') }}
        title="Adjust Stock" size="sm">
        {adjustTarget && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{adjustTarget.name}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Current stock: <strong style={{ color: 'var(--text-primary)' }}>{adjustTarget.stock} {adjustTarget.unit}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                New Stock Quantity
              </label>
              <input
                type="number"
                value={adjustQty}
                onChange={e => setAdjustQty(e.target.value)}
                min="0"
                className="input-field text-lg font-bold text-center"
                placeholder="0"
                autoFocus
              />
            </div>

            {/* Quick adjustments */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Quick adjust</p>
              <div className="flex gap-2 flex-wrap">
                {[10, 25, 50, 100].map(qty => (
                  <button key={qty} onClick={() => setAdjustQty(qty.toString())}
                    className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-colors"
                    style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {qty}
                  </button>
                ))}
                {adjustTarget.stock > 0 && (
                  <button onClick={() => setAdjustQty((adjustTarget.stock + 50).toString())}
                    className="px-3 py-1.5 text-sm rounded-lg font-semibold"
                    style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)' }}>
                    +50
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAdjustTarget(null); setAdjustQty('') }} className="btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={handleAdjust} disabled={adjustLoading} className="btn-primary flex-1 disabled:opacity-60">
                {adjustLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Plus size={16} /> Update Stock</>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
