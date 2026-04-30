// ── Helpers ───────────────────────────────────
export function formatCurrency(n) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}
export function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
export function formatDateShort(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })
}
export function getInitials(name) {
  return (name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
export function daysSince(dateStr) {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000)
}

// ── Business ──────────────────────────────────
export const business = {
  name: 'ZahradaPro s.r.o.',
  owner: 'Jan Novák',
  phone: '+420 602 123 456',
  email: 'jan@zahradapro.cz',
  address: 'Průmyslová 12, Praha-Horní Počernice',
  ico: '12345678',
  dic: 'CZ12345678',
  bank: 'CZ65 0800 0000 1920 0014 5399',
}

// ── Relative date helper ──────────────────────
const today = new Date()
function d(offset) {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + offset)
  return dt.toISOString().split('T')[0]
}
// Absolute date helper — keep historical dates in 2025/2026
function abs(y, m, day) {
  return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

// ── Clients — Praha Východ ────────────────────
export const defaultClients = [
  { id:1,  name:'Ing. Pavel Horák',       phone:'+420 605 111 222', email:'p.horak@email.cz',           address:'Ke Křížku 14, Praha-Šeberov',       city:'Praha-Šeberov',    notes:'Pozor na psa Rexe — volný v zahradě. Kód od branky: 4521. Preferuje dopoledne do 11:00.', tags:['pravidelný','vip'],      status:'active',   gardenSize:'velká',   joinDate:'2022-03-15', lat:49.9920, lng:14.5180, clientPin:'4455' },
  { id:2,  name:'Správa objektů Říčany',  phone:'+420 323 600 100', email:'zahrada@so-ricany.cz',       address:'Říčanská 8, Říčany u Prahy',        city:'Říčany',           notes:'Firemní areál 3200 m². Fakturace na IČO 45123678. Vždy fakturovat do 25. v měsíci.',    tags:['firemní','pravidelný'],  status:'active',   gardenSize:'velká',   joinDate:'2022-01-10', lat:49.9918, lng:14.6553, clientPin:'4455' },
  { id:3,  name:'Marie Procházková',      phone:'+420 608 555 666', email:'m.prochazkova@seznam.cz',   address:'Lipová alej 33, Průhonice',         city:'Průhonice',        notes:'Alergická na pyl — nosit rukavice. Ráda si popovídá u kávy.',                          tags:['pravidelný'],            status:'active',   gardenSize:'malá',    joinDate:'2021-06-20', lat:49.9899, lng:14.5484, clientPin:'4455' },
  { id:4,  name:'Tomáš Kratochvíl',       phone:'+420 601 777 888', email:'t.kratochvil@gmail.com',    address:'Větrná 5, Čestlice',                city:'Čestlice',         notes:'Novostavba 2023, velká zahrada 800 m². Zajímá se o zahradničení, rád se ptá.',        tags:['nový','pravidelný'],     status:'active',   gardenSize:'velká',   joinDate:'2023-02-01', lat:49.9997, lng:14.6003, clientPin:'4455' },
  { id:5,  name:'Jana Bártová',           phone:'+420 604 999 000', email:'j.bartova@volny.cz',        address:'Slunečná 12, Jesenice u Prahy',     city:'Jesenice',         notes:'Klíče u sousedky p. Novákové č.p. 14. Branka se zamyká.',                              tags:['pravidelný'],            status:'active',   gardenSize:'střední', joinDate:'2022-04-10', lat:49.9599, lng:14.5199, clientPin:'4455' },
  { id:6,  name:'Robert Šimánek',         phone:'+420 603 222 111', email:'r.simanek@podnikatel.cz',   address:'Jasanová 44, Velké Popovice',       city:'Velké Popovice',   notes:'Zahrada 1400 m² se sadem. Precizní práce nutností — VIP klient. Vždy platí hotově.',  tags:['vip','pravidelný'],      status:'active',   gardenSize:'velká',   joinDate:'2021-12-01', lat:49.9199, lng:14.6099, clientPin:'4455' },
  { id:7,  name:'Hotel Průhonice',         phone:'+420 271 015 911', email:'zahrada@hotel-pruhonice.cz',address:'U Parku 6, Průhonice',             city:'Průhonice',        notes:'Hotelová zahrada u vstupu — reprezentativní vzhled je povinností. Přístup přes recepci.', tags:['firemní','vip'],        status:'active',   gardenSize:'velká',   joinDate:'2021-04-20', lat:49.9912, lng:14.5472, clientPin:'4455' },
  { id:8,  name:'Petr Novotný',           phone:'+420 606 444 555', email:'p.novotny@centrum.cz',      address:'Kaštanová 7, Říčany u Prahy',       city:'Říčany',           notes:'Pensionista, doma téměř vždy. Preferuje páteční návštěvy. Čaj vždy připraven.',       tags:['pravidelný'],            status:'active',   gardenSize:'střední', joinDate:'2022-08-30', lat:49.9911, lng:14.6559, clientPin:'4455' },
  { id:9,  name:'Lucie Horáková',         phone:'+420 607 333 777', email:'l.horakova@email.cz',       address:'Nad Rybníkem 22, Sulice',           city:'Sulice',           notes:'Mladá rodina, 3 malé děti — zahrada musí být bezpečná, bez chemie.',                  tags:['pravidelný'],            status:'active',   gardenSize:'střední', joinDate:'2023-05-12', lat:49.9729, lng:14.6010, clientPin:'4455' },
  { id:10, name:'Ing. arch. Blaha',       phone:'+420 777 888 999', email:'blaha.arch@studio.cz',      address:'Příční 88, Popovičky',              city:'Popovičky',        notes:'Architekt — vysoké nároky na estetiku. Každý detail musí být perfektní.',             tags:['vip'],                   status:'active',   gardenSize:'velká',   joinDate:'2022-11-01', lat:49.9458, lng:14.6258, clientPin:'4455' },
  { id:11, name:'Eva Součková',           phone:'+420 602 555 444', email:'e.souckova@email.cz',       address:'Polní 3, Zdiby',                    city:'Zdiby',            notes:'Odjíždí každý pátek. Klíče pod rohožkou na zadní terase. Volné parkování na dvoře.',  tags:['pravidelný'],            status:'active',   gardenSize:'střední', joinDate:'2023-09-15', lat:50.1799, lng:14.4799, clientPin:'4455' },
  { id:12, name:'Škola Radošovice',       phone:'+420 281 960 111', email:'reditelna@skola-radosovice.cz',address:'Školní 1, Praha-Radošovice',    city:'Praha-Radošovice', notes:'Školní zahrada a sportovní plochy. Práce vždy o prázdninách nebo víkendech.',         tags:['firemní'],               status:'active',   gardenSize:'velká',   joinDate:'2022-06-01', lat:50.0499, lng:14.6099, clientPin:'4455' },
  { id:13, name:'Martin Vlček',           phone:'+420 608 777 123', email:'m.vlcek@firma.cz',          address:'U Lesíka 5, Mukařov',               city:'Mukařov',          notes:'Dřívější termíny preferuje — chodí do práce v 7:30. Pes Benny v ohradě.',            tags:['pravidelný'],            status:'active',   gardenSize:'střední', joinDate:'2024-01-15', lat:49.9620, lng:14.7220, clientPin:'4455' },
  { id:14, name:'Dagmar Kopecká',         phone:'+420 605 321 654', email:'d.kopecka@seznam.cz',       address:'Nová 18, Dobřejovice',              city:'Dobřejovice',      notes:'Důchodkyně, ráda přihlíží. Nabídne vždy ovoce ze zahrady.',                           tags:['pravidelný'],            status:'inactive', gardenSize:'malá',    joinDate:'2021-07-20', lat:49.9720, lng:14.5720, clientPin:'4455' },
]

// ── Orders (38 zakázek) — 2025/2026 ──────────
export const defaultOrders = [
  // 2025 — jaro (dokoncene, zaplacene)
  { id:101, clientId:3,  date:abs(2025,3,12), status:'completed', services:['Sekání trávy','Zálivka'],                          duration:65,  totalPrice:950,  paid:true,  paidDate:abs(2025,3,15), notes:'Zálivka ovocných stromků.', worker:'Jan Novák' },
  { id:102, clientId:6,  date:abs(2025,3,18), status:'completed', services:['Sekání trávy','Stříhání živého plotu','Mulčování'], duration:260, totalPrice:6800, paid:true,  paidDate:abs(2025,3,18), notes:'Zaplaceno hotově na místě.', worker:'Jan Novák' },
  { id:103, clientId:1,  date:abs(2025,3,25), status:'completed', services:['Vertikutace','Hnojení trávníku'],                  duration:130, totalPrice:2800, paid:true,  paidDate:abs(2025,3,27), notes:'Jarní vertikutace a hnojení.', worker:'Jan Novák' },
  { id:104, clientId:7,  date:abs(2025,4,2),  status:'completed', services:['Sekání trávy','Stříhání keřů','Výsadba rostlin'],  duration:230, totalPrice:8200, paid:true,  paidDate:abs(2025,4,2),  notes:'Hotelová zahrada — sezónní výsadba letniček.', worker:'Jan Novák' },
  { id:105, clientId:2,  date:abs(2025,4,8),  status:'completed', services:['Sekání trávy','Vertikutace','Odvoz odpadu'],       duration:220, totalPrice:5800, paid:true,  paidDate:abs(2025,4,20), notes:'Firemní areál, velká plocha.', worker:'Jan Novák' },
  { id:106, clientId:4,  date:abs(2025,4,15), status:'completed', services:['Sekání trávy','Odvoz odpadu'],                    duration:160, totalPrice:3600, paid:true,  paidDate:abs(2025,4,22), notes:'Nafocen stav zahrady před a po.', worker:'Jan Novák' },
  { id:107, clientId:8,  date:abs(2025,4,22), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:95,  totalPrice:2100, paid:true,  paidDate:abs(2025,4,25), notes:'', worker:'Jan Novák' },
  { id:108, clientId:9,  date:abs(2025,4,28), status:'completed', services:['Sekání trávy','Hnojení trávníku'],                duration:90,  totalPrice:1900, paid:true,  paidDate:abs(2025,4,30), notes:'Bez chemie — organické hnojivo.', worker:'Jan Novák' },
  // 2025 — léto
  { id:109, clientId:6,  date:abs(2025,5,6),  status:'completed', services:['Sekání trávy','Stříhání živého plotu'],           duration:190, totalPrice:4800, paid:true,  paidDate:abs(2025,5,6),  notes:'Zaplaceno hotově.', worker:'Jan Novák' },
  { id:110, clientId:1,  date:abs(2025,5,14), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:100, totalPrice:2200, paid:true,  paidDate:abs(2025,5,16), notes:'', worker:'Jan Novák' },
  { id:111, clientId:7,  date:abs(2025,5,20), status:'completed', services:['Sekání trávy','Stříhání živého plotu'],           duration:190, totalPrice:5600, paid:true,  paidDate:abs(2025,5,20), notes:'Hotel — letní údržba vstupu.', worker:'Jan Novák' },
  { id:112, clientId:2,  date:abs(2025,5,27), status:'completed', services:['Sekání trávy','Stříhání keřů','Zálivka'],        duration:210, totalPrice:5200, paid:true,  paidDate:abs(2025,6,5),  notes:'', worker:'Jan Novák' },
  { id:113, clientId:10, date:abs(2025,6,3),  status:'completed', services:['Sekání trávy','Výsadba rostlin'],                duration:140, totalPrice:4200, paid:true,  paidDate:abs(2025,6,5),  notes:'Výsadba trvalkového záhonu.', worker:'Jan Novák' },
  { id:114, clientId:12, date:abs(2025,6,10), status:'completed', services:['Sekání trávy','Odvoz odpadu'],                   duration:270, totalPrice:7200, paid:true,  paidDate:abs(2025,6,12), notes:'Školní hřiště a zahrada — letní úklid.', worker:'Jan Novák' },
  { id:115, clientId:3,  date:abs(2025,6,17), status:'completed', services:['Sekání trávy'],                                  duration:55,  totalPrice:850,  paid:true,  paidDate:abs(2025,6,19), notes:'', worker:'Jan Novák' },
  { id:116, clientId:5,  date:abs(2025,6,24), status:'completed', services:['Sekání trávy','Stříhání keřů'],                  duration:100, totalPrice:2300, paid:true,  paidDate:abs(2025,6,26), notes:'', worker:'Jan Novák' },
  // 2025 — podzim
  { id:117, clientId:6,  date:abs(2025,9,9),  status:'completed', services:['Shrabání listí','Mulčování','Odvoz odpadu'],      duration:240, totalPrice:6200, paid:true,  paidDate:abs(2025,9,9),  notes:'Podzimní úklid — zaplaceno hotově.', worker:'Jan Novák' },
  { id:118, clientId:1,  date:abs(2025,9,16), status:'completed', services:['Shrabání listí','Stříhání keřů'],                duration:110, totalPrice:2500, paid:true,  paidDate:abs(2025,9,18), notes:'', worker:'Jan Novák' },
  { id:119, clientId:7,  date:abs(2025,9,23), status:'completed', services:['Shrabání listí','Odvoz odpadu'],                 duration:200, totalPrice:5400, paid:true,  paidDate:abs(2025,9,23), notes:'Hotel — podzimní příprava.', worker:'Jan Novák' },
  { id:120, clientId:2,  date:abs(2025,10,7), status:'completed', services:['Shrabání listí','Mulčování','Odvoz odpadu'],     duration:300, totalPrice:7800, paid:true,  paidDate:abs(2025,10,20),notes:'Firemní areál — kompletní podzimní úklid.', worker:'Jan Novák' },
  { id:121, clientId:12, date:abs(2025,10,18),status:'completed', services:['Shrabání listí','Sekání trávy'],                 duration:270, totalPrice:6800, paid:true,  paidDate:abs(2025,10,20),notes:'Škola — podzimní úklid hřiště.', worker:'Jan Novák' },
  // 2025 — zima / řez stromů
  { id:122, clientId:13, date:abs(2025,12,3), status:'completed', services:['Řez stromů','Odvoz odpadu'],                     duration:180, totalPrice:5400, paid:true,  paidDate:abs(2025,12,5), notes:'Brzy ráno — do 7:30.', worker:'Jan Novák' },
  { id:123, clientId:10, date:abs(2025,12,10),status:'completed', services:['Řez stromů','Odvoz odpadu'],                    duration:280, totalPrice:7800, paid:true,  paidDate:abs(2025,12,12),notes:'Precizní řez — architekt.', worker:'Jan Novák' },
  // 2026 — jaro (dokoncene)
  { id:124, clientId:6,  date:abs(2026,3,5),  status:'completed', services:['Sekání trávy','Vertikutace','Hnojení trávníku'], duration:260, totalPrice:7200, paid:true,  paidDate:abs(2026,3,5),  notes:'Jarní start 2026 — zaplaceno hotově.', worker:'Jan Novák' },
  { id:125, clientId:1,  date:abs(2026,3,12), status:'completed', services:['Vertikutace','Hnojení trávníku'],                duration:130, totalPrice:2800, paid:true,  paidDate:abs(2026,3,14), notes:'Jarní vertikutace 2026.', worker:'Jan Novák' },
  { id:126, clientId:7,  date:abs(2026,3,18), status:'completed', services:['Sekání trávy','Výsadba rostlin'],                duration:210, totalPrice:7400, paid:true,  paidDate:abs(2026,3,18), notes:'Hotel — jarní výsadba 2026.', worker:'Jan Novák' },
  { id:127, clientId:2,  date:abs(2026,4,2),  status:'completed', services:['Sekání trávy','Vertikutace','Odvoz odpadu'],     duration:220, totalPrice:5800, paid:true,  paidDate:abs(2026,4,15), notes:'Firemní areál — jarní péče.', worker:'Jan Novák' },
  { id:128, clientId:4,  date:abs(2026,4,8),  status:'completed', services:['Sekání trávy','Mulčování'],                     duration:150, totalPrice:3900, paid:false, paidDate:null,           notes:'Zaslána faktura emailem.', worker:'Jan Novák' },
  { id:129, clientId:9,  date:abs(2026,4,15), status:'completed', services:['Sekání trávy','Zálivka'],                       duration:90,  totalPrice:1900, paid:false, paidDate:null,           notes:'Bez chemie.', worker:'Jan Novák' },
  { id:130, clientId:3,  date:abs(2026,4,22), status:'completed', services:['Sekání trávy'],                                 duration:55,  totalPrice:850,  paid:false, paidDate:null,           notes:'Po splatnosti — zaslat upomínku.', worker:'Jan Novák' },
  // Naplánované — 2026
  { id:131, clientId:6,  date:d(1),  status:'scheduled', services:['Sekání trávy','Stříhání živého plotu','Mulčování'],       duration:260, totalPrice:6800, paid:false, paidDate:null, notes:'Velká zakázka — přijet dříve.', worker:'Jan Novák' },
  { id:132, clientId:1,  date:d(2),  status:'scheduled', services:['Sekání trávy'],                                          duration:100, totalPrice:1400, paid:false, paidDate:null, notes:'', worker:'Jan Novák' },
  { id:133, clientId:7,  date:d(3),  status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                          duration:190, totalPrice:5800, paid:false, paidDate:null, notes:'Hotel — týdenní návštěva.', worker:'Jan Novák' },
  { id:134, clientId:2,  date:d(5),  status:'scheduled', services:['Sekání trávy','Hnojení trávníku'],                       duration:230, totalPrice:6400, paid:false, paidDate:null, notes:'Firemní areál.', worker:'Jan Novák' },
  { id:135, clientId:9,  date:d(6),  status:'scheduled', services:['Sekání trávy','Zálivka'],                                duration:90,  totalPrice:1900, paid:false, paidDate:null, notes:'Bez chemie.', worker:'Jan Novák' },
  { id:136, clientId:13, date:d(7),  status:'scheduled', services:['Sekání trávy','Stříhání keřů','Odvoz odpadu'],           duration:140, totalPrice:3600, paid:false, paidDate:null, notes:'Brzy ráno — do 7:30.', worker:'Jan Novák' },
  { id:137, clientId:5,  date:d(9),  status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                          duration:100, totalPrice:2300, paid:false, paidDate:null, notes:'', worker:'Jan Novák' },
  { id:138, clientId:12, date:d(12), status:'scheduled', services:['Sekání trávy','Odvoz odpadu'],                           duration:270, totalPrice:7200, paid:false, paidDate:null, notes:'Škola — víkendový termín.', worker:'Jan Novák' },
]

// ── Invoices (25 faktur) — 2025/2026 ─────────
export const defaultInvoices = [
  { id:'2025001', orderId:101, clientId:3,  date:abs(2025,3,12), dueDate:abs(2025,3,26), amount:950,  paid:true,  paidDate:abs(2025,3,15) },
  { id:'2025002', orderId:102, clientId:6,  date:abs(2025,3,18), dueDate:abs(2025,4,1),  amount:6800, paid:true,  paidDate:abs(2025,3,18) },
  { id:'2025003', orderId:103, clientId:1,  date:abs(2025,3,25), dueDate:abs(2025,4,8),  amount:2800, paid:true,  paidDate:abs(2025,3,27),
    serviceDetails:[{name:'Vertikutace',qty:200,unit:'m²',pricePerUnit:12,total:2400},{name:'Hnojení trávníku',qty:200,unit:'m²',pricePerUnit:6,total:1200},{name:'Doprava',qty:1,unit:'jízda',pricePerUnit:250,total:250}] },
  { id:'2025004', orderId:104, clientId:7,  date:abs(2025,4,2),  dueDate:abs(2025,4,16), amount:8200, paid:true,  paidDate:abs(2025,4,2)  },
  { id:'2025005', orderId:105, clientId:2,  date:abs(2025,4,8),  dueDate:abs(2025,4,22), amount:5800, paid:true,  paidDate:abs(2025,4,20) },
  { id:'2025006', orderId:106, clientId:4,  date:abs(2025,4,15), dueDate:abs(2025,4,29), amount:3600, paid:true,  paidDate:abs(2025,4,22) },
  { id:'2025007', orderId:108, clientId:9,  date:abs(2025,4,28), dueDate:abs(2025,5,12), amount:1900, paid:true,  paidDate:abs(2025,4,30) },
  { id:'2025008', orderId:109, clientId:6,  date:abs(2025,5,6),  dueDate:abs(2025,5,20), amount:4800, paid:true,  paidDate:abs(2025,5,6)  },
  { id:'2025009', orderId:111, clientId:7,  date:abs(2025,5,20), dueDate:abs(2025,6,3),  amount:5600, paid:true,  paidDate:abs(2025,5,20) },
  { id:'2025010', orderId:112, clientId:2,  date:abs(2025,5,27), dueDate:abs(2025,6,10), amount:5200, paid:true,  paidDate:abs(2025,6,5)  },
  { id:'2025011', orderId:113, clientId:10, date:abs(2025,6,3),  dueDate:abs(2025,6,17), amount:4200, paid:true,  paidDate:abs(2025,6,5)  },
  { id:'2025012', orderId:114, clientId:12, date:abs(2025,6,10), dueDate:abs(2025,6,24), amount:7200, paid:true,  paidDate:abs(2025,6,12) },
  { id:'2025013', orderId:117, clientId:6,  date:abs(2025,9,9),  dueDate:abs(2025,9,23), amount:6200, paid:true,  paidDate:abs(2025,9,9)  },
  { id:'2025014', orderId:119, clientId:7,  date:abs(2025,9,23), dueDate:abs(2025,10,7), amount:5400, paid:true,  paidDate:abs(2025,9,23) },
  { id:'2025015', orderId:120, clientId:2,  date:abs(2025,10,7), dueDate:abs(2025,10,21),amount:7800, paid:true,  paidDate:abs(2025,10,20)},
  { id:'2025016', orderId:121, clientId:12, date:abs(2025,10,18),dueDate:abs(2025,11,1), amount:6800, paid:true,  paidDate:abs(2025,10,20)},
  { id:'2025017', orderId:122, clientId:13, date:abs(2025,12,3), dueDate:abs(2025,12,17),amount:5400, paid:true,  paidDate:abs(2025,12,5) },
  { id:'2025018', orderId:123, clientId:10, date:abs(2025,12,10),dueDate:abs(2025,12,24),amount:7800, paid:true,  paidDate:abs(2025,12,12)},
  { id:'2026001', orderId:124, clientId:6,  date:abs(2026,3,5),  dueDate:abs(2026,3,19), amount:7200, paid:true,  paidDate:abs(2026,3,5)  },
  { id:'2026002', orderId:125, clientId:1,  date:abs(2026,3,12), dueDate:abs(2026,3,26), amount:2800, paid:true,  paidDate:abs(2026,3,14) },
  { id:'2026003', orderId:126, clientId:7,  date:abs(2026,3,18), dueDate:abs(2026,4,1),  amount:7400, paid:true,  paidDate:abs(2026,3,18) },
  { id:'2026004', orderId:127, clientId:2,  date:abs(2026,4,2),  dueDate:abs(2026,4,16), amount:5800, paid:true,  paidDate:abs(2026,4,15) },
  { id:'2026005', orderId:128, clientId:4,  date:abs(2026,4,8),  dueDate:d(4),           amount:3900, paid:false, paidDate:null },
  { id:'2026006', orderId:129, clientId:9,  date:abs(2026,4,15), dueDate:d(8),           amount:1900, paid:false, paidDate:null },
  { id:'2026007', orderId:130, clientId:3,  date:abs(2026,4,22), dueDate:d(-1),          amount:850,  paid:false, paidDate:null },
]

// ── Services ──────────────────────────────────
export const defaultServices = [
  { id:'sekani',  name:'Sekání trávy',           pricePerUnit:8,    unit:'m²',    unitLabel:'za m²'    },
  { id:'kere',    name:'Stříhání keřů',           pricePerUnit:350,  unit:'ks',    unitLabel:'za keř'   },
  { id:'plot',    name:'Stříhání živého plotu',   pricePerUnit:80,   unit:'bm',    unitLabel:'za bm'    },
  { id:'vertik',  name:'Vertikutace',             pricePerUnit:12,   unit:'m²',    unitLabel:'za m²'    },
  { id:'mulc',    name:'Mulčování',               pricePerUnit:15,   unit:'m²',    unitLabel:'za m²'    },
  { id:'odvoz',   name:'Odvoz odpadu',            pricePerUnit:800,  unit:'jízda', unitLabel:'za odvoz' },
  { id:'zavlaha', name:'Zálivka',                 pricePerUnit:400,  unit:'hod',   unitLabel:'za hod'   },
  { id:'stromy',  name:'Řez stromů',              pricePerUnit:900,  unit:'ks',    unitLabel:'za strom' },
  { id:'hnojeni', name:'Hnojení trávníku',        pricePerUnit:6,    unit:'m²',    unitLabel:'za m²'    },
  { id:'listi',   name:'Shrabání listí',          pricePerUnit:500,  unit:'hod',   unitLabel:'za hod'   },
  { id:'vysadba', name:'Výsadba rostlin',         pricePerUnit:200,  unit:'ks',    unitLabel:'za ks'    },
  { id:'postik',  name:'Postřik / chemie',        pricePerUnit:600,  unit:'hod',   unitLabel:'za hod'   },
  { id:'doprava', name:'Doprava',                 pricePerUnit:250,  unit:'jízda', unitLabel:'za jízdu' },
]

// ── Notifications ─────────────────────────────
export const defaultNotifications = [
  { id:1,  type:'overdue',   read:false, time:d(0)+'T07:15', message:'Faktura #2026007 po splatnosti — Procházková (850 Kč)',       action:'invoices' },
  { id:2,  type:'reminder',  read:false, time:d(0)+'T06:00', message:'Zítra zakázka u Horák 09:00 — Šeberov, Ke Křížku 14',        action:'checklist' },
  { id:3,  type:'weather',   read:false, time:d(0)+'T05:30', message:'Déšť v sobotu 80 % — 2 zakázky mohou být ovlivněny',          action:'calendar' },
  { id:4,  type:'reminder',  read:false, time:d(-1)+'T18:00',message:'Hotel Průhonice — zítra týdenní návštěva (5 800 Kč)',         action:'checklist' },
  { id:5,  type:'payment',   read:false, time:d(-1)+'T14:22',message:'Platba přijata: Správa objektů Říčany — 5 800 Kč',           action:'invoices' },
  { id:6,  type:'nocontact', read:false, time:d(-2)+'T09:00',message:'Ing. arch. Blaha bez kontaktu 25 dní — čas na oslovení',     action:'clients'  },
  { id:7,  type:'reminder',  read:true,  time:d(-3)+'T08:00',message:'Kratochvíl — faktura #2026005 splatná za 4 dny',             action:'invoices' },
  { id:8,  type:'review',    read:true,  time:d(-4)+'T16:30',message:'Nové hodnocení: Lucie Horáková dala 5/5 hvězd',              action:'clients'  },
  { id:9,  type:'nocontact', read:true,  time:d(-5)+'T09:00',message:'Martin Vlček bez kontaktu 31 dní',                          action:'clients'  },
  { id:10, type:'payment',   read:true,  time:d(-6)+'T11:15',message:'Platba přijata: Hotel Průhonice — 7 400 Kč',                action:'invoices' },
]

// ── Order templates ───────────────────────────
export const orderTemplates = [
  { id:'standard', name:'Standardní sečení',  services:['Sekání trávy','Doprava'],                                    desc:'Sekání + doprava' },
  { id:'complete', name:'Kompletní údržba',   services:['Sekání trávy','Stříhání keřů','Odvoz odpadu','Doprava'],     desc:'Sekání, keře, odvoz' },
  { id:'spring',   name:'Jarní start',        services:['Sekání trávy','Vertikutace','Hnojení trávníku','Doprava'],   desc:'Vertikutace + hnojení' },
  { id:'hedge',    name:'Živý plot',          services:['Stříhání živého plotu','Odvoz odpadu','Doprava'],            desc:'Stříhání plotu + odvoz' },
  { id:'trees',    name:'Řez stromů',         services:['Řez stromů','Odvoz odpadu','Doprava'],                       desc:'Řez + odvoz' },
  { id:'autumn',   name:'Podzimní úklid',     services:['Shrabání listí','Odvoz odpadu','Mulčování','Doprava'],       desc:'Listí + mulčování' },
]

// ── Monthly revenue 2025–2026 ─────────────────
export const monthlyRevenue = [
  { month:'Led \'25', revenue:22400,  orders:9  },
  { month:'Úno \'25', revenue:15200,  orders:6  },
  { month:'Bře \'25', revenue:41800,  orders:16 },
  { month:'Dub \'25', revenue:58600,  orders:22 },
  { month:'Kvě \'25', revenue:72800,  orders:28 },
  { month:'Čer \'25', revenue:79200,  orders:30 },
  { month:'Čvc \'25', revenue:68400,  orders:26 },
  { month:'Srp \'25', revenue:61200,  orders:24 },
  { month:'Zář \'25', revenue:74600,  orders:29 },
  { month:'Říj \'25', revenue:82800,  orders:32 },
  { month:'Lis \'25', revenue:34200,  orders:13 },
  { month:'Pro \'25', revenue:28600,  orders:11 },
  { month:'Led \'26', revenue:18400,  orders:7  },
  { month:'Úno \'26', revenue:12200,  orders:5  },
  { month:'Bře \'26', revenue:52200,  orders:20 },
  { month:'Dub \'26', revenue:21350,  orders:8  },
]

// ── Styles ────────────────────────────────────
export const TAG_STYLES = {
  'pravidelný':  'bg-green-50 text-green-700 border-green-200',
  'vip':         'bg-amber-50 text-amber-700 border-amber-200',
  'firemní':     'bg-blue-50 text-blue-700 border-blue-200',
  'nový':        'bg-sky-50 text-sky-700 border-sky-200',
  'jednorázový': 'bg-gray-100 text-gray-600 border-gray-200',
}
export const STATUS_STYLES = {
  completed:  { dot:'bg-green-500',  pill:'bg-green-50 text-green-700 border-green-200',  label:'Dokončeno'   },
  scheduled:  { dot:'bg-blue-500',   pill:'bg-blue-50 text-blue-700 border-blue-200',     label:'Naplánováno' },
  inprogress: { dot:'bg-amber-500',  pill:'bg-amber-50 text-amber-700 border-amber-200',  label:'Probíhá'     },
  cancelled:  { dot:'bg-gray-400',   pill:'bg-gray-100 text-gray-600 border-gray-200',    label:'Zrušeno'     },
  active:     { dot:'bg-green-500',  pill:'bg-green-50 text-green-700 border-green-200',  label:'Aktivní'     },
  inactive:   { dot:'bg-gray-400',   pill:'bg-gray-100 text-gray-600 border-gray-200',    label:'Neaktivní'   },
}

// ── Recurring intervals ───────────────────────
export const recurringIntervals = [
  { value:'7',  label:'Každý týden'     },
  { value:'14', label:'Každé 2 týdny'   },
  { value:'21', label:'Každé 3 týdny'   },
  { value:'28', label:'Každý měsíc'     },
  { value:'42', label:'Každých 6 týdnů' },
]
