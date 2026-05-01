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
  { id:101, clientId:3,  date:abs(2025,3,12), status:'completed', services:['Sekání trávy','Zálivka'],                          duration:65,  totalPrice:950,  paid:true,  paidDate:abs(2025,3,15), notes:'Zálivka ovocných stromků.', worker:'Tomáš Zelený', workerId:2 },
  { id:102, clientId:6,  date:abs(2025,3,18), status:'completed', services:['Sekání trávy','Stříhání živého plotu','Mulčování'], duration:260, totalPrice:6800, paid:true,  paidDate:abs(2025,3,18), notes:'Zaplaceno hotově na místě.', worker:'Jan Novák', workerId:1 },
  { id:103, clientId:1,  date:abs(2025,3,25), status:'completed', services:['Vertikutace','Hnojení trávníku'],                  duration:130, totalPrice:2800, paid:true,  paidDate:abs(2025,3,27), notes:'Jarní vertikutace a hnojení.', worker:'Tomáš Zelený', workerId:2 },
  { id:104, clientId:7,  date:abs(2025,4,2),  status:'completed', services:['Sekání trávy','Stříhání keřů','Výsadba rostlin'],  duration:230, totalPrice:8200, paid:true,  paidDate:abs(2025,4,2),  notes:'Hotelová zahrada — sezónní výsadba letniček.', worker:'Tomáš Zelený', workerId:2 },
  { id:105, clientId:2,  date:abs(2025,4,8),  status:'completed', services:['Sekání trávy','Vertikutace','Odvoz odpadu'],       duration:220, totalPrice:5800, paid:true,  paidDate:abs(2025,4,20), notes:'Firemní areál, velká plocha.', worker:'Jan Novák', workerId:1 },
  { id:106, clientId:4,  date:abs(2025,4,15), status:'completed', services:['Sekání trávy','Odvoz odpadu'],                    duration:160, totalPrice:3600, paid:true,  paidDate:abs(2025,4,22), notes:'Nafocen stav zahrady před a po.', worker:'Tomáš Zelený', workerId:2 },
  { id:107, clientId:8,  date:abs(2025,4,22), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:95,  totalPrice:2100, paid:true,  paidDate:abs(2025,4,25), notes:'', worker:'Tomáš Zelený', workerId:2 },
  { id:108, clientId:9,  date:abs(2025,4,28), status:'completed', services:['Sekání trávy','Hnojení trávníku'],                duration:90,  totalPrice:1900, paid:true,  paidDate:abs(2025,4,30), notes:'Bez chemie — organické hnojivo.', worker:'Jan Novák', workerId:1 },
  // 2025 — léto
  { id:109, clientId:6,  date:abs(2025,5,6),  status:'completed', services:['Sekání trávy','Stříhání živého plotu'],           duration:190, totalPrice:4800, paid:true,  paidDate:abs(2025,5,6),  notes:'Zaplaceno hotově.', worker:'Tomáš Zelený', workerId:2 },
  { id:110, clientId:1,  date:abs(2025,5,14), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:100, totalPrice:2200, paid:true,  paidDate:abs(2025,5,16), notes:'', worker:'Tomáš Zelený', workerId:2 },
  { id:111, clientId:7,  date:abs(2025,5,20), status:'completed', services:['Sekání trávy','Stříhání živého plotu'],           duration:190, totalPrice:5600, paid:true,  paidDate:abs(2025,5,20), notes:'Hotel — letní údržba vstupu.', worker:'Jan Novák', workerId:1 },
  { id:112, clientId:2,  date:abs(2025,5,27), status:'completed', services:['Sekání trávy','Stříhání keřů','Zálivka'],        duration:210, totalPrice:5200, paid:true,  paidDate:abs(2025,6,5),  notes:'', worker:'Tomáš Zelený', workerId:2 },
  { id:113, clientId:10, date:abs(2025,6,3),  status:'completed', services:['Sekání trávy','Výsadba rostlin'],                duration:140, totalPrice:4200, paid:true,  paidDate:abs(2025,6,5),  notes:'Výsadba trvalkového záhonu.', worker:'Tomáš Zelený', workerId:2 },
  { id:114, clientId:12, date:abs(2025,6,10), status:'completed', services:['Sekání trávy','Odvoz odpadu'],                   duration:270, totalPrice:7200, paid:true,  paidDate:abs(2025,6,12), notes:'Školní hřiště a zahrada — letní úklid.', worker:'Jan Novák', workerId:1 },
  { id:115, clientId:3,  date:abs(2025,6,17), status:'completed', services:['Sekání trávy'],                                  duration:55,  totalPrice:850,  paid:true,  paidDate:abs(2025,6,19), notes:'', worker:'Tomáš Zelený', workerId:2 },
  { id:116, clientId:5,  date:abs(2025,6,24), status:'completed', services:['Sekání trávy','Stříhání keřů'],                  duration:100, totalPrice:2300, paid:true,  paidDate:abs(2025,6,26), notes:'', worker:'Tomáš Zelený', workerId:2 },
  // 2025 — podzim
  { id:117, clientId:6,  date:abs(2025,9,9),  status:'completed', services:['Shrabání listí','Mulčování','Odvoz odpadu'],      duration:240, totalPrice:6200, paid:true,  paidDate:abs(2025,9,9),  notes:'Podzimní úklid — zaplaceno hotově.', worker:'Jan Novák', workerId:1 },
  { id:118, clientId:1,  date:abs(2025,9,16), status:'completed', services:['Shrabání listí','Stříhání keřů'],                duration:110, totalPrice:2500, paid:true,  paidDate:abs(2025,9,18), notes:'', worker:'Tomáš Zelený', workerId:2 },
  { id:119, clientId:7,  date:abs(2025,9,23), status:'completed', services:['Shrabání listí','Odvoz odpadu'],                 duration:200, totalPrice:5400, paid:true,  paidDate:abs(2025,9,23), notes:'Hotel — podzimní příprava.', worker:'Tomáš Zelený', workerId:2 },
  { id:120, clientId:2,  date:abs(2025,10,7), status:'completed', services:['Shrabání listí','Mulčování','Odvoz odpadu'],     duration:300, totalPrice:7800, paid:true,  paidDate:abs(2025,10,20),notes:'Firemní areál — kompletní podzimní úklid.', worker:'Jan Novák', workerId:1 },
  { id:121, clientId:12, date:abs(2025,10,18),status:'completed', services:['Shrabání listí','Sekání trávy'],                 duration:270, totalPrice:6800, paid:true,  paidDate:abs(2025,10,20),notes:'Škola — podzimní úklid hřiště.', worker:'Tomáš Zelený', workerId:2 },
  // 2025 — zima / řez stromů
  { id:122, clientId:13, date:abs(2025,12,3), status:'completed', services:['Řez stromů','Odvoz odpadu'],                     duration:180, totalPrice:5400, paid:true,  paidDate:abs(2025,12,5), notes:'Brzy ráno — do 7:30.', worker:'Tomáš Zelený', workerId:2 },
  { id:123, clientId:10, date:abs(2025,12,10),status:'completed', services:['Řez stromů','Odvoz odpadu'],                    duration:280, totalPrice:7800, paid:true,  paidDate:abs(2025,12,12),notes:'Precizní řez — architekt.', worker:'Jan Novák', workerId:1 },
  // 2026 — jaro (dokoncene)
  { id:124, clientId:6,  date:abs(2026,3,5),  status:'completed', services:['Sekání trávy','Vertikutace','Hnojení trávníku'], duration:260, totalPrice:7200, paid:true,  paidDate:abs(2026,3,5),  notes:'Jarní start 2026 — zaplaceno hotově.', worker:'Tomáš Zelený', workerId:2 },
  { id:125, clientId:1,  date:abs(2026,3,12), status:'completed', services:['Vertikutace','Hnojení trávníku'],                duration:130, totalPrice:2800, paid:true,  paidDate:abs(2026,3,14), notes:'Jarní vertikutace 2026.', worker:'Tomáš Zelený', workerId:2 },
  { id:126, clientId:7,  date:abs(2026,3,18), status:'completed', services:['Sekání trávy','Výsadba rostlin'],                duration:210, totalPrice:7400, paid:true,  paidDate:abs(2026,3,18), notes:'Hotel — jarní výsadba 2026.', worker:'Jan Novák', workerId:1 },
  { id:127, clientId:2,  date:abs(2026,4,2),  status:'completed', services:['Sekání trávy','Vertikutace','Odvoz odpadu'],     duration:220, totalPrice:5800, paid:true,  paidDate:abs(2026,4,15), notes:'Firemní areál — jarní péče.', worker:'Tomáš Zelený', workerId:2 },
  { id:128, clientId:4,  date:abs(2026,4,8),  status:'completed', services:['Sekání trávy','Mulčování'],                     duration:150, totalPrice:3900, paid:false, paidDate:null,           notes:'Zaslána faktura emailem.', worker:'Tomáš Zelený', workerId:2 },
  { id:129, clientId:9,  date:abs(2026,4,15), status:'completed', services:['Sekání trávy','Zálivka'],                       duration:90,  totalPrice:1900, paid:false, paidDate:null,           notes:'Bez chemie.', worker:'Jan Novák', workerId:1 },
  { id:130, clientId:3,  date:abs(2026,4,22), status:'completed', services:['Sekání trávy'],                                 duration:55,  totalPrice:850,  paid:false, paidDate:null,           notes:'Po splatnosti — zaslat upomínku.', worker:'Jan Novák' },
  // Naplánované — 2026
  { id:131, clientId:6,  date:d(1),  status:'scheduled', services:['Sekání trávy','Stříhání živého plotu','Mulčování'],       duration:260, totalPrice:6800, paid:false, paidDate:null, notes:'Velká zakázka — přijet dříve.', worker:'Tomáš Zelený', workerId:2 },
  { id:132, clientId:1,  date:d(2),  status:'scheduled', services:['Sekání trávy'],                                          duration:100, totalPrice:1400, paid:false, paidDate:null, notes:'', worker:'Jan Novák', workerId:1 },
  { id:133, clientId:7,  date:d(3),  status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                          duration:190, totalPrice:5800, paid:false, paidDate:null, notes:'Hotel — týdenní návštěva.', worker:'Tomáš Zelený', workerId:2 },
  { id:134, clientId:2,  date:d(5),  status:'scheduled', services:['Sekání trávy','Hnojení trávníku'],                       duration:230, totalPrice:6400, paid:false, paidDate:null, notes:'Firemní areál.', worker:'Jan Novák', workerId:1 },
  { id:135, clientId:9,  date:d(6),  status:'scheduled', services:['Sekání trávy','Zálivka'],                                duration:90,  totalPrice:1900, paid:false, paidDate:null, notes:'Bez chemie.', worker:'Tomáš Zelený', workerId:2 },
  { id:136, clientId:13, date:d(7),  status:'scheduled', services:['Sekání trávy','Stříhání keřů','Odvoz odpadu'],           duration:140, totalPrice:3600, paid:false, paidDate:null, notes:'Brzy ráno — do 7:30.', worker:'Jan Novák', workerId:1 },
  { id:137, clientId:5,  date:d(9),  status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                          duration:100, totalPrice:2300, paid:false, paidDate:null, notes:'', worker:'Tomáš Zelený', workerId:2 },
  { id:138, clientId:12, date:d(12), status:'scheduled', services:['Sekání trávy','Odvoz odpadu'],                           duration:270, totalPrice:7200, paid:false, paidDate:null, notes:'Škola — víkendový termín.', worker:'Jan Novák', workerId:1 },
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


