// ── Data helpers ──────────────────────────────
export function formatCurrency(n) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency', currency: 'CZK', maximumFractionDigits: 0
  }).format(n)
}

export function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('cs-CZ', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export function formatDateShort(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('cs-CZ', {
    day: '2-digit', month: '2-digit'
  })
}

export function getInitials(name) {
  return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── Business ──────────────────────────────────
export const business = {
  name: 'ZahradaPro s.r.o.',
  owner: 'Jan Novák',
  phone: '+420 602 123 456',
  email: 'jan@zahradapro.cz',
  address: 'Zahradní 12, Brno 602 00',
  ico: '12345678',
  dic: 'CZ12345678',
  bank: 'CZ65 0800 0000 1920 0014 5399',
}

// ── Clients ───────────────────────────────────
export const defaultClients = [
  { id: 1, name: 'Marie Horáčková', phone: '+420 605 111 222', email: 'marie.horackova@email.cz', address: 'Lipová 15, Brno-Židenice', notes: 'Velký pes Asta. Kód od branky: 4521. Preferuje dopoledne.', tags: ['pravidelný', 'vip'], status: 'active', gardenSize: 'střední', joinDate: '2023-03-15' },
  { id: 2, name: 'Petr Dvořák', phone: '+420 607 333 444', email: 'petr.dvorak@firma.cz', address: 'Nad Přehradou 8, Brno-Bystrc', notes: 'Firemní sídlo. IČO 87654321. Fakturovat koncem měsíce.', tags: ['firemní', 'pravidelný'], status: 'active', gardenSize: 'velká', joinDate: '2023-01-10' },
  { id: 3, name: 'Eva Kratochvílová', phone: '+420 608 555 666', email: 'eva.kratoch@seznam.cz', address: 'Polní 33, Šlapanice', notes: 'Alergická na pyl. Ráda se pobaví.', tags: ['pravidelný'], status: 'active', gardenSize: 'malá', joinDate: '2022-06-20' },
  { id: 4, name: 'Tomáš Blaha', phone: '+420 601 777 888', email: 'tblaha@gmail.com', address: 'Větrná 5, Brno-Líšeň', notes: 'Novostavba, velká zahrada.', tags: ['nový'], status: 'active', gardenSize: 'velká', joinDate: '2024-02-01' },
  { id: 5, name: 'Lucie Marková', phone: '+420 604 999 000', email: 'l.markova@email.cz', address: 'Slunečná 2, Brno-Bohunice', notes: 'Jednorázová zakázka.', tags: ['jednorázový'], status: 'inactive', gardenSize: 'malá', joinDate: '2024-04-10' },
  { id: 6, name: 'Robert Šimánek', phone: '+420 603 222 111', email: 'r.simanek@podnikatel.cz', address: 'Jasanová 44, Kuřim', notes: 'Zahrada 1200 m². Precizní práce nutností.', tags: ['vip', 'pravidelný'], status: 'active', gardenSize: 'velká', joinDate: '2022-12-01' },
]

// ── Orders ────────────────────────────────────
export const defaultOrders = [
  { id: 101, clientId: 1, date: '2024-06-15', status: 'completed', services: ['Sekání trávy', 'Stříhání keřů'], duration: 90, totalPrice: 1800, paid: true, notes: 'Sekáno do 5 cm.', worker: 'Jan Novák' },
  { id: 102, clientId: 2, date: '2024-06-16', status: 'completed', services: ['Sekání trávy', 'Vertikutace', 'Odvoz odpadu'], duration: 180, totalPrice: 4200, paid: true, notes: 'Firemní zahrada, velká plocha.', worker: 'Jan Novák' },
  { id: 103, clientId: 3, date: '2024-06-17', status: 'completed', services: ['Sekání trávy', 'Zálivka'], duration: 60, totalPrice: 900, paid: false, notes: '', worker: 'Jan Novák' },
  { id: 104, clientId: 6, date: '2024-06-20', status: 'scheduled', services: ['Sekání trávy', 'Stříhání živého plotu', 'Mulčování'], duration: 240, totalPrice: 5800, paid: false, notes: '', worker: 'Jan Novák' },
  { id: 105, clientId: 1, date: '2024-07-01', status: 'scheduled', services: ['Sekání trávy'], duration: 90, totalPrice: 1200, paid: false, notes: '', worker: 'Jan Novák' },
  { id: 106, clientId: 4, date: '2024-07-03', status: 'scheduled', services: ['Sekání trávy', 'Stříhání keřů', 'Odvoz odpadu'], duration: 150, totalPrice: 3200, paid: false, notes: 'První návštěva, nafotit stav zahrady.', worker: 'Jan Novák' },
]

// ── Invoices ──────────────────────────────────
export const defaultInvoices = [
  { id: '2024001', orderId: 101, clientId: 1, date: '2024-06-15', dueDate: '2024-06-29', amount: 1800, paid: true, paidDate: '2024-06-18' },
  { id: '2024002', orderId: 102, clientId: 2, date: '2024-06-16', dueDate: '2024-06-30', amount: 4200, paid: true, paidDate: '2024-06-30' },
  { id: '2024003', orderId: 103, clientId: 3, date: '2024-06-17', dueDate: '2024-07-01', amount: 900, paid: false, paidDate: null },
]

// ── Services / Pricelist ──────────────────────
export const defaultServices = [
  { id: 'sekani',  name: 'Sekání trávy',            pricePerUnit: 8,   unit: 'm²',    unitLabel: 'za m²' },
  { id: 'kere',    name: 'Stříhání keřů',            pricePerUnit: 350, unit: 'ks',    unitLabel: 'za keř' },
  { id: 'plot',    name: 'Stříhání živého plotu',    pricePerUnit: 80,  unit: 'bm',    unitLabel: 'za bm' },
  { id: 'vertik',  name: 'Vertikutace',              pricePerUnit: 12,  unit: 'm²',    unitLabel: 'za m²' },
  { id: 'mulc',    name: 'Mulčování',                pricePerUnit: 15,  unit: 'm²',    unitLabel: 'za m²' },
  { id: 'odvoz',   name: 'Odvoz odpadu',             pricePerUnit: 800, unit: 'jízda', unitLabel: 'za odvoz' },
  { id: 'zavlaha', name: 'Zálivka',                  pricePerUnit: 400, unit: 'hod',   unitLabel: 'za hod' },
  { id: 'stromy',  name: 'Řez stromů',               pricePerUnit: 900, unit: 'ks',    unitLabel: 'za strom' },
  { id: 'hnojeni', name: 'Hnojení trávníku',         pricePerUnit: 6,   unit: 'm²',    unitLabel: 'za m²' },
  { id: 'listi',   name: 'Shrabání listí',           pricePerUnit: 500, unit: 'hod',   unitLabel: 'za hod' },
  { id: 'vysadba', name: 'Výsadba rostlin',          pricePerUnit: 200, unit: 'ks',    unitLabel: 'za ks' },
  { id: 'postik',  name: 'Postřik / chemie',         pricePerUnit: 600, unit: 'hod',   unitLabel: 'za hod' },
]

// ── Tag colors ────────────────────────────────
export const TAG_STYLES = {
  'pravidelný': 'bg-green-50 text-green-700 border-green-200',
  'vip':        'bg-amber-50 text-amber-700 border-amber-200',
  'firemní':    'bg-blue-50 text-blue-700 border-blue-200',
  'nový':       'bg-sky-50 text-sky-700 border-sky-200',
  'jednorázový':'bg-gray-100 text-gray-600 border-gray-200',
}

export const STATUS_STYLES = {
  completed:  { dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700 border-green-200',  label: 'Dokončeno' },
  scheduled:  { dot: 'bg-blue-500',   pill: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'Naplánováno' },
  inprogress: { dot: 'bg-amber-500',  pill: 'bg-amber-50 text-amber-700 border-amber-200',  label: 'Probíhá' },
  cancelled:  { dot: 'bg-gray-400',   pill: 'bg-gray-100 text-gray-600 border-gray-200',    label: 'Zrušeno' },
  active:     { dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700 border-green-200',  label: 'Aktivní' },
  inactive:   { dot: 'bg-gray-400',   pill: 'bg-gray-100 text-gray-600 border-gray-200',    label: 'Neaktivní' },
}
