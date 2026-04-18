import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, Package, Filter, RefreshCw, AlertTriangle } from 'lucide-react'
import api from '../utils/api'
import { formatCurrency } from '../utils/formatters'
import { Spinner, EmptyState, ConfirmDialog, Skeleton } from '../components/ui/Components'
import ProductFormModal from '../components/products/ProductFormModal'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | lowStock | outOfStock
  const [formOpen, setFormOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })

  const fetchProducts = useCallback(async (q = search, f = filter, page = 1) => {
    setLoading(true)
    try {
      let url = `/products?page=${page}&limit=30`
      if (q) url += `&search=${encodeURIComponent(q)}`
      if (f === 'lowStock') url += '&lowStock=true'
      const { data } = await api.get(url)
      let prods = data.products || []
      if (f === 'outOfStock') prods = prods.filter(p => p.stock === 0)
      setProducts(prods)
      setPagination(data.pagination || { total: prods.length, page: 1, pages: 1 })
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => {
    const t = setTimeout(() => fetchProducts(search, filter), 300)
    return () => clearTimeout(t)
  }, [search, filter])

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget._id}`)
      toast.success('Product deleted')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
    setDeleteTarget(null)
  }

  const stockBadge = (p) => {
    if (p.stock === 0) return <span className="badge-danger">Out of Stock</span>
    if (p.isLowStock || p.stock <= p.lowStockThreshold) return <span className="badge-warning">{p.stock} Low</span>
    return <span className="badge-success">{p.stock} In Stock</span>
  }

  const filterButtons = [
    { id: 'all', label: 'All Products' },
    { id: 'lowStock', label: 'Low Stock' },
    { id: 'outOfStock', label: 'Out of Stock' },
  ]

  return (
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field pl-9 h-10 w-full"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
          {filterButtons.map(b => (
            <button key={b.id} onClick={() => setFilter(b.id)}
              className="px-4 h-10 text-sm font-medium transition-all"
              style={{
                background: filter === b.id ? 'rgba(14,165,233,0.12)' : 'var(--glass-bg)',
                color: filter === b.id ? '#0ea5e9' : 'var(--text-secondary)',
                borderRight: '1px solid var(--border-color)'
              }}>
              {b.label}
            </button>
          ))}
        </div>

        <button onClick={() => fetchProducts()} className="btn-ghost h-10 px-3" title="Refresh">
          <RefreshCw size={16} />
        </button>

        <button onClick={() => { setEditProduct(null); setFormOpen(true) }} className="btn-primary h-10">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>{pagination.total} total products</span>
        <span>·</span>
        <span>{products.filter(p => p.stock === 0).length} out of stock</span>
        <span>·</span>
        <span>{products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length} low stock</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          message={search ? `No results for "${search}"` : 'Start by adding your first product'}
          action={
            <button onClick={() => { setEditProduct(null); setFormOpen(true) }} className="btn-primary">
              <Plus size={16} /> Add Product
            </button>
          }
        />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
            style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', background: 'var(--glass-bg)' }}>
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Barcode</div>
            <div className="col-span-1 text-right">Price</div>
            <div className="col-span-2 text-center">Stock</div>
            <div className="col-span-1">Category</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          <AnimatePresence initial={false}>
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 px-5 py-4 items-center border-b transition-colors hover:bg-white/2"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {/* Name + desc */}
                <div className="col-span-2 md:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>
                    {product.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
                    )}
                  </div>
                </div>

                {/* Barcode */}
                <div className="hidden md:flex md:col-span-2">
                  <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}>
                    {product.barcode}
                  </span>
                </div>

                {/* Price */}
                <div className="hidden md:block md:col-span-1 text-right">
                  <span className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{formatCurrency(product.price)}</span>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>/{product.unit}</p>
                </div>

                {/* Stock */}
                <div className="hidden md:flex md:col-span-2 justify-center">
                  {stockBadge(product)}
                </div>

                {/* Category */}
                <div className="hidden md:block md:col-span-1">
                  <span className="badge-neutral text-xs">{product.category}</span>
                </div>

                {/* Mobile: price + stock */}
                <div className="md:hidden flex items-center justify-end gap-2">
                  <span className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{formatCurrency(product.price)}</span>
                  {stockBadge(product)}
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    onClick={() => { setEditProduct(product); setFormOpen(true) }}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
                    title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
                    title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null) }}
        product={editProduct}
        onSaved={() => fetchProducts()}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