// ── Products (30 polozek) ─────────────────────
export const productCategories = [
  { id:'substraty', label:'Substráty a kůra', color:'bg-amber-50 text-amber-700 border-amber-200' },
  { id:'hnojiva',   label:'Hnojiva',           color:'bg-green-50 text-green-700 border-green-200' },
  { id:'osiva',     label:'Osiva a sadba',     color:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id:'rostliny',  label:'Rostliny',          color:'bg-rose-50 text-rose-700 border-rose-200' },
  { id:'naradi',    label:'Nářadí',            color:'bg-blue-50 text-blue-700 border-blue-200' },
  { id:'doplnky',   label:'Doplňky',           color:'bg-purple-50 text-purple-700 border-purple-200' },
]

export const defaultProducts = [
  // Substráty a kůra
  { id:1,  name:'Mulčovací kůra borová',     category:'substraty', unit:'pytel 70 l',  price:180,  stock:48,  minStock:10, supplier:'AGRO CS',          sku:'MK-BO-70',  desc:'Borová kůra hrubá frakce, 70 litrů' },
  { id:2,  name:'Mulčovací kůra dekorativní',category:'substraty', unit:'pytel 70 l',  price:240,  stock:22,  minStock:10, supplier:'AGRO CS',          sku:'MK-DEK-70', desc:'Dekorativní červenohnědá kůra' },
  { id:3,  name:'Zahradní substrát univerzální',category:'substraty', unit:'pytel 50 l',price:120,  stock:65,  minStock:15, supplier:'Florcom',          sku:'SU-UNI-50', desc:'Univerzální substrát pro zahradní výsadbu' },
  { id:4,  name:'Substrát pro rajčata',       category:'substraty', unit:'pytel 40 l',  price:160,  stock:18,  minStock:8,  supplier:'Florcom',          sku:'SU-RAJ-40', desc:'Speciální substrát pro pěstování rajčat' },
  { id:5,  name:'Rašelinový substrát kyselý', category:'substraty', unit:'pytel 70 l',  price:280,  stock:12,  minStock:5,  supplier:'AGRO CS',          sku:'SU-RAS-70', desc:'Pro rododendrony, azalky, vřesy' },
  { id:6,  name:'Kompost zralý',              category:'substraty', unit:'pytel 40 l',  price:140,  stock:32,  minStock:10, supplier:'Komposta s.r.o.',  sku:'KO-ZR-40',  desc:'Zralý kompost pro vylepšení půdy' },

  // Hnojiva
  { id:7,  name:'Hnojivo na trávník BoFix',   category:'hnojiva',   unit:'5 kg',        price:520,  stock:24,  minStock:8,  supplier:'COMPO',            sku:'HN-BFX-5',  desc:'Hnojivo proti plevelu a mechu' },
  { id:8,  name:'Cereiit komplexní hnojivo',  category:'hnojiva',   unit:'10 kg',       price:780,  stock:15,  minStock:5,  supplier:'AGRO CS',          sku:'HN-CER-10', desc:'Komplexní NPK hnojivo' },
  { id:9,  name:'Kapalné hnojivo na květiny', category:'hnojiva',   unit:'1 l',         price:180,  stock:42,  minStock:12, supplier:'COMPO',            sku:'HN-KVE-1',  desc:'Pro pokojové i zahradní květiny' },
  { id:10, name:'Hnojivo na jehličnany',      category:'hnojiva',   unit:'2,5 kg',      price:340,  stock:8,   minStock:6,  supplier:'COMPO',            sku:'HN-JEH-2',  desc:'Speciální pro jehličnany' },
  { id:11, name:'Vápno dolomitické',          category:'hnojiva',   unit:'25 kg',       price:240,  stock:18,  minStock:6,  supplier:'AGRO CS',          sku:'HN-VAP-25', desc:'Pro úpravu pH půdy' },
  { id:12, name:'Hnojivo na rajčata',         category:'hnojiva',   unit:'1 kg',        price:140,  stock:35,  minStock:10, supplier:'Floraservis',     sku:'HN-RAJ-1',  desc:'Pro rajčata, papriky a okurky' },
  { id:13, name:'Železo chelát',              category:'hnojiva',   unit:'250 g',       price:280,  stock:14,  minStock:5,  supplier:'COMPO',            sku:'HN-FE-250', desc:'Proti chloróze rostlin' },

  // Osiva a sadba
  { id:14, name:'Travní semeno univerzální',  category:'osiva',     unit:'1 kg',        price:280,  stock:55,  minStock:15, supplier:'OSEVA UNI',        sku:'OS-TRA-1',  desc:'Univerzální směs pro běžné použití' },
  { id:15, name:'Travní semeno hřišťové',     category:'osiva',     unit:'10 kg',       price:2200, stock:6,   minStock:3,  supplier:'OSEVA UNI',        sku:'OS-HRI-10', desc:'Pro sportovní plochy' },
  { id:16, name:'Travní semeno do stínu',     category:'osiva',     unit:'1 kg',        price:340,  stock:28,  minStock:8,  supplier:'OSEVA UNI',        sku:'OS-STI-1',  desc:'Pro stinné lokace' },
  { id:17, name:'Letnicková směs polní',      category:'osiva',     unit:'500 g',       price:220,  stock:16,  minStock:5,  supplier:'Semo',             sku:'OS-LET-05', desc:'Barevná letnicková směs' },
  { id:18, name:'Cibule tulipánů (mix)',      category:'osiva',     unit:'25 ks',       price:180,  stock:0,   minStock:10, supplier:'Floraservis',      sku:'OS-TUL-25', desc:'Mix barev tulipánů' },

  // Rostliny
  { id:19, name:'Tuje smaragd 80 cm',         category:'rostliny',  unit:'ks',          price:380,  stock:25,  minStock:5,  supplier:'Školka Litomyšl',  sku:'RO-TS-80',  desc:'Tuje smaragd výška 80 cm' },
  { id:20, name:'Buxus sempervirens 30 cm',   category:'rostliny',  unit:'ks',          price:240,  stock:18,  minStock:5,  supplier:'Školka Litomyšl',  sku:'RO-BX-30',  desc:'Pravý buxus 30 cm' },
  { id:21, name:'Levandule lékařská',         category:'rostliny',  unit:'ks K11',      price:120,  stock:40,  minStock:10, supplier:'Bylinky CZ',       sku:'RO-LEV-K11',desc:'Levandule v květináči K11' },
  { id:22, name:'Růže keřová červená',        category:'rostliny',  unit:'ks K3',       price:280,  stock:14,  minStock:4,  supplier:'Růžová zahrada',   sku:'RO-RU-CRV', desc:'Keřová růže červená' },
  { id:23, name:'Hortenzie velkolistá',       category:'rostliny',  unit:'ks K5',       price:340,  stock:10,  minStock:3,  supplier:'Školka Litomyšl',  sku:'RO-HOR-K5', desc:'Modrá hortenzie K5' },

  // Nářadí
  { id:24, name:'Zahradní nůžky FELCO 6',     category:'naradi',    unit:'ks',          price:1280, stock:4,   minStock:2,  supplier:'FELCO',            sku:'NA-FE-6',   desc:'Profi zahradní nůžky' },
  { id:25, name:'Hrábě listové',              category:'naradi',    unit:'ks',          price:380,  stock:12,  minStock:3,  supplier:'Fiskars',          sku:'NA-HR-L',   desc:'Plastové hrábě na listí' },
  { id:26, name:'Rýč ostrý',                  category:'naradi',    unit:'ks',          price:520,  stock:8,   minStock:3,  supplier:'Fiskars',          sku:'NA-RY-OS',  desc:'Kovaný rýč s násadou' },
  { id:27, name:'Plečka ruční',               category:'naradi',    unit:'ks',          price:180,  stock:15,  minStock:5,  supplier:'AGRO CS',          sku:'NA-PL-R',   desc:'Plečka pro pletí záhonů' },

  // Doplňky
  { id:28, name:'Geotextilie 1×10 m',         category:'doplnky',   unit:'role',        price:340,  stock:22,  minStock:6,  supplier:'AGRO CS',          sku:'DO-GEO-110',desc:'Mulčovací netkaná textilie' },
  { id:29, name:'Zahradní hadice 25 m',       category:'doplnky',   unit:'ks',          price:680,  stock:6,   minStock:2,  supplier:'GARDENA',          sku:'DO-HAD-25', desc:'Profi zahradní hadice' },
  { id:30, name:'Postřikovač zahradní 5 l',   category:'doplnky',   unit:'ks',          price:520,  stock:10,  minStock:3,  supplier:'GARDENA',          sku:'DO-PO-5',   desc:'Tlakový postřikovač' },
]


