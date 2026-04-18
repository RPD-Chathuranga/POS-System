import { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext(null)

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex(i => i._id === action.product._id)
      if (existing >= 0) {
        const items = [...state.items]
        const item = items[existing]
        const newQty = item.quantity + (action.quantity || 1)
        if (newQty > item.stock) return state // can't exceed stock
        items[existing] = { ...item, quantity: newQty, subtotal: item.price * newQty }
        return { ...state, items }
      }
      const qty = action.quantity || 1
      return {
        ...state,
        items: [...state.items, {
          ...action.product,
          quantity: qty,
          subtotal: action.product.price * qty
        }]
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.id) }
    case 'UPDATE_QTY': {
      const items = state.items.map(i => {
        if (i._id !== action.id) return i
        const qty = Math.max(1, Math.min(action.qty, i.stock))
        return { ...i, quantity: qty, subtotal: i.price * qty }
      })
      return { ...state, items }
    }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'SET_DISCOUNT':
      return { ...state, discount: action.value }
    case 'SET_TAX_RATE':
      return { ...state, taxRate: action.value }
    default:
      return state
  }
}

const initialState = { items: [], discount: 0, taxRate: 0 }

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState)

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity })
  }, [])

  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', id })
  }, [])

  const updateQty = useCallback((id, qty) => {
    dispatch({ type: 'UPDATE_QTY', id, qty })
  }, [])

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const setDiscount = useCallback((value) => dispatch({ type: 'SET_DISCOUNT', value }), [])
  const setTaxRate = useCallback((value) => dispatch({ type: 'SET_TAX_RATE', value }), [])

  const subtotal = cart.items.reduce((s, i) => s + i.subtotal, 0)
  const discountAmount = cart.discount || 0
  const taxAmount = cart.taxRate ? (subtotal - discountAmount) * (cart.taxRate / 100) : 0
  const total = subtotal - discountAmount + taxAmount
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQty, clearCart, setDiscount, setTaxRate,
      subtotal, discountAmount, taxAmount, total, itemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
