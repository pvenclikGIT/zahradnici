import { useMemo } from 'react'
import { daysSince } from '../data'

// Generates live notifications from real app data
export function useAutoNotifications(clients, orders, invoices) {
  return useMemo(() => {
    const notifs = []
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0]
    const tomorrowISO = new Date(Date.now()+86400000).toISOString().split('T')[0]
    let id = 1000

    // 1. Overdue invoices
    invoices.filter(i => !i.paid && new Date(i.dueDate) < today).forEach(inv => {
      const c = clients.find(x=>x.id===inv.clientId)
      const daysLate = Math.floor((today - new Date(inv.dueDate)) / 86400000)
      notifs.push({
        id: id++, type:'overdue', read:false,
        time: inv.dueDate + 'T09:00',
        message: `Faktura #${inv.id} po splatnosti ${daysLate} dní — ${c?.name} (${new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(inv.amount)})`,
        action: 'invoices', priority: 'high',
      })
    })

    // 2. Invoices due in 3 days
    invoices.filter(i => {
      if (i.paid) return false
      const due = new Date(i.dueDate)
      const daysUntil = Math.floor((due - today) / 86400000)
      return daysUntil >= 0 && daysUntil <= 3
    }).forEach(inv => {
      const c = clients.find(x=>x.id===inv.clientId)
      const daysUntil = Math.floor((new Date(inv.dueDate) - today) / 86400000)
      notifs.push({
        id: id++, type:'reminder', read:false,
        time: todayISO + 'T08:00',
        message: `Faktura #${inv.id} splatná za ${daysUntil === 0 ? 'dnes' : `${daysUntil} ${daysUntil===1?'den':'dny'}`} — ${c?.name}`,
        action: 'invoices', priority: 'medium',
      })
    })

    // 3. Tomorrow's orders reminder
    const tomorrowOrders = orders.filter(o => o.status==='scheduled' && o.date===tomorrowISO)
    if (tomorrowOrders.length > 0) {
      tomorrowOrders.forEach(o => {
        const c = clients.find(x=>x.id===o.clientId)
        notifs.push({
          id: id++, type:'reminder', read:false,
          time: todayISO + 'T18:00',
          message: `Zítra zakázka: ${c?.name} — ${o.services.slice(0,2).join(', ')}${c?.notes ? ' · Poznámka: viz detail' : ''}`,
          action: 'checklist', orderId: o.id, priority: 'medium',
        })
      })
    }

    // 4. Today's orders
    const todayOrders = orders.filter(o => o.status==='scheduled' && o.date===todayISO)
    if (todayOrders.length > 0) {
      notifs.push({
        id: id++, type:'reminder', read:false,
        time: todayISO + 'T07:00',
        message: `Dnes ${todayOrders.length} ${todayOrders.length===1?'zakázka':'zakázky'} — ${todayOrders.map(o=>clients.find(c=>c.id===o.clientId)?.name?.split(' ')[1]||'?').join(', ')}`,
        action: 'calendar', priority: 'high',
      })
    }

    // 5. Clients without contact 21+ days
    clients.filter(c => c.status==='active').forEach(c => {
      const lastOrder = orders.filter(o=>o.clientId===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
      const days = daysSince(lastOrder?.date)
      if (days >= 30) {
        notifs.push({
          id: id++, type:'nocontact', read:false,
          time: todayISO + 'T09:00',
          message: `${c.name} bez zakázky ${days} dní — čas na oslovení`,
          action: 'clients', clientId: c.id, priority: 'low',
        })
      }
    })

    // 6. Weather warning for scheduled orders
    const rainDay = new Date(today); rainDay.setDate(rainDay.getDate() + 2)
    const rainDayISO = rainDay.toISOString().split('T')[0]
    const rainOrders = orders.filter(o => o.status==='scheduled' && o.date===rainDayISO)
    if (rainOrders.length > 0) {
      notifs.push({
        id: id++, type:'weather', read:false,
        time: todayISO + 'T06:00',
        message: `Pozor: déšť v ${rainDay.toLocaleDateString('cs-CZ',{weekday:'long'})} — ${rainOrders.length} ${rainOrders.length===1?'zakázka může':'zakázky mohou'} být ovlivněny`,
        action: 'calendar', priority: 'medium',
      })
    }

    // 7. Unpaid completed orders (no invoice)
    orders.filter(o => o.status==='completed' && !o.paid).forEach(o => {
      const c = clients.find(x=>x.id===o.clientId)
      const days = daysSince(o.date)
      if (days > 7) {
        notifs.push({
          id: id++, type:'overdue', read:true,
          time: o.date + 'T10:00',
          message: `Nezaplacena zakázka — ${c?.name}, ${days} dní po dokončení`,
          action: 'invoices', priority: 'medium',
        })
      }
    })

    // Sort: unread first, then by priority, then by time desc
    const prio = { high:0, medium:1, low:2 }
    return notifs.sort((a,b) => {
      if (a.read !== b.read) return a.read ? 1 : -1
      if (a.priority !== b.priority) return (prio[a.priority]||1) - (prio[b.priority]||1)
      return new Date(b.time) - new Date(a.time)
    })
  }, [clients, orders, invoices])
}