// ── Suppliers (10 dodavatelu) ─────────────────
export const supplierCategories = [
  { id:'substraty', label:'Substráty', color:'bg-amber-50 text-amber-700 border-amber-200'  },
  { id:'hnojiva',   label:'Hnojiva',   color:'bg-green-50 text-green-700 border-green-200'  },
  { id:'osiva',     label:'Osiva',     color:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id:'rostliny',  label:'Rostliny',  color:'bg-rose-50 text-rose-700 border-rose-200'    },
  { id:'naradi',    label:'Nářadí',    color:'bg-blue-50 text-blue-700 border-blue-200'    },
  { id:'doplnky',   label:'Doplňky',   color:'bg-purple-50 text-purple-700 border-purple-200' },
  { id:'velkoobchod', label:'Velkoobchod', color:'bg-gray-100 text-gray-700 border-gray-200' },
]

export const defaultSuppliers = [
  {
    id:1,
    name:'AGRO CS a.s.',
    contactPerson:'Ing. Petr Novák',
    phone:'+420 491 401 001',
    email:'objednavky@agrocs.cz',
    web:'www.agrocs.cz',
    address:'Říkov 265, 552 03 Česká Skalice',
    ico:'64829413',
    dic:'CZ64829413',
    bank:'12345678/0100',
    categories:['substraty','hnojiva','doplnky','velkoobchod'],
    paymentTerms:'14 dní',
    deliveryTime:'2-3 dny',
    rating:5,
    favorite:true,
    notes:'Hlavní velkoobchod. Při odběru nad 5 000 Kč doprava zdarma. Sleva 8 % při platbě předem.',
    minOrder:1500,
    discount:8,
  },
  {
    id:2,
    name:'COMPO Praha s.r.o.',
    contactPerson:'Mgr. Jana Dvořáková',
    phone:'+420 224 815 500',
    email:'praha@compo.cz',
    web:'www.compo-expert.cz',
    address:'Korunní 810/104, Praha 10',
    ico:'25745204',
    dic:'CZ25745204',
    bank:'987654321/0300',
    categories:['hnojiva','doplnky'],
    paymentTerms:'30 dní',
    deliveryTime:'3-5 dnů',
    rating:5,
    favorite:true,
    notes:'Profi hnojiva pro náročné klienty. Akce každé jaro a podzim.',
    minOrder:2000,
    discount:5,
  },
  {
    id:3,
    name:'Florcom CZ',
    contactPerson:'Tomáš Kratochvíl',
    phone:'+420 327 511 222',
    email:'info@florcom.cz',
    web:'www.florcom.cz',
    address:'Průmyslová 1234, Kolín',
    ico:'27123456',
    dic:'CZ27123456',
    bank:'2345678/2010',
    categories:['substraty'],
    paymentTerms:'14 dní',
    deliveryTime:'2 dny',
    rating:4,
    favorite:false,
    notes:'Specialista na substráty. Vlastní výroba.',
    minOrder:1000,
    discount:0,
  },
  {
    id:4,
    name:'Školka Litomyšl',
    contactPerson:'Pavel Horák',
    phone:'+420 461 612 543',
    email:'objednavky@skolkalitomysl.cz',
    web:'www.skolkalitomysl.cz',
    address:'Zahradnická 45, Litomyšl',
    ico:'18472563',
    dic:'CZ18472563',
    bank:'56789012/0800',
    categories:['rostliny'],
    paymentTerms:'7 dní',
    deliveryTime:'5-7 dnů',
    rating:5,
    favorite:true,
    notes:'Kvalitní rostliny — tuje, buxusy, ozdobné keře. Při odběru 50+ ks sleva 12 %.',
    minOrder:3000,
    discount:12,
  },
  {
    id:5,
    name:'OSEVA UNI a.s.',
    contactPerson:'Ing. Marie Bártová',
    phone:'+420 572 654 100',
    email:'oseva@oseva.cz',
    web:'www.oseva-uni.cz',
    address:'Selecká 365, Choryně',
    ico:'48533084',
    dic:'CZ48533084',
    bank:'34567890/0100',
    categories:['osiva'],
    paymentTerms:'14 dní',
    deliveryTime:'3-4 dny',
    rating:4,
    favorite:false,
    notes:'Profesionální osiva trav. Velký výběr směsí.',
    minOrder:2500,
    discount:5,
  },
  {
    id:6,
    name:'FELCO Distribuce',
    contactPerson:'Robert Šimánek',
    phone:'+420 602 333 111',
    email:'info@felco.cz',
    web:'www.felco.com',
    address:'Strojírenská 22, Brno',
    ico:'29384756',
    dic:'CZ29384756',
    bank:'45678901/2700',
    categories:['naradi'],
    paymentTerms:'30 dní',
    deliveryTime:'1-2 dny',
    rating:5,
    favorite:false,
    notes:'Švýcarská kvalita nářadí. Certifikovaný distributor.',
    minOrder:0,
    discount:0,
  },
  {
    id:7,
    name:'GARDENA Česká republika',
    contactPerson:'Lucie Svobodová',
    phone:'+420 222 411 999',
    email:'b2b@gardena.cz',
    web:'www.gardena.com',
    address:'Husitská 42, Praha 3',
    ico:'47245691',
    dic:'CZ47245691',
    bank:'67890123/0300',
    categories:['naradi','doplnky'],
    paymentTerms:'21 dní',
    deliveryTime:'2-3 dny',
    rating:4,
    favorite:false,
    notes:'Zavlažovací systémy a zahradní technika.',
    minOrder:5000,
    discount:10,
  },
  {
    id:8,
    name:'Bylinky CZ s.r.o.',
    contactPerson:'Eva Horáková',
    phone:'+420 731 444 222',
    email:'pestitel@bylinky.cz',
    web:'www.bylinky-cz.cz',
    address:'Polní 18, Olomouc',
    ico:'08765432',
    dic:'CZ08765432',
    bank:'78901234/2010',
    categories:['rostliny'],
    paymentTerms:'14 dní',
    deliveryTime:'4-6 dnů',
    rating:4,
    favorite:false,
    notes:'Bylinky a aromatické rostliny. Vlastní pěstování.',
    minOrder:800,
    discount:0,
  },
  {
    id:9,
    name:'Komposta s.r.o.',
    contactPerson:'Martin Vlček',
    phone:'+420 311 555 888',
    email:'kompost@komposta.cz',
    web:'www.komposta.cz',
    address:'Skládková 1, Beroun',
    ico:'24681357',
    dic:'CZ24681357',
    bank:'89012345/0800',
    categories:['substraty','doplnky'],
    paymentTerms:'7 dní',
    deliveryTime:'1-2 dny',
    rating:3,
    favorite:false,
    notes:'Místní zdroj kompostu. Lze odebírat i ve velkém volně.',
    minOrder:0,
    discount:0,
  },
  {
    id:10,
    name:'Floraservis Praha',
    contactPerson:'Dagmar Kopecká',
    phone:'+420 281 962 050',
    email:'sklad@floraservis.cz',
    web:'www.floraservis.cz',
    address:'Velkoobchodní 8, Praha-Letňany',
    ico:'13579246',
    dic:'CZ13579246',
    bank:'90123456/2700',
    categories:['osiva','rostliny','hnojiva','velkoobchod'],
    paymentTerms:'21 dní',
    deliveryTime:'2-4 dny',
    rating:4,
    favorite:true,
    notes:'Univerzální velkoobchod, široký sortiment. Online katalog s aktuálními cenami.',
    minOrder:1500,
    discount:7,
  },
]


