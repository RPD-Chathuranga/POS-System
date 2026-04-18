import { useState, useEffect } from 'react'
import { Modal } from '../ui/Components'
import { Package } from 'lucide-react'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['General', 'Beverages', 'Snacks', 'Dairy', 'Bakery', 'Confectionery', 'Instant Food', 'Frozen', 'Personal Care', 'Household']

const empty = { name: '', barcode: '', price: '', stock: '', category: 'General', description: '', unit: 'pcs', lowStockThreshold: 10 }

const Field = ({ label, name, type = 'text', placeholder, required, min, step, children, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children || (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="input-field"
      />
    )}
  </div>
)

export default function ProductFormModal({ isOpen, onClose, product, onSaved }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const isEdit = !!product

  useEffect(() => {
    setForm(product ? {
      name: product.name || '',
      barcode: product.barcode || '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      category: product.category || 'General',
      description: product.description || '',
      unit: product.unit || 'pcs',
      lowStockThreshold: product.lowStockThreshold ?? 10
    } : empty)
  }, [product, isOpen])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        lowStockThreshold: parseInt(form.lowStockThreshold, 10)
      }

      const { data } = isEdit
        ? await api.put(`/products/${product._id}`, payload)
        : await api.post('/products', payload)

      toast.success(data.message)
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Product Name" name="name" placeholder="e.g. Coca-Cola 330ml" required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <Field label="Barcode" name="barcode" placeholder="e.g. 5000112637922" required value={form.barcode} onChange={e => set('barcode', e.target.value)} />
          <Field label="Category" name="category" value={form.category} onChange={e => set('category', e.target.value)}>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Price ($)" name="price" type="number" placeholder="0.00" required min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} />
          <Field label="Unit" name="unit" placeholder="pcs" value={form.unit} onChange={e => set('unit', e.target.value)}>
            <select value={form.unit} onChange={e => set('unit', e.target.value)} className="input-field">
              {['pcs', 'can', 'bottle', 'pack', 'box', 'kg', 'g', 'L', 'ml', 'bar', 'jar', 'cup', 'loaf'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
          <Field label="Stock Quantity" name="stock" type="number" placeholder="0" required min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
          <Field label="Low Stock Threshold" name="lowStockThreshold" type="number" placeholder="10" min="0" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} />
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional product description…"
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              <><Package size={16} /> {isEdit ? 'Update Product' : 'Add Product'}</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
