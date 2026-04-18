import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useReactToPrint } from 'react-to-print'
import { CreditCard, Banknote, Smartphone, Printer, CheckCircle2, X } from 'lucide-react'
import { Modal } from '../ui/Components'
import Receipt from '../receipt/Receipt'
import { formatCurrency } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Banknote, color: '#10b981' },
  { id: 'card', label: 'Card', icon: CreditCard, color: '#0ea5e9' },
  { id: 'mobile', label: 'Mobile Pay', icon: Smartphone, color: '#8b5cf6' },
]

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, subtotal, discountAmount, taxAmount, total, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [completedSale, setCompletedSale] = useState(null)
  const receiptRef = useRef(null)

  const cashAmountNum = parseFloat(cashAmount) || 0
  const change = paymentMethod === 'cash' ? cashAmountNum - total : 0
  const isValidCash = paymentMethod !== 'cash' || cashAmountNum >= total

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: completedSale?.receiptNumber || 'Receipt',
  })

  const handleCheckout = async () => {
    if (!isValidCash) {
      toast.error('Insufficient cash amount')
      return
    }
    setLoading(true)
    try {
      const items = cart.items.map(item => ({
        productId: item._id,
        productName: item.name,
        barcode: item.barcode,
        quantity: item.quantity,
        price: item.price
      }))

      const { data } = await api.post('/sales', {
        items,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? cashAmountNum : total,
        discount: discountAmount,
        taxRate: cart.taxRate
      })

      if (data.success) {
        setCompletedSale(data.sale)
        clearCart()
        toast.success('Sale completed! 🎉')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCompletedSale(null)
    setCashAmount('')
    setPaymentMethod('cash')
    onClose()
  }

  // Quick cash buttons
  const quickCash = [
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total).slice(0, 4)

  // Receipt view after successful sale
  if (completedSale) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Sale Complete" size="md">
        <div className="space-y-5">
          {/* Success banner */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981' }}>
              <CheckCircle2 size={32} style={{ color: '#10b981' }} />
            </div>
            <h3 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Payment Received!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {completedSale.receiptNumber}
            </p>
          </motion.div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: formatCurrency(completedSale.total), color: '#0ea5e9' },
              { label: 'Cash', value: formatCurrency(completedSale.cashAmount), color: '#10b981' },
              { label: 'Change', value: formatCurrency(completedSale.change), color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p className="text-base font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Hidden receipt for printing */}
          <div className="hidden">
            <Receipt ref={receiptRef} sale={completedSale} />
          </div>

          {/* Preview receipt */}
          <div className="border rounded-xl overflow-auto max-h-72 flex justify-center p-4"
            style={{ borderColor: 'var(--border-color)', background: 'white' }}>
            <Receipt sale={completedSale} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleClose} className="btn-ghost flex-1">
              <X size={16} /> New Sale
            </button>
            <button onClick={handlePrint} className="btn-primary flex-1">
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="md">
      <div className="space-y-5">
        {/* Order summary */}
        <div className="space-y-2 p-4 rounded-xl" style={{ background: 'var(--glass-bg)' }}>
          <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm" style={{ color: '#10b981' }}>
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Tax ({cart.taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl pt-2 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            <span>Total</span>
            <span className="text-gradient">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Payment Method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200"
                style={{
                  borderColor: paymentMethod === id ? color : 'var(--border-color)',
                  background: paymentMethod === id ? `${color}12` : 'var(--glass-bg)',
                  color: paymentMethod === id ? color : 'var(--text-secondary)'
                }}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash input */}
        {paymentMethod === 'cash' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Cash Amount</p>
            <input
              type="number"
              value={cashAmount}
              onChange={e => setCashAmount(e.target.value)}
              className="input-field text-xl font-bold text-center"
              placeholder={formatCurrency(total).replace('$', '')}
              step="0.01"
              min={total}
            />
            {/* Quick cash buttons */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {quickCash.map(v => (
                <button key={v}
                  onClick={() => setCashAmount(v.toString())}
                  className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-colors"
                  style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  ${v}
                </button>
              ))}
              <button
                onClick={() => setCashAmount(total.toFixed(2))}
                className="px-3 py-1.5 text-sm rounded-lg font-semibold transition-colors"
                style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)' }}>
                Exact
              </button>
            </div>
            {cashAmountNum > 0 && cashAmountNum >= total && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex justify-between mt-3 p-3 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>Change</span>
                <span className="text-lg font-bold" style={{ color: '#10b981' }}>{formatCurrency(change)}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || !isValidCash || cart.items.length === 0}
          className="btn-success w-full h-14 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Complete Sale · {formatCurrency(total)}
            </>
          )}
        </button>
      </div>
    </Modal>
  )
}