// ── Receipts (uctenky) ────────────────────────
export const receiptCategories = [
  { id:'substraty',  label:'Substráty a kůra', icon:'🌱', color:'bg-amber-50 text-amber-700 border-amber-200'  },
  { id:'hnojiva',    label:'Hnojiva',           icon:'🌿', color:'bg-green-50 text-green-700 border-green-200'  },
  { id:'osiva',      label:'Osiva a sadba',     icon:'🌾', color:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id:'rostliny',   label:'Rostliny',          icon:'🌳', color:'bg-rose-50 text-rose-700 border-rose-200'    },
  { id:'naradi',     label:'Nářadí',            icon:'🛠️', color:'bg-blue-50 text-blue-700 border-blue-200'    },
  { id:'palivo',     label:'Palivo',            icon:'⛽', color:'bg-red-50 text-red-700 border-red-200'      },
  { id:'doplnky',    label:'Drobný materiál',   icon:'📦', color:'bg-purple-50 text-purple-700 border-purple-200' },
  { id:'ostatni',    label:'Ostatní',           icon:'🧾', color:'bg-gray-100 text-gray-700 border-gray-200'   },
]

export const paymentMethods = [
  { id:'card',     label:'Karta'    },
  { id:'cash',     label:'Hotově'   },
  { id:'transfer', label:'Převodem' },
]

