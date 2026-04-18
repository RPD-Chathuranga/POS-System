import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, Search, X, Volume2, VolumeX, Grid3x3, List, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatters'
import CartPanel from '../components/pos/CartPanel'
import CheckoutModal from '../components/pos/CheckoutModal'
import toast from 'react-hot-toast'

// Beep sound using Web Audio API
const playBeep = (success = true) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = success ? 880 : 220
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (success ? 0.15 : 0.4))
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + (success ? 0.15 : 0.4))
  } catch (_) {}
}

export default function POSPage() {
  const [barcode, setBarcode] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [flashItem, setFlashItem] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [scanError, setScanError] = useState(null)
  const barcodeRef = useRef(null)
  const searchRef = useRef(null)
  const { addItem } = useCart()

  // Auto-focus barcode field
  useEffect(() => {
    if (!searching) barcodeRef.current?.focus()
  }, [searching, checkoutOpen])

  // Product search debounce
  useEffect(() => {
    if (!searching || !searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=20`)
        setSearchResults(data.products || [])
      } catch (_) {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, searching])

  const handleBarcodeSubmit = useCallback(async (e) => {
    e.preventDefault()
    const code = barcode.trim()
    if (!code) return

    setScanError(null)
    try {
      const { data } = await api.get(`/products/barcode/${encodeURIComponent(code)}`)
      if (data.success) {
        addItem(data.product)
        setFlashItem(data.product._id)
        setTimeout(() => setFlashItem(null), 600)
        if (soundEnabled) playBeep(true)
        toast.success(`${data.product.name} added`, { duration: 1500, icon: '✓' })
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Product not found'
      setScanError(msg)
      if (soundEnabled) playBeep(false)
      toast.error(msg, { duration: 2000 })
    } finally {
      setBarcode('')
      barcodeRef.current?.focus()
    }
  }, [barcode, addItem, soundEnabled])

  const handleAddFromSearch = useCallback((product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`)
      if (soundEnabled) playBeep(false)
      return
    }
    addItem(product)
    if (soundEnabled) playBeep(true)
    toast.success(`${product.name} added`, { duration: 1500, icon: '✓' })
    setSearchQuery('')
    setSearchResults([])
    setSearching(false)
    setTimeout(() => barcodeRef.current?.focus(), 100)
  }, [addItem, soundEnabled])

  const stockColor = (stock) => {
    if (stock === 0) return '#ef4444'
    if (stock <= 5) return '#f59e0b'
    return '#10b981'
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Scanner + product search */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="px-5 py-4 border-b flex items-center gap-3 flex-wrap"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>

          {/* Barcode input */}
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 flex-1 min-w-60">
            <div className="relative flex-1">
              <Scan size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: scanError ? '#ef4444' : '#0ea5e9' }} />
              <input
                ref={barcodeRef}
                value={barcode}
                onChange={e => { setBarcode(e.target.value); setScanError(null) }}
                placeholder="Scan barcode or enter manually…"
                className="input-field pl-10 pr-4 h-11 font-mono"
                style={{ borderColor: scanError ? '#ef4444' : undefined }}
                autoComplete="off"
                autoFocus
              />
              {barcode && (
                <button type="button" onClick={() => { setBarcode(''); setScanError(null) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} type="submit"
              className="btn-primary h-11 px-5 shrink-0">
              Add
            </motion.button>
          </form>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSearching(s => !s); setSearchQuery(''); setScanError(null) }}
              className={`flex items-center gap-2 px-3 h-11 rounded-xl text-sm font-medium transition-all border`}
              style={{
                background: searching ? 'rgba(14,165,233,0.1)' : 'var(--glass-bg)',
                color: searching ? '#0ea5e9' : 'var(--text-secondary)',
                borderColor: searching ? 'rgba(14,165,233,0.3)' : 'var(--border-color)'
              }}>
              <Search size={16} /> Search
            </button>
            <button onClick={() => setSoundEnabled(s => !s)}
              className="p-2.5 rounded-xl border transition-colors"
              style={{ color: soundEnabled ? '#0ea5e9' : 'var(--text-secondary)', background: 'var(--glass-bg)', borderColor: 'var(--border-color)' }}>
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              className="p-2.5 rounded-xl border transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderColor: 'var(--border-color)' }}>
              {viewMode === 'grid' ? <List size={17} /> : <Grid3x3 size={17} />}
            </button>
          </div>
        </div>

        {/* Scan error */}
        <AnimatePresence>
          {scanError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <AlertCircle size={15} /> {scanError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search panel */}
        <AnimatePresence>
          {searching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b overflow-hidden"
              style={{ borderColor: 'var(--border-color)' }}>
              <div className="px-5 py-3">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }} />
                  <input
                    ref={searchRef}
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products by name, barcode or category…"
                    className="input-field pl-9 h-10 text-sm w-full"
                  />
                </div>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className={`px-5 pb-4 ${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3' : 'space-y-2'} max-h-72 overflow-y-auto`}>
                  {searchResults.map(product => (
                    <motion.button
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleAddFromSearch(product)}
                      disabled={product.stock === 0}
                      className={`text-left transition-all rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed ${
                        viewMode === 'grid' ? 'p-3' : 'flex items-center gap-3 p-2.5'
                      }`}
                      style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-color)' }}
                      whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: product.stock > 0 ? 0.97 : 1 }}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 text-sm font-bold"
                            style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>
                            {product.name[0]}
                          </div>
                          <p className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                          <p className="text-sm font-bold mt-1" style={{ color: '#0ea5e9' }}>{formatCurrency(product.price)}</p>
                          <p className="text-xs mt-0.5" style={{ color: stockColor(product.stock) }}>
                            {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                            style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>
                            {product.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{product.barcode}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{formatCurrency(product.price)}</p>
                            <p className="text-xs" style={{ color: stockColor(product.stock) }}>
                              {product.stock === 0 ? 'Out' : `${product.stock}`}
                            </p>
                          </div>
                        </>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {searchLoading && (
                <div className="text-center py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Searching…
                </div>
              )}
              {!searchLoading && searchQuery.length > 1 && searchResults.length === 0 && (
                <div className="text-center py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No products found for "{searchQuery}"
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan animation area — shows recent scan feedback */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {flashItem ? (
              <motion.div
                key="flash"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '3px solid #10b981', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
                  <span className="text-4xl">✓</span>
                </div>
                <p className="text-xl font-bold" style={{ color: '#10b981' }}>Item Added!</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center max-w-sm"
              >
                {/* Animated scan graphic */}
                <div className="relative w-48 h-48 mb-6">
                  <div className="absolute inset-0 rounded-2xl" style={{ border: '2px solid rgba(14,165,233,0.2)' }} />
                  {/* Corner accents */}
                  {[
                    'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
                    'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
                    'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
                    'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-6 h-6 ${cls}`} style={{ borderColor: '#0ea5e9' }} />
                  ))}
                  {/* Scanning line */}
                  <motion.div
                    animate={{ top: ['15%', '80%', '15%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-4 right-4 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, #0ea5e9, transparent)', boxShadow: '0 0 8px #0ea5e9' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan size={40} style={{ color: 'rgba(14,165,233,0.4)' }} />
                  </div>
                </div>
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Ready to Scan
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Point barcode scanner at item or type barcode above.
                  Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono mx-1"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>Enter</kbd> to add.
                </p>
                <p className="text-xs mt-3 font-mono px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--glass-bg)', color: 'var(--text-secondary)' }}>
                  TIP: Use Search to browse products
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 xl:w-96 shrink-0 flex flex-col overflow-hidden">
        <CartPanel onCheckout={() => setCheckoutOpen(true)} />
      </div>

      {/* Checkout modal */}
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  )
}
