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

// ── Clients — Praha Východ (14 klientů) ──────
export const defaultClients = [
  { id:1,  name:'Ing. Pavel Horák',       phone:'+420 605 111 222', email:'p.horak@email.cz',         address:'Ke Křížku 14, Praha-Šeberov',          city:'Praha-Šeberov',          notes:'Pozor na psa Rexe — volný v zahradě. Kód od branky: 4521. Preferuje dopoledne do 11:00.', tags:['pravidelný','vip'], status:'active', gardenSize:'velká',   joinDate:'2021-03-15', lat:49.9920, lng:14.5180 , clientPin:'4455' },
  { id:2,  name:'Správa objektů Říčany',  phone:'+420 323 600 100', email:'zahrada@so-ricany.cz',     address:'Říčanská 8, Říčany u Prahy',           city:'Říčany',                 notes:'Firemní areál 3200 m2. Fakturace na IČO 45123678. Vždy fakturovat do 25. v měsíci.', tags:['firemní','pravidelný'], status:'active', gardenSize:'velká', joinDate:'2021-01-10', clientPin:'4455', lat:49.9918, lng:14.6553 },
  { id:3,  name:'Marie Procházková',      phone:'+420 608 555 666', email:'m.prochazkova@seznam.cz',  address:'Lipová alej 33, Průhonice',             city:'Průhonice',              notes:'Alergická na pyl — nosit rukavice. Ráda si popovídá u kávy.', tags:['pravidelný'], status:'active', gardenSize:'malá', joinDate:'2020-06-20', lat:49.9899, lng:14.5484 , clientPin:'4455' },
  { id:4,  name:'Tomáš Kratochvíl',       phone:'+420 601 777 888', email:'t.kratochvil@gmail.com',   address:'Větrná 5, Čestlice',                   city:'Čestlice',               notes:'Novostavba 2022, velká zahrada 800 m2. Zajímá se o zahradničení, rád se ptá.', tags:['nový','pravidelný'], status:'active', gardenSize:'velká', joinDate:'2023-02-01', lat:49.9997, lng:14.6003 , clientPin:'4455' },
  { id:5,  name:'Jana Bártová',           phone:'+420 604 999 000', email:'j.bartova@volny.cz',       address:'Slunečná 12, Jesenice u Prahy',        city:'Jesenice',               notes:'Klíče u sousedky p. Novákové č.p. 14. Branka se zamyká.', tags:['pravidelný'], status:'active', gardenSize:'střední', joinDate:'2022-04-10', lat:49.9599, lng:14.5199 , clientPin:'4455' },
  { id:6,  name:'Robert Šimánek',         phone:'+420 603 222 111', email:'r.simanek@podnikatel.cz',  address:'Jasanová 44, Velké Popovice',          city:'Velké Popovice',         notes:'Zahrada 1400 m2 se sadem. Precizní práce nutností — VIP klient. Vždy platí hotově na místě.', tags:['vip','pravidelný'], status:'active', gardenSize:'velká', joinDate:'2020-12-01', lat:49.9199, lng:14.6099 , clientPin:'4455' },
  { id:7,  name:'Hotel Průhonice',         phone:'+420 271 015 911', email:'zahrada@hotel-pruhonice.cz','address':'U Parku 6, Průhonice',             city:'Průhonice',              notes:'Hotelová zahrada u vstupu — reprezentativní vzhled je povinností. Přístup přes recepci.', tags:['firemní','vip'], status:'active', gardenSize:'velká', joinDate:'2021-04-20', lat:49.9912, lng:14.5472 , clientPin:'4455' },
  { id:8,  name:'Petr Novotný',           phone:'+420 606 444 555', email:'p.novotny@centrum.cz',     address:'Kaštanová 7, Říčany u Prahy',          city:'Říčany',                 notes:'Pensionista, doma téměř vždy. Preferuje páteční návštěvy. Čaj vždy připraven.', tags:['pravidelný'], status:'active', gardenSize:'střední', joinDate:'2022-08-30', lat:49.9911, lng:14.6559 , clientPin:'4455' },
  { id:9,  name:'Lucie Horáková',         phone:'+420 607 333 777', email:'l.horakova@email.cz',      address:'Nad Rybníkem 22, Sulice',              city:'Sulice',                 notes:'Mladá rodina, 3 malé děti — zahrada musí být bezpečná, bez chemie.', tags:['pravidelný'], status:'active', gardenSize:'střední', joinDate:'2023-05-12', lat:49.9729, lng:14.6010 , clientPin:'4455' },
  { id:10, name:'Ing. arch. Blaha',       phone:'+420 777 888 999', email:'blaha.arch@studio.cz',     address:'Příční 88, Popovičky',                 city:'Popovičky',              notes:'Architekt — vysoké nároky na estetiku. Každý detail musí být perfektní.', tags:['vip'], status:'active', gardenSize:'velká', joinDate:'2022-11-01', lat:49.9458, lng:14.6258 , clientPin:'4455' },
  { id:11, name:'Eva Součková',           phone:'+420 602 555 444', email:'e.souckova@email.cz',      address:'Polní 3, Zdiby',                       city:'Zdiby',                  notes:'Odjíždí každý pátek. Klíče pod rohožkou na zadní terase. Volné parkování na dvoře.', tags:['pravidelný'], status:'active', gardenSize:'střední', joinDate:'2023-09-15', lat:50.1799, lng:14.4799 , clientPin:'4455' },
  { id:12, name:'Škola Radošovice',       phone:'+420 281 960 111', email:'reditelna@skola-radosovice.cz','address':'Školní 1, Praha-Radošovice',    city:'Praha-Radošovice',       notes:'Školní zahrada a sportovní plochy. Práce vždy o prázdninách nebo víkendech.', tags:['firemní'], status:'active', gardenSize:'velká', joinDate:'2022-06-01', lat:50.0499, lng:14.6099 , clientPin:'4455' },
  { id:13, name:'Martin Vlček',           phone:'+420 608 777 123', email:'m.vlcek@firma.cz',         address:'U Lesíka 5, Mukařov',                  city:'Mukařov',                notes:'Dřívější termíny preferuje — chodí do práce v 7:30. Pes Benny v ohradě.', tags:['pravidelný'], status:'active', gardenSize:'střední', joinDate:'2024-01-15', lat:49.9620, lng:14.7220 , clientPin:'4455' },
  { id:14, name:'Dagmar Kopecká',         phone:'+420 605 321 654', email:'d.kopecka@seznam.cz',      address:'Nová 18, Dobřejovice',                 city:'Dobřejovice',            notes:'Důchodkyně, ráda přihlíží. Nabídne vždy ovoce ze zahrady.', tags:['pravidelný'], status:'inactive', gardenSize:'malá', joinDate:'2021-07-20', lat:49.9720, lng:14.5720 , clientPin:'4455' },
]