export const defaultReceipts = [
  // 2026 — recent receipts linked to scheduled/completed orders
  { id:1, date:abs(2026,4,28), supplier:'AGRO CS a.s.', supplierId:1, category:'substraty', amount:1620, paymentMethod:'card',
    description:'Mulčovací kůra borová 9 ks',
    items:[{name:'Mulčovací kůra borová', qty:9, pricePerUnit:180, total:1620}],
    clientId:6, orderId:131, rebill:true, rebilled:false, margin:15,
    notes:'Pro velkou zahradu Šimánek — Velké Popovice',
    photo:true, fakeImage:'mock-receipt-1' },

  { id:2, date:abs(2026,4,27), supplier:'COMPO Praha s.r.o.', supplierId:2, category:'hnojiva', amount:780, paymentMethod:'transfer',
    description:'Cereiit komplexní hnojivo 10 kg',
    items:[{name:'Cereiit komplexní hnojivo', qty:1, pricePerUnit:780, total:780}],
    clientId:1, orderId:132, rebill:true, rebilled:false, margin:20,
    notes:'Pro Horák — jarní hnojení trávníku',
    photo:true, fakeImage:'mock-receipt-2' },

  { id:3, date:abs(2026,4,25), supplier:'Školka Litomyšl', supplierId:4, category:'rostliny', amount:3800, paymentMethod:'card',
    description:'Tuje smaragd 80 cm — 10 ks',
    items:[{name:'Tuje smaragd 80 cm', qty:10, pricePerUnit:380, total:3800}],
    clientId:7, orderId:133, rebill:true, rebilled:false, margin:25,
    notes:'Hotelová zahrada Průhonice — výsadba živého plotu',
    photo:true, fakeImage:'mock-receipt-3' },

  { id:4, date:abs(2026,4,24), supplier:'OMV Říčany', supplierId:null, category:'palivo', amount:1850, paymentMethod:'card',
    description:'Nafta — služební vůz',
    items:[{name:'Nafta', qty:42.5, pricePerUnit:43.5, total:1849}],
    clientId:null, orderId:null, rebill:false, rebilled:false, margin:0,
    notes:'Týdenní tankování',
    photo:true, fakeImage:'mock-receipt-4' },

  { id:5, date:abs(2026,4,22), supplier:'OSEVA UNI a.s.', supplierId:5, category:'osiva', amount:340, paymentMethod:'card',
    description:'Travní semeno do stínu 1 kg',
    items:[{name:'Travní semeno do stínu', qty:1, pricePerUnit:340, total:340}],
    clientId:5, orderId:null, rebill:true, rebilled:false, margin:10,
    notes:'Pro Bártová — dosetí pod ovocnými stromy',
    photo:true, fakeImage:'mock-receipt-5' },

  { id:6, date:abs(2026,4,20), supplier:'GARDENA', supplierId:7, category:'naradi', amount:680, paymentMethod:'transfer',
    description:'Zahradní hadice 25 m — náhrada',
    items:[{name:'Zahradní hadice 25 m', qty:1, pricePerUnit:680, total:680}],
    clientId:null, orderId:null, rebill:false, rebilled:false, margin:0,
    notes:'Stará praskla — režie',
    photo:true, fakeImage:'mock-receipt-6' },

  { id:7, date:abs(2026,4,18), supplier:'AGRO CS a.s.', supplierId:1, category:'substraty', amount:480, paymentMethod:'cash',
    description:'Mulčovací kůra dekorativní 2 ks',
    items:[{name:'Mulčovací kůra dekorativní', qty:2, pricePerUnit:240, total:480}],
    clientId:9, orderId:135, rebill:true, rebilled:false, margin:15,
    notes:'Pro Horáková Sulice — okrasné záhony',
    photo:true, fakeImage:'mock-receipt-7' },

  { id:8, date:abs(2026,4,15), supplier:'Floraservis Praha', supplierId:10, category:'hnojiva', amount:1240, paymentMethod:'card',
    description:'Hnojivo na trávník BoFix + kapalné na květiny',
    items:[
      {name:'Hnojivo BoFix 5 kg', qty:2, pricePerUnit:520, total:1040},
      {name:'Kapalné hnojivo na květiny 1 l', qty:1, pricePerUnit:200, total:200},
    ],
    clientId:2, orderId:134, rebill:true, rebilled:true, margin:20,
    notes:'Refakturováno do faktury #2026004',
    photo:true, fakeImage:'mock-receipt-8' },

  { id:9, date:abs(2026,4,12), supplier:'Hornbach Praha', supplierId:null, category:'doplnky', amount:340, paymentMethod:'card',
    description:'Drobný materiál — provázek, hřebíky, lepidlo',
    items:[
      {name:'Provázek zahradní', qty:2, pricePerUnit:80, total:160},
      {name:'Hřebíky 100 mm', qty:1, pricePerUnit:120, total:120},
      {name:'Lepidlo Pattex', qty:1, pricePerUnit:60, total:60},
    ],
    clientId:null, orderId:null, rebill:false, rebilled:false, margin:0,
    notes:'Drobnosti do dílny',
    photo:true, fakeImage:'mock-receipt-9' },

  { id:10, date:abs(2026,4,10), supplier:'Komposta s.r.o.', supplierId:9, category:'substraty', amount:560, paymentMethod:'cash',
    description:'Kompost zralý 4 pytle',
    items:[{name:'Kompost zralý', qty:4, pricePerUnit:140, total:560}],
    clientId:4, orderId:128, rebill:true, rebilled:true, margin:0,
    notes:'Pro Kratochvíl — refakturováno bez marže',
    photo:true, fakeImage:'mock-receipt-10' },

  { id:11, date:abs(2026,4,8), supplier:'OMV Praha-východ', supplierId:null, category:'palivo', amount:1620, paymentMethod:'card',
    description:'Nafta — služební vůz',
    items:[{name:'Nafta', qty:37.2, pricePerUnit:43.5, total:1618}],
    clientId:null, orderId:null, rebill:false, rebilled:false, margin:0,
    notes:'',
    photo:true, fakeImage:'mock-receipt-11' },

  { id:12, date:abs(2026,4,5), supplier:'Bylinky CZ s.r.o.', supplierId:8, category:'rostliny', amount:1200, paymentMethod:'transfer',
    description:'Levandule lékařská 10 ks',
    items:[{name:'Levandule lékařská K11', qty:10, pricePerUnit:120, total:1200}],
    clientId:10, orderId:null, rebill:true, rebilled:false, margin:30,
    notes:'Pro Blaha — bylinková zahrada',
    photo:true, fakeImage:'mock-receipt-12' },

  // 2025 — historical
  { id:13, date:abs(2025,10,15), supplier:'AGRO CS a.s.', supplierId:1, category:'substraty', amount:2160, paymentMethod:'transfer',
    description:'Mulčovací kůra borová 12 ks',
    items:[{name:'Mulčovací kůra borová', qty:12, pricePerUnit:180, total:2160}],
    clientId:2, orderId:120, rebill:true, rebilled:true, margin:15,
    notes:'Podzimní mulčování — refakturováno',
    photo:true, fakeImage:'mock-receipt-13' },

  { id:14, date:abs(2025,9,20), supplier:'Školka Litomyšl', supplierId:4, category:'rostliny', amount:5400, paymentMethod:'card',
    description:'Tuje a buxusy — výsadba',
    items:[
      {name:'Tuje smaragd 80 cm', qty:8, pricePerUnit:380, total:3040},
      {name:'Buxus sempervirens 30 cm', qty:10, pricePerUnit:240, total:2400},
    ],
    clientId:7, orderId:119, rebill:true, rebilled:true, margin:25,
    notes:'Hotel Průhonice — náhrada uschlých keřů',
    photo:true, fakeImage:'mock-receipt-14' },

  { id:15, date:abs(2025,7,10), supplier:'COMPO Praha s.r.o.', supplierId:2, category:'hnojiva', amount:1560, paymentMethod:'transfer',
    description:'Letní hnojení — kompletní balík',
    items:[
      {name:'Hnojivo BoFix 5 kg', qty:2, pricePerUnit:520, total:1040},
      {name:'Železo chelát 250 g', qty:2, pricePerUnit:280, total:560},
    ],
    clientId:6, orderId:113, rebill:true, rebilled:true, margin:20,
    notes:'Letní program Šimánek',
    photo:true, fakeImage:'mock-receipt-15' },

  { id:16, date:abs(2025,5,5), supplier:'OMV', supplierId:null, category:'palivo', amount:1480, paymentMethod:'card',
    description:'Nafta — sezónní tankování',
    items:[{name:'Nafta', qty:34, pricePerUnit:43.5, total:1479}],
    clientId:null, orderId:null, rebill:false, rebilled:false, margin:0,
    notes:'',
    photo:true, fakeImage:'mock-receipt-16' },

  { id:17, date:abs(2025,4,2), supplier:'Floraservis Praha', supplierId:10, category:'osiva', amount:2200, paymentMethod:'transfer',
    description:'Travní semeno hřišťové 10 kg',
    items:[{name:'Travní semeno hřišťové', qty:1, pricePerUnit:2200, total:2200}],
    clientId:12, orderId:114, rebill:true, rebilled:true, margin:10,
    notes:'Škola Radošovice — obnova hřiště',
    photo:true, fakeImage:'mock-receipt-17' },

  { id:18, date:abs(2025,3,18), supplier:'AGRO CS a.s.', supplierId:1, category:'hnojiva', amount:1200, paymentMethod:'card',
    description:'Vápno dolomitické 5×25 kg',
    items:[{name:'Vápno dolomitické', qty:5, pricePerUnit:240, total:1200}],
    clientId:6, orderId:102, rebill:true, rebilled:true, margin:15,
    notes:'Jarní úprava pH — Šimánek',
    photo:true, fakeImage:'mock-receipt-18' },
]


