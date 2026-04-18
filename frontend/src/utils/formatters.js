export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount || 0)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(new Date(date))
}

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(new Date(date))
}

export const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date))
}

export const formatPercent = (value) => {
  const num = parseFloat(value)
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(1)}%`
}