// ── Orders (32 zakázek) ───────────────────────
const today = new Date()
const d = (offset) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + offset)
  return dt.toISOString().split('T')[0]
}

export const defaultOrders = [
  // Dokoncene — minulost
  { id:101, clientId:1,  date:d(-60), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:100, totalPrice:2200, paid:true,  paidDate:d(-58), notes:'Sekáno do 5 cm. Keře u plotu zastřiženy.', worker:'Jan Novák' },
  { id:102, clientId:2,  date:d(-55), status:'completed', services:['Sekání trávy','Vertikutace','Odvoz odpadu'],       duration:220, totalPrice:5800, paid:true,  paidDate:d(-40), notes:'Firemní areál, velká plocha. Odvoz 2x.', worker:'Jan Novák' },
  { id:103, clientId:3,  date:d(-50), status:'completed', services:['Sekání trávy','Zálivka'],                          duration:65,  totalPrice:950,  paid:true,  paidDate:d(-48), notes:'Zálivka ovocných stromků.', worker:'Jan Novák' },
  { id:104, clientId:6,  date:d(-48), status:'completed', services:['Sekání trávy','Stříhání živého plotu','Mulčování'],duration:260, totalPrice:6800, paid:true,  paidDate:d(-48), notes:'Zaplaceno hotově na místě.', worker:'Jan Novák' },
  { id:105, clientId:7,  date:d(-45), status:'completed', services:['Sekání trávy','Stříhání keřů','Výsadba rostlin'], duration:230, totalPrice:8200, paid:true,  paidDate:d(-45), notes:'Hotelová zahrada — sezónní výsadba letniček.', worker:'Jan Novák' },
  { id:106, clientId:1,  date:d(-40), status:'completed', services:['Vertikutace','Hnojení trávníku'],                  duration:130, totalPrice:2800, paid:true,  paidDate:d(-38), notes:'Jarní vertikutace a hnojení.', worker:'Jan Novák' },
  { id:107, clientId:8,  date:d(-38), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:95,  totalPrice:2100, paid:true,  paidDate:d(-35), notes:'', worker:'Jan Novák' },
  { id:108, clientId:4,  date:d(-35), status:'completed', services:['Sekání trávy','Odvoz odpadu'],                    duration:160, totalPrice:3600, paid:true,  paidDate:d(-30), notes:'Nafocen stav zahrady před a po.', worker:'Jan Novák' },
  { id:109, clientId:9,  date:d(-32), status:'completed', services:['Sekání trávy','Hnojení trávníku'],                duration:90,  totalPrice:1900, paid:true,  paidDate:d(-30), notes:'Bez chemie — organické hnojivo.', worker:'Jan Novák' },
  { id:110, clientId:6,  date:d(-30), status:'completed', services:['Sekání trávy','Stříhání živého plotu'],           duration:190, totalPrice:4800, paid:true,  paidDate:d(-30), notes:'Zaplaceno hotově.', worker:'Jan Novák' },
  { id:111, clientId:2,  date:d(-28), status:'completed', services:['Sekání trávy','Stříhání keřů','Zálivka'],         duration:210, totalPrice:5200, paid:true,  paidDate:d(-20), notes:'', worker:'Jan Novák' },
  { id:112, clientId:10, date:d(-25), status:'completed', services:['Sekání trávy','Výsadba rostlin'],                 duration:140, totalPrice:4200, paid:true,  paidDate:d(-23), notes:'Výsadba trvalkového záhonu.', worker:'Jan Novák' },
  { id:113, clientId:12, date:d(-22), status:'completed', services:['Sekání trávy','Odvoz odpadu'],                    duration:270, totalPrice:7200, paid:true,  paidDate:d(-20), notes:'Školní hřiště a zahrada — letní úklid.', worker:'Jan Novák' },
  { id:114, clientId:3,  date:d(-20), status:'completed', services:['Sekání trávy'],                                   duration:55,  totalPrice:850,  paid:true,  paidDate:d(-18), notes:'', worker:'Jan Novák' },
  { id:115, clientId:7,  date:d(-18), status:'completed', services:['Sekání trávy','Stříhání živého plotu'],           duration:190, totalPrice:5600, paid:true,  paidDate:d(-18), notes:'Hotel — letní údržba vstupu.', worker:'Jan Novák' },
  { id:116, clientId:5,  date:d(-15), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:100, totalPrice:2300, paid:true,  paidDate:d(-12), notes:'', worker:'Jan Novák' },
  { id:117, clientId:1,  date:d(-12), status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:100, totalPrice:2200, paid:true,  paidDate:d(-10), notes:'', worker:'Jan Novák' },
  { id:118, clientId:4,  date:d(-10), status:'completed', services:['Sekání trávy','Mulčování'],                       duration:150, totalPrice:3900, paid:false, paidDate:null,   notes:'Zaslána faktura emailem.', worker:'Jan Novák' },
  { id:119, clientId:8,  date:d(-8),  status:'completed', services:['Sekání trávy'],                                   duration:65,  totalPrice:1100, paid:true,  paidDate:d(-7),  notes:'', worker:'Jan Novák' },
  { id:120, clientId:3,  date:d(-5),  status:'completed', services:['Sekání trávy'],                                   duration:55,  totalPrice:850,  paid:false, paidDate:null,   notes:'Po splatnosti — zaslat upomínku.', worker:'Jan Novák' },
  { id:121, clientId:11, date:d(-4),  status:'completed', services:['Sekání trávy','Zálivka'],                         duration:80,  totalPrice:1600, paid:false, paidDate:null,   notes:'', worker:'Jan Novák' },
  // Naplánované — budoucnost
  { id:122, clientId:6,  date:d(1),   status:'scheduled', services:['Sekání trávy','Stříhání živého plotu','Mulčování'],duration:260, totalPrice:6800, paid:false, paidDate:null, notes:'Velký sez — přijet dříve.', worker:'Jan Novák' },
  { id:123, clientId:1,  date:d(2),   status:'scheduled', services:['Sekání trávy'],                                   duration:100, totalPrice:1400, paid:false, paidDate:null, notes:'', worker:'Jan Novák' },
  { id:124, clientId:7,  date:d(3),   status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                   duration:190, totalPrice:5800, paid:false, paidDate:null, notes:'Hotel — týdenní návštěva.', worker:'Jan Novák' },
  { id:125, clientId:2,  date:d(4),   status:'scheduled', services:['Sekání trávy','Hnojení trávníku'],                duration:230, totalPrice:6400, paid:false, paidDate:null, notes:'Firemní areál.', worker:'Jan Novák' },
  { id:126, clientId:9,  date:d(5),   status:'scheduled', services:['Sekání trávy','Zálivka'],                         duration:90,  totalPrice:1900, paid:false, paidDate:null, notes:'Bez chemie.', worker:'Jan Novák' },
  { id:127, clientId:13, date:d(6),   status:'scheduled', services:['Sekání trávy','Stříhání keřů','Odvoz odpadu'],   duration:140, totalPrice:3600, paid:false, paidDate:null, notes:'Brzy ráno — do 7:30.', worker:'Jan Novák' },
  { id:128, clientId:4,  date:d(8),   status:'scheduled', services:['Sekání trávy','Mulčování'],                       duration:150, totalPrice:3900, paid:false, paidDate:null, notes:'', worker:'Jan Novák' },
  { id:129, clientId:10, date:d(9),   status:'scheduled', services:['Řez stromů','Odvoz odpadu'],                     duration:280, totalPrice:7800, paid:false, paidDate:null, notes:'Precizní řez — architekt.', worker:'Jan Novák' },
  { id:130, clientId:5,  date:d(10),  status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                   duration:100, totalPrice:2300, paid:false, paidDate:null, notes:'', worker:'Jan Novák' },
  { id:131, clientId:8,  date:d(12),  status:'scheduled', services:['Sekání trávy'],                                   duration:65,  totalPrice:1100, paid:false, paidDate:null, notes:'Páteční termín.', worker:'Jan Novák' },
  { id:132, clientId:12, date:d(14),  status:'scheduled', services:['Sekání trávy','Odvoz odpadu'],                   duration:270, totalPrice:7200, paid:false, paidDate:null, notes:'Škola — o víkendu.', worker:'Jan Novák' },
]