// ── Workers (zahradnici) ──────────────────────
export const defaultWorkers = [
  { id:1, name:'Jan Novák',      role:'owner',      color:'#16a34a', initials:'JN', phone:'+420 602 123 456', active:true },
  { id:2, name:'Tomáš Zelený',   role:'worker',     color:'#2563eb', initials:'TZ', phone:'+420 605 222 333', active:true },
  { id:3, name:'Eva Horáková',   role:'accountant', color:'#9333ea', initials:'EH', phone:'+420 608 444 555', active:true },
]

// ── Absence types ─────────────────────────────
export const absenceTypes = [
  { id:'vacation', label:'Dovolená',    icon:'🏖️', color:'bg-blue-100 text-blue-800 border-blue-300' },
  { id:'sick',     label:'Nemoc',       icon:'🤒', color:'bg-red-100 text-red-800 border-red-300' },
  { id:'personal', label:'Osobní volno',icon:'⏸️', color:'bg-amber-100 text-amber-800 border-amber-300' },
  { id:'doctor',   label:'Lékař',       icon:'🏥', color:'bg-rose-100 text-rose-800 border-rose-300' },
  { id:'other',    label:'Jiné',        icon:'📝', color:'bg-gray-100 text-gray-700 border-gray-300' },
]

export const defaultAbsences = [
  // Past — for history visibility
  { id:1, workerId:3, type:'sick',     dateFrom:abs(2026,4,30), dateTo:abs(2026,4,30), allDay:true,
    status:'approved', approvedBy:1, approvedAt:abs(2026,4,30), note:'Chřipka', requestedAt:abs(2026,4,29) },

  // Current/future
  { id:2, workerId:2, type:'vacation', dateFrom:d(7),  dateTo:d(13), allDay:true,
    status:'approved', approvedBy:1, approvedAt:d(-3), note:'Rodinná dovolená u moře', requestedAt:d(-10) },

  { id:3, workerId:1, type:'doctor',   dateFrom:d(6),  dateTo:d(6),  allDay:false, hourFrom:'13:00', hourTo:'16:00',
    status:'approved', approvedBy:1, approvedAt:d(-1), note:'Plánovaná prohlídka', requestedAt:d(-2) },

  { id:4, workerId:2, type:'personal', dateFrom:d(21), dateTo:d(21), allDay:true,
    status:'pending', approvedBy:null, approvedAt:null, note:'Stěhování', requestedAt:d(-1) },

  { id:5, workerId:2, type:'vacation', dateFrom:abs(2026,7,15), dateTo:abs(2026,7,22), allDay:true,
    status:'approved', approvedBy:1, approvedAt:abs(2026,4,15), note:'Letní dovolená — Chorvatsko', requestedAt:abs(2026,4,10) },

  { id:6, workerId:3, type:'personal', dateFrom:d(14), dateTo:d(14), allDay:false, hourFrom:'14:00', hourTo:'18:00',
    status:'pending', approvedBy:null, approvedAt:null, note:'Schůzka s účetní firmou', requestedAt:d(0) },
]


// ── Quotes (cenové nabídky) ────────────────────
export const quoteStatuses = [
  { id:'draft',    label:'Rozpracovaná', color:'bg-gray-100 text-gray-700 border-gray-200' },
  { id:'sent',     label:'Odeslaná',     color:'bg-blue-50 text-blue-700 border-blue-200' },
  { id:'accepted', label:'Přijatá',      color:'bg-green-50 text-green-700 border-green-200' },
  { id:'rejected', label:'Odmítnutá',    color:'bg-red-50 text-red-700 border-red-200' },
  { id:'expired',  label:'Propadlá',     color:'bg-amber-50 text-amber-700 border-amber-200' },
]

