import { useEffect } from 'react'

// Checks recurring orders and creates new ones if due
export function useRecurring(orders, addOrder) {
  useEffect(() => {
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0]
    const lastCheck = localStorage.getItem('zp3_recurringCheck')
    if (lastCheck === todayISO) return // already checked today

    orders.forEach(o => {
      if (!o.recurring || o.recurring === '0') return
      if (o.status !== 'completed' && o.status !== 'scheduled') return

      const interval = parseInt(o.recurring)
      const lastDate = new Date(o.date)
      const nextDate = new Date(lastDate)
      nextDate.setDate(nextDate.getDate() + interval)
      const nextISO = nextDate.toISOString().split('T')[0]

      // Check if next occurrence already exists
      const alreadyExists = orders.some(x =>
        x.clientId === o.clientId &&
        x.date === nextISO &&
        x.services.join(',') === o.services.join(',')
      )

      if (!alreadyExists && nextDate <= new Date(today.getTime() + 7*24*3600*1000)) {
        addOrder({
          clientId: o.clientId,
          date: nextISO,
          status: 'scheduled',
          services: o.services,
          totalPrice: o.totalPrice,
          duration: o.duration,
          notes: o.notes,
          recurring: o.recurring,
          worker: o.worker || 'Jan Novák',
          paid: false,
          photos: [],
        })
      }
    })

    localStorage.setItem('zp3_recurringCheck', todayISO)
  }, []) // run once on mount
}
