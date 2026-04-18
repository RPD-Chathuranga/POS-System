import { forwardRef } from 'react'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

const Receipt = forwardRef(({ sale }, ref) => {
  if (!sale) return null

  return (
    <div ref={ref} className="receipt-wrapper bg-white text-black"
      style={{ width: '80mm', maxWidth: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '12px', padding: '8px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px' }}>⚡ PlanWeb Solutions</div>
        <div style={{ fontSize: '11px' }}>Retail Management System</div>
        <div style={{ fontSize: '10px', marginTop: '2px' }}>Tel: +1 (555) 123-4567</div>
        <div style={{ fontSize: '10px' }}>www.planwebsolutions.com</div>
      </div>

      {/* Receipt info */}
      <div style={{ marginBottom: '8px', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Receipt #:</span>
          <span style={{ fontWeight: 'bold' }}>{sale.receiptNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{formatDateTime(sale.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Cashier:</span>
          <span>{sale.cashierName || 'Staff'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Payment:</span>
          <span style={{ textTransform: 'capitalize' }}>{sale.paymentMethod}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', marginBottom: '8px' }} />

      {/* Items header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>
        <span style={{ flex: 2 }}>ITEM</span>
        <span style={{ textAlign: 'center', flex: 1 }}>QTY</span>
        <span style={{ textAlign: 'right', flex: 1 }}>PRICE</span>
        <span style={{ textAlign: 'right', flex: 1 }}>TOTAL</span>
      </div>
      <div style={{ borderTop: '1px solid #000', marginBottom: '4px' }} />

      {/* Items */}
      {sale.items?.map((item, i) => (
        <div key={i} style={{ marginBottom: '3px' }}>
          <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '4px' }}>
              {item.productName}
            </span>
            <span style={{ textAlign: 'center', flex: 1 }}>{item.quantity}</span>
            <span style={{ textAlign: 'right', flex: 1 }}>{formatCurrency(item.price)}</span>
            <span style={{ textAlign: 'right', flex: 1 }}>{formatCurrency(item.subtotal)}</span>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ borderTop: '1px dashed #000', marginTop: '6px', marginBottom: '6px' }} />

      {/* Totals */}
      <div style={{ fontSize: '11px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount:</span>
            <span>-{formatCurrency(sale.discount)}</span>
          </div>
        )}
        {sale.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax ({sale.taxRate}%):</span>
            <span>{formatCurrency(sale.tax)}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: '2px solid #000', paddingTop: '4px', marginBottom: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>

      {/* Payment details */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        {sale.paymentMethod === 'cash' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cash Tendered:</span>
              <span>{formatCurrency(sale.cashAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Change:</span>
              <span>{formatCurrency(sale.change)}</span>
            </div>
          </>
        )}
        {sale.paymentMethod === 'card' && (
          <div style={{ textAlign: 'center', fontStyle: 'italic' }}>Card payment — Thank you</div>
        )}
      </div>

      {/* Barcode placeholder */}
      <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', textAlign: 'center' }}>
        <div style={{ letterSpacing: '3px', fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
          {sale.receiptNumber}
        </div>
        {/* Simulated barcode lines */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1px', marginBottom: '8px' }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{
              width: i % 3 === 0 ? '3px' : '1px',
              height: '28px',
              background: '#000'
            }} />
          ))}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 'bold' }}>*** THANK YOU FOR SHOPPING! ***</div>
        <div style={{ fontSize: '10px', marginTop: '2px' }}>Please come again</div>
        <div style={{ fontSize: '10px', marginTop: '2px' }}>Items sold are non-refundable</div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>Powered by PlanWeb Solutions v1.0</div>
      </div>
    </div>
  )
})

Receipt.displayName = 'Receipt'
export default Receipt