export const defaultQuotes = [
  {
    id:1, number:'NAB-2026-001', clientId:6, status:'accepted',
    issueDate:abs(2026,3,15), validUntil:abs(2026,4,30),
    title:'Komplexní úprava zahrady — Velké Popovice',
    items:[
      { id:1, name:'Údržba trávníku — sekání + okrajování', qty:1, unit:'sezóna', price:18000, total:18000 },
      { id:2, name:'Mulčování záhonů — kůra borová', qty:25, unit:'pytel', price:200, total:5000 },
      { id:3, name:'Hnojení trávníku 3× ročně', qty:3, unit:'aplikace', price:2500, total:7500 },
      { id:4, name:'Úprava živého plotu', qty:8, unit:'h', price:450, total:3600 },
    ],
    discount:5, vat:21, notes:'Celosezónní balíček. Sleva 5% při sjednání paušální smlouvy.',
    sentAt:abs(2026,3,16), acceptedAt:abs(2026,3,22),
  },
  {
    id:2, number:'NAB-2026-002', clientId:7, status:'accepted',
    issueDate:abs(2026,4,1), validUntil:abs(2026,4,30),
    title:'Hotelová zahrada — výsadba 2026',
    items:[
      { id:1, name:'Tuje smaragd 80 cm — výsadba', qty:30, unit:'ks', price:480, total:14400 },
      { id:2, name:'Buxus sempervirens — výsadba', qty:20, unit:'ks', price:320, total:6400 },
      { id:3, name:'Práce zahradníka', qty:24, unit:'h', price:450, total:10800 },
      { id:4, name:'Doprava materiálu', qty:1, unit:'jízda', price:1800, total:1800 },
    ],
    discount:0, vat:21, notes:'Záruka na rostliny 1 rok při dodržení podmínek údržby.',
    sentAt:abs(2026,4,2), acceptedAt:abs(2026,4,8),
  },
  {
    id:3, number:'NAB-2026-003', clientId:2, status:'sent',
    issueDate:abs(2026,4,20), validUntil:abs(2026,5,20),
    title:'Jarní program — Horák, Říčany',
    items:[
      { id:1, name:'Vertikutace trávníku', qty:1, unit:'aplikace', price:2400, total:2400 },
      { id:2, name:'Provzdušnění + dosetí', qty:1, unit:'aplikace', price:1800, total:1800 },
      { id:3, name:'Hnojivo BoFix proti plevelu', qty:2, unit:'kg', price:520, total:1040 },
    ],
    discount:0, vat:21, notes:'Termín: do 15.5.2026. Závisí na počasí.',
    sentAt:abs(2026,4,21), acceptedAt:null,
  },
  {
    id:4, number:'NAB-2026-004', clientId:10, status:'draft',
    issueDate:d(0), validUntil:d(30),
    title:'Bylinková zahrada — návrh a realizace',
    items:[
      { id:1, name:'Návrh osazení', qty:1, unit:'ks', price:3500, total:3500 },
      { id:2, name:'Levandule lékařská', qty:15, unit:'ks', price:160, total:2400 },
      { id:3, name:'Příprava půdy + výsadba', qty:6, unit:'h', price:450, total:2700 },
    ],
    discount:0, vat:21, notes:'',
    sentAt:null, acceptedAt:null,
  },
  {
    id:5, number:'NAB-2026-005', clientId:14, status:'rejected',
    issueDate:abs(2026,3,5), validUntil:abs(2026,4,5),
    title:'Pokácení 3 stromů — Mukařov',
    items:[
      { id:1, name:'Pokácení vzrostlého stromu', qty:3, unit:'ks', price:3500, total:10500 },
      { id:2, name:'Frézování pařezů', qty:3, unit:'ks', price:1800, total:5400 },
      { id:3, name:'Odvoz a likvidace dřevní hmoty', qty:1, unit:'paušál', price:2800, total:2800 },
    ],
    discount:10, vat:21, notes:'Klient zvolil jinou firmu kvůli ceně.',
    sentAt:abs(2026,3,6), acceptedAt:null,
  },
]

// ── Contracts (smlouvy) ─────────────────────────
export const contractTypes = [
  { id:'seasonal',  label:'Sezónní paušál', icon:'☀️', color:'bg-green-50 text-green-700 border-green-200' },
  { id:'annual',    label:'Roční smlouva',  icon:'📅', color:'bg-blue-50 text-blue-700 border-blue-200' },
  { id:'monthly',   label:'Měsíční',        icon:'🔄', color:'bg-purple-50 text-purple-700 border-purple-200' },
  { id:'one_time',  label:'Jednorázová',    icon:'📋', color:'bg-gray-100 text-gray-700 border-gray-200' },
]

export const defaultContracts = [
  {
    id:1, number:'SM-2026-001', clientId:6, type:'seasonal', status:'active',
    title:'Celoroční údržba — Šimánek',
    startDate:abs(2026,3,1), endDate:abs(2026,11,30),
    monthlyPrice:8500, totalValue:76500,
    services:['Sekání trávníku 1×týdně','Hnojení 3×ročně','Úprava živého plotu 4×','Mulčování','Podzimní úklid'],
    paymentTerms:'měsíčně k 15. dni',
    autoRenew:true,
    signedAt:abs(2026,2,20),
    notes:'Klient od roku 2023. Sleva 5% za víceleté klienty.',
  },
  {
    id:2, number:'SM-2026-002', clientId:7, type:'annual', status:'active',
    title:'Hotelová zahrada — celoroční',
    startDate:abs(2026,1,1), endDate:abs(2026,12,31),
    monthlyPrice:18500, totalValue:222000,
    services:['Denní pochůzková údržba','Týdenní sekání','Sezónní výsadba','Údržba zavlažování','Pohotovost'],
    paymentTerms:'měsíčně předem',
    autoRenew:true,
    signedAt:abs(2025,12,15),
    notes:'Premium klient. Reakční doba 24h.',
  },
  {
    id:3, number:'SM-2026-003', clientId:2, type:'seasonal', status:'active',
    title:'Sezónní údržba — Horák',
    startDate:abs(2026,4,1), endDate:abs(2026,10,31),
    monthlyPrice:4200, totalValue:29400,
    services:['Sekání 1×za 2 týdny','Plení záhonů','Hnojení 2×ročně'],
    paymentTerms:'měsíčně',
    autoRenew:false,
    signedAt:abs(2026,3,25),
    notes:'',
  },
  {
    id:4, number:'SM-2025-008', clientId:1, type:'annual', status:'expired',
    title:'Celoroční údržba 2025 — Procházková',
    startDate:abs(2025,1,1), endDate:abs(2025,12,31),
    monthlyPrice:3800, totalValue:45600,
    services:['Sekání','Hnojení','Mulčování'],
    paymentTerms:'měsíčně',
    autoRenew:false,
    signedAt:abs(2024,12,10),
    notes:'Smlouva v roce 2026 neobnovena — klient dělá samá.',
  },
  {
    id:5, number:'SM-2026-004', clientId:10, type:'monthly', status:'pending',
    title:'Měsíční údržba bylinkové zahrady',
    startDate:d(7), endDate:d(367),
    monthlyPrice:2400, totalValue:28800,
    services:['Údržba bylinek 2×měsíčně','Sezónní výsadba'],
    paymentTerms:'měsíčně',
    autoRenew:true,
    signedAt:null,
    notes:'Čeká se na podpis.',
  },
]

