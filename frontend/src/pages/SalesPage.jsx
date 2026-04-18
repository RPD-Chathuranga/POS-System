import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Receipt, CreditCard, Banknote, Smartphone, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../utils/api'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import { Skeleton, EmptyState, Modal } from '../components/ui/Components'
import toast from 'react-hot-toast'

const paymentIcon = { cash: Banknote, card: CreditCard, mobile: Smartphone }
const paymentColor = { cash: '#10b981', card: '#0ea5e9', mobile: '#8b5cf6' }

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [filters, setFilters] = useState({ startDate: '', endDate: '', paymentMethod: '' })
  const currentPage = pagination.page

  const fetchSales = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      let url = `/sales?page=${page}&limit=20`
      if (filters.startDate) url += `&startDate=${filters.startDate}`
      if (filters.endDate) url += `&endDate=${filters.endDate}`
      if (filters.paymentMethod) url += `&paymentMethod=${filters.paymentMethod}`
      const { data } = await api.get(url)
      setSales(data.sales || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error('Failed to load sales')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchSales(1) }, [filters])

  const setFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Filters */}
      <div className="glass-card rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
        <div className="grid gap-3 lg:grid-cols-[repeat(5,minmax(210px,1fr))] lg:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>
              Start date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilter('startDate', e.target.value)}
              className="input-field h-12 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>
              End date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilter('endDate', e.target.value)}
              className="input-field h-12 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>
              Payment method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={e => setFilter('paymentMethod', e.target.value)}
              className="input-field h-12 w-full"
            >
              <option value="">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>

          <div className="flex items-center mt-auto">
            {(filters.startDate || filters.endDate || filters.paymentMethod) && (
              <button onClick={() => setFilters({ startDate: '', endDate: '', paymentMethod: '' })}
                className="btn-ghost h-12 px-5 text-sm w-full">
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between lg:justify-end text-sm text-secondary">
            <div>
              <p className="text-xs uppercase font-semibold" style={{ color: 'var(--text-secondary)' }}>Transactions</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{pagination.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : sales.length === 0 ? (
        <EmptyState icon={Receipt} title="No sales found" message="No transactions match your filters." />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--glass-bg)' }}>
            <div className="col-span-3">Receipt #</div>
            <div className="col-span-3">Date & Time</div>
            <div className="col-span-1 text-center">Items</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-right">View</div>
          </div>

          {sales.map((sale, idx) => {
            const Icon = paymentIcon[sale.paymentMethod] || Banknote
            const color = paymentColor[sale.paymentMethod] || '#10b981'
            return (
              <motion.div
                key={sale._id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 px-5 py-4 border-b items-center transition-colors hover:bg-white/2"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {sale.receiptNumber}
                  </p>
                  <p className="text-xs md:hidden mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {formatDateTime(sale.createdAt)}
                  </p>
                </div>
                <div className="hidden md:block md:col-span-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {formatDateTime(sale.createdAt)}
                </div>
                <div className="hidden md:flex md:col-span-1 justify-center">
                  <span className="badge-info">{sale.items?.length}</span>
                </div>
                <div className="hidden md:flex md:col-span-2 items-center gap-2">
                  <Icon size={14} style={{ color }} />
                  <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {sale.paymentMethod}
                  </span>
                </div>
                <div className="md:hidden flex items-center gap-2">
                  <Icon size={13} style={{ color }} />
                  <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{sale.paymentMethod}</span>
                  <span className="badge-info ml-1">{sale.items?.length} items</span>
                </div>
                <div className="md:col-span-2 text-right">
                  <p className="text-sm font-bold" style={{ color: '#10b981' }}>{formatCurrency(sale.total)}</p>
                </div>
                <div className="hidden md:flex md:col-span-1 justify-end">
                  <button onClick={() => setSelectedSale(sale)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                    <Eye size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchSales(currentPage - 1)} disabled={currentPage <= 1} className="btn-ghost h-9 w-9 p-0 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Page {currentPage} of {pagination.pages}
          </span>
          <button onClick={() => fetchSales(currentPage + 1)} disabled={currentPage >= pagination.pages} className="btn-ghost h-9 w-9 p-0 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Sale detail modal */}
      <Modal isOpen={!!selectedSale} onClose={() => setSelectedSale(null)} title="Sale Details" size="md">
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Receipt #', value: selectedSale.receiptNumber },
                { label: 'Date', value: formatDateTime(selectedSale.createdAt) },
                { label: 'Cashier', value: selectedSale.cashierName || '—' },
                { label: 'Payment', value: selectedSale.paymentMethod, capitalize: true },
              ].map(({ label, value, capitalize }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className={`text-sm font-semibold ${capitalize ? 'capitalize' : ''}`} style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold uppercase"
                style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}>
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>
              {selectedSale.items?.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <div className="col-span-5 truncate" style={{ color: 'var(--text-primary)' }}>{item.productName}</div>
                  <div className="col-span-2 text-center" style={{ color: 'var(--text-secondary)' }}>{item.quantity}</div>
                  <div className="col-span-2 text-right" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.price)}</div>
                  <div className="col-span-3 text-right font-semibold" style={{ color: '#0ea5e9' }}>{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 p-4 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
              {[
                { label: 'Subtotal', value: formatCurrency(selectedSale.subtotal) },
                selectedSale.discount > 0 && { label: 'Discount', value: `-${formatCurrency(selectedSale.discount)}`, color: '#10b981' },
                selectedSale.tax > 0 && { label: `Tax (${selectedSale.taxRate}%)`, value: formatCurrency(selectedSale.tax) },
              ].filter(Boolean).map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ color: color || 'var(--text-primary)' }}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span style={{ color: '#10b981' }}>{formatCurrency(selectedSale.total)}</span>
              </div>
              {selectedSale.paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Cash Received</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(selectedSale.cashAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Change Given</span>
                    <span style={{ color: '#f59e0b' }}>{formatCurrency(selectedSale.change)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