// ── Invoices (22 faktur) ──────────────────────
export const defaultInvoices = [
  { id:'2024001', orderId:101, clientId:1,  date:d(-60), dueDate:d(-46), amount:2200,  paid:true,  paidDate:d(-58),
    serviceDetails:[{name:'Sekání trávy',qty:200,unit:'m²',pricePerUnit:8,total:1600},{name:'Stříhání keřů',qty:1,unit:'ks',pricePerUnit:350,total:350},{name:'Doprava',qty:1,unit:'paušál',pricePerUnit:250,total:250}] },
  { id:'2024002', orderId:102, clientId:2,  date:d(-55), dueDate:d(-41), amount:5800,  paid:true,  paidDate:d(-40) },
  { id:'2024003', orderId:103, clientId:3,  date:d(-50), dueDate:d(-36), amount:950,   paid:true,  paidDate:d(-48) },
  { id:'2024004', orderId:104, clientId:6,  date:d(-48), dueDate:d(-34), amount:6800,  paid:true,  paidDate:d(-48) },
  { id:'2024005', orderId:105, clientId:7,  date:d(-45), dueDate:d(-31), amount:8200,  paid:true,  paidDate:d(-45) },
  { id:'2024006', orderId:106, clientId:1,  date:d(-40), dueDate:d(-26), amount:2800,  paid:true,  paidDate:d(-38) },
  { id:'2024007', orderId:107, clientId:8,  date:d(-38), dueDate:d(-24), amount:2100,  paid:true,  paidDate:d(-35) },
  { id:'2024008', orderId:108, clientId:4,  date:d(-35), dueDate:d(-21), amount:3600,  paid:true,  paidDate:d(-30) },
  { id:'2024009', orderId:109, clientId:9,  date:d(-32), dueDate:d(-18), amount:1900,  paid:true,  paidDate:d(-30) },
  { id:'2024010', orderId:110, clientId:6,  date:d(-30), dueDate:d(-16), amount:4800,  paid:true,  paidDate:d(-30) },
  { id:'2024011', orderId:111, clientId:2,  date:d(-28), dueDate:d(-14), amount:5200,  paid:true,  paidDate:d(-20) },
  { id:'2024012', orderId:112, clientId:10, date:d(-25), dueDate:d(-11), amount:4200,  paid:true,  paidDate:d(-23) },
  { id:'2024013', orderId:113, clientId:12, date:d(-22), dueDate:d(-8),  amount:7200,  paid:true,  paidDate:d(-20) },
  { id:'2024014', orderId:115, clientId:7,  date:d(-18), dueDate:d(-4),  amount:5600,  paid:true,  paidDate:d(-18) },
  { id:'2024015', orderId:116, clientId:5,  date:d(-15), dueDate:d(-1),  amount:2300,  paid:true,  paidDate:d(-12) },
  { id:'2024016', orderId:117, clientId:1,  date:d(-12), dueDate:d(2),   amount:2200,  paid:false, paidDate:null },
  { id:'2024017', orderId:118, clientId:4,  date:d(-10), dueDate:d(4),   amount:3900,  paid:false, paidDate:null },
  { id:'2024018', orderId:119, clientId:8,  date:d(-8),  dueDate:d(6),   amount:1100,  paid:false, paidDate:null },
  { id:'2024019', orderId:120, clientId:3,  date:d(-5),  dueDate:d(-1),  amount:850,   paid:false, paidDate:null },
  { id:'2024020', orderId:121, clientId:11, date:d(-4),  dueDate:d(10),  amount:1600,  paid:false, paidDate:null },
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

// ── Notifications (demo) ──────────────────────
export const defaultNotifications = [
  { id:1,  type:'overdue',   read:false, time:d(0)+'T07:15', message:'Faktura #2024019 po splatnosti — Procházková (850 Kč)', action:'invoices' },
  { id:2,  type:'reminder',  read:false, time:d(0)+'T06:00', message:'Zítra zakázka u Horák 09:00 — Šeberov, Ke Křížku 14', action:'checklist' },
  { id:3,  type:'weather',   read:false, time:d(0)+'T05:30', message:'Pozor: déšť v sobotu 80 % — 2 zakázky mohou být ovlivněny', action:'calendar' },
  { id:4,  type:'reminder',  read:false, time:d(-1)+'T18:00','message':'Hotel Průhonice — zítra týdenní návštěva (5 800 Kč)', action:'checklist' },
  { id:5,  type:'payment',   read:false, time:d(-1)+'T14:22','message':'Platba přijata: Správa objektů Říčany — 5 200 Kč', action:'invoices' },
  { id:6,  type:'nocontact', read:false, time:d(-2)+'T09:00', message:'Ing. arch. Blaha bez kontaktu 25 dní — čas na oslovení', action:'clients' },
  { id:7,  type:'reminder',  read:true,  time:d(-3)+'T08:00','message':'Kratochvíl — faktura #2024017 splatná za 4 dny', action:'invoices' },
  { id:8,  type:'review',    read:true,  time:d(-4)+'T16:30','message':'Nové hodnocení: Lucie Horáková dala 5/5 hvězd', action:'clients' },
  { id:9,  type:'nocontact', read:true,  time:d(-5)+'T09:00','message':'Martin Vlček bez kontaktu 31 dní', action:'clients' },
  { id:10, type:'payment',   read:true,  time:d(-6)+'T11:15','message':'Platba přijata: Hotel Průhonice — 5 600 Kč', action:'invoices' },
]

// ── Order templates ───────────────────────────
export const orderTemplates = [
  { id:'standard',  name:'Standardní sečení',    services:['Sekání trávy','Doprava'],                         desc:'Sekání + doprava' },
  { id:'complete',  name:'Kompletní údržba',      services:['Sekání trávy','Stříhání keřů','Odvoz odpadu','Doprava'], desc:'Sekání, keře, odvoz' },
  { id:'spring',    name:'Jarní start',           services:['Sekání trávy','Vertikutace','Hnojení trávníku','Doprava'], desc:'Vertikutace + hnojení' },
  { id:'hedge',     name:'Živý plot',             services:['Stříhání živého plotu','Odvoz odpadu','Doprava'], desc:'Stříhání plotu + odvoz' },
  { id:'trees',     name:'Řez stromů',            services:['Řez stromů','Odvoz odpadu','Doprava'],            desc:'Řez + odvoz' },
  { id:'autumn',    name:'Podzimní úklid',        services:['Shrabání listí','Odvoz odpadu','Mulčování','Doprava'], desc:'Listí + mulčování' },
]

// ── Monthly revenue for chart ─────────────────
export const monthlyRevenue = [
  { month:'Led', revenue:22400, orders:9  },
  { month:'Úno', revenue:15200, orders:6  },
  { month:'Bře', revenue:38800, orders:16 },
  { month:'Dub', revenue:52600, orders:21 },
  { month:'Kvě', revenue:68800, orders:27 },
  { month:'Čer', revenue:74200, orders:29 },
  { month:'Čvc', revenue:71400, orders:28 },
  { month:'Srp', revenue:0,     orders:0  },
  { month:'Zář', revenue:0,     orders:0  },
  { month:'Říj', revenue:0,     orders:0  },
  { month:'Lis', revenue:0,     orders:0  },
  { month:'Pro', revenue:0,     orders:0  },
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
  completed:  { dot:'bg-green-500', pill:'bg-green-50 text-green-700 border-green-200',  label:'Dokončeno'   },
  scheduled:  { dot:'bg-blue-500',  pill:'bg-blue-50 text-blue-700 border-blue-200',     label:'Naplánováno' },
  inprogress: { dot:'bg-amber-500', pill:'bg-amber-50 text-amber-700 border-amber-200',  label:'Probíhá'     },
  cancelled:  { dot:'bg-gray-400',  pill:'bg-gray-100 text-gray-600 border-gray-200',    label:'Zrušeno'     },
  active:     { dot:'bg-green-500', pill:'bg-green-50 text-green-700 border-green-200',  label:'Aktivní'     },
  inactive:   { dot:'bg-gray-400',  pill:'bg-gray-100 text-gray-600 border-gray-200',    label:'Neaktivní'   },
}

// ── Recurring order intervals ─────────────────
export const recurringIntervals = [
  { value:'7',  label:'Každý týden'     },
  { value:'14', label:'Každé 2 týdny'   },
  { value:'21', label:'Každé 3 týdny'   },
  { value:'28', label:'Každý měsíc'     },
  { value:'42', label:'Každých 6 týdnů' },
]