// ── Complaints (reklamace) ─────────────────────
export const complaintStatuses = [
  { id:'open',       label:'Otevřená',     color:'bg-red-50 text-red-700 border-red-200',    priority:1 },
  { id:'in_progress',label:'Řeší se',      color:'bg-amber-50 text-amber-700 border-amber-200',priority:2 },
  { id:'resolved',   label:'Vyřešená',     color:'bg-green-50 text-green-700 border-green-200',priority:3 },
  { id:'rejected',   label:'Zamítnutá',    color:'bg-gray-100 text-gray-700 border-gray-200',  priority:4 },
]

export const defaultComplaints = [
  {
    id:1, clientId:7, orderId:119, status:'resolved', priority:'high',
    title:'Uschlé tuje po výsadbě', date:abs(2025,10,5),
    description:'3 z 8 vysazených tují uschly do 2 měsíců po výsadbě. Klient žádá náhradu.',
    resolution:'Tuje vyměněny zdarma v rámci záruky. Doplněna instrukce k zalévání.',
    resolvedAt:abs(2025,10,20), resolvedBy:1,
    cost:1140, refunded:0,
  },
  {
    id:2, clientId:2, orderId:null, status:'in_progress', priority:'medium',
    title:'Nerovnoměrné sekání trávníku', date:d(-5),
    description:'Trávník po sekání má místa s vyšší trávou. Žádá nápravu.',
    resolution:'Domluveno opakované sekání zdarma 30.4.',
    resolvedAt:null, resolvedBy:null,
    cost:0, refunded:0,
  },
  {
    id:3, clientId:6, orderId:131, status:'open', priority:'low',
    title:'Hluk při ranní práci', date:d(-2),
    description:'Soused si stěžoval na hluk před 8:00. Klient žádá posunout startovní čas.',
    resolution:'',
    resolvedAt:null, resolvedBy:null,
    cost:0, refunded:0,
  },
  {
    id:4, clientId:11, orderId:null, status:'rejected', priority:'medium',
    title:'Reklamace barvy mulče', date:abs(2025,8,15),
    description:'Klient tvrdí že kůra je tmavší než dohodnuto.',
    resolution:'Vzorek odpovídá objednávce. Reklamace zamítnuta po společné kontrole.',
    resolvedAt:abs(2025,8,18), resolvedBy:1,
    cost:0, refunded:0,
  },
]

// ── Vehicles (vozidla — tachograf) ──────────────
export const vehicleTypes = [
  { id:'van',    label:'Dodávka' },
  { id:'pickup', label:'Pickup'  },
  { id:'car',    label:'Osobní'  },
  { id:'tractor',label:'Traktor' },
]

export const defaultVehicles = [
  {
    id:1, name:'Ford Transit 2.0', type:'van', plate:'2AB 1234',
    year:2020, currentKm:78420,
    fuelType:'diesel', avgConsumption:8.2,
    insurance:'Allianz',  insuranceExpiry:abs(2027,3,15),
    inspection:abs(2027,5,20), assignedTo:1,
    notes:'Hlavní dodávka pro materiál a tým.',
  },
  {
    id:2, name:'Škoda Octavia Combi', type:'car', plate:'3CD 5678',
    year:2022, currentKm:42150,
    fuelType:'diesel', avgConsumption:5.4,
    insurance:'Generali', insuranceExpiry:abs(2026,11,8),
    inspection:abs(2027,2,12), assignedTo:1,
    notes:'Pro dojíždění ke klientům.',
  },
  {
    id:3, name:'VW Caddy', type:'pickup', plate:'4EF 9012',
    year:2018, currentKm:124300,
    fuelType:'diesel', avgConsumption:6.8,
    insurance:'Allianz',  insuranceExpiry:abs(2026,9,3),
    inspection:abs(2026,8,15), assignedTo:2,
    notes:'Tomášův pracovní vůz.',
  },
]

export const defaultTrips = [
  // Recent trips for current month
  { id:1, vehicleId:1, driverId:1, date:d(-1),  startKm:78380, endKm:78420, distance:40, purpose:'Klient Šimánek + AGRO CS', clientId:6, fuelCost:0, notes:'' },
  { id:2, vehicleId:1, driverId:1, date:d(-2),  startKm:78340, endKm:78380, distance:40, purpose:'Hotel Průhonice', clientId:7, fuelCost:0, notes:'' },
  { id:3, vehicleId:2, driverId:1, date:d(-3),  startKm:42120, endKm:42150, distance:30, purpose:'Schůzka — nový klient', clientId:null, fuelCost:0, notes:'Předběžná prohlídka' },
  { id:4, vehicleId:1, driverId:2, date:d(-3),  startKm:78280, endKm:78340, distance:60, purpose:'Trasa Říčany — Jesenice', clientId:null, fuelCost:0, notes:'Více klientů' },
  { id:5, vehicleId:3, driverId:2, date:d(-4),  startKm:124220,endKm:124300,distance:80, purpose:'Velké Popovice', clientId:6, fuelCost:0, notes:'' },
  { id:6, vehicleId:1, driverId:1, date:d(-7),  startKm:78180, endKm:78280, distance:100,purpose:'Litomyšl — školka rostlin', clientId:null, fuelCost:0, notes:'Velký nákup' },
  { id:7, vehicleId:2, driverId:1, date:d(-10), startKm:42050, endKm:42120, distance:70, purpose:'Klienti Praha-východ', clientId:null, fuelCost:0, notes:'' },
  { id:8, vehicleId:3, driverId:2, date:d(-12), startKm:124140,endKm:124220,distance:80, purpose:'Říčany + Mukařov', clientId:null, fuelCost:0, notes:'' },
]

export const defaultRefuels = [
  // Tankování
  { id:1, vehicleId:1, date:d(-2),  liters:42.5, pricePerL:43.5, total:1849, km:78380, station:'OMV Říčany',         notes:'' },
  { id:2, vehicleId:2, date:d(-5),  liters:38.2, pricePerL:42.8, total:1635, km:42100, station:'Shell Praha',         notes:'' },
  { id:3, vehicleId:3, date:d(-8),  liters:55.0, pricePerL:43.5, total:2393, km:124180,station:'OMV Praha-východ',   notes:'Plná nádrž' },
  { id:4, vehicleId:1, date:d(-15), liters:50.0, pricePerL:43.2, total:2160, km:78180, station:'OMV Říčany',         notes:'' },
  { id:5, vehicleId:2, date:d(-20), liters:35.4, pricePerL:42.5, total:1505, km:42030, station:'Benzina',             notes:'' },
]
