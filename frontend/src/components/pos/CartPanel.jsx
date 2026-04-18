import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingCart, Tag, Percent, ChevronRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'
import { EmptyState } from '../ui/Components'

export default function CartPanel({ onCheckout }) {
  const {
    cart, removeItem, updateQty, clearCart, setDiscount, setTaxRate,
    subtotal, discountAmount, taxAmount, total, itemCount
  } = useCart()

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)' }}>
      {/* Cart header */}
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} style={{ color: '#0ea5e9' }} />
          <span className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Cart</span>
          {itemCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#0ea5e9' }}>
              {itemCount}
            </span>
          )}
        </div>
        {cart.items.length > 0 && (
          <button onClick={clearCart} className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
            style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
            Clear
          </button>
        )}
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Cart is empty"
            message="Scan a barcode or search for products to add items"
          />
        ) : (
          <AnimatePresence initial={false}>
            {cart.items.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="rounded-xl p-3 space-y-2"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {item.barcode}
                    </p>
                  </div>
                  <button onClick={() => removeItem(item._id)}
                    className="p-1 rounded-lg shrink-0 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* Qty controls */}
                  <div className="flex items-center gap-1 rounded-lg overflow-hidden"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => item.quantity === 1 ? removeItem(item._id) : updateQty(item._id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-red-500/10"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-green-500/10 disabled:opacity-30"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{formatCurrency(item.subtotal)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(item.price)} each</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Discount & Tax */}
      {cart.items.length > 0 && (
        <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="number"
                placeholder="Discount $"
                value={cart.discount || ''}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="input-field pl-7 py-2 text-sm"
                min="0" max={subtotal}
              />
            </div>
            <div className="flex-1 relative">
              <Percent size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="number"
                placeholder="Tax %"
                value={cart.taxRate || ''}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                className="input-field pl-7 py-2 text-sm"
                min="0" max="100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary + checkout */}
      {cart.items.length > 0 && (
        <div className="px-4 pt-3 pb-4 space-y-3 border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: '#10b981' }}>
                <span>Discount</span><span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Tax</span><span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              <span>Total</span>
              <span className="text-gradient">{formatCurrency(total)}</span>
            </div>
          </div>

          <button onClick={onCheckout} className="btn-success w-full h-12 text-base">
            Checkout <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
