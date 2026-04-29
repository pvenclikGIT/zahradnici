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

// ── Business ──────────────────────────────────
export const business = {
  name: 'ZahradaPro s.r.o.', owner: 'Jan Novák',
  phone: '+420 602 123 456', email: 'jan@zahradapro.cz',
  address: 'Zahradní 12, Brno 602 00',
  ico: '12345678', dic: 'CZ12345678',
  bank: 'CZ65 0800 0000 1920 0014 5399',
}

// ── Clients (12 klientů) ──────────────────────
export const defaultClients = [
  { id:1,  name:'Marie Horáčková',    phone:'+420 605 111 222', email:'marie.horackova@email.cz',  address:'Lipová 15, Brno-Židenice',    notes:'Velký pes Asta. Kód od branky: 4521. Preferuje dopoledne.',          tags:['pravidelný','vip'],        status:'active',   gardenSize:'střední', joinDate:'2022-03-15' },
  { id:2,  name:'Petr Dvořák',        phone:'+420 607 333 444', email:'petr.dvorak@firma.cz',      address:'Nad Přehradou 8, Brno-Bystrc', notes:'Firemní sídlo. IČO 87654321. Fakturovat koncem měsíce.',             tags:['firemní','pravidelný'],    status:'active',   gardenSize:'velká',   joinDate:'2022-01-10' },
  { id:3,  name:'Eva Kratochvílová',  phone:'+420 608 555 666', email:'eva.kratoch@seznam.cz',     address:'Polní 33, Šlapanice',          notes:'Alergická na pyl. Ráda se pobaví u kávy.',                          tags:['pravidelný'],              status:'active',   gardenSize:'malá',    joinDate:'2021-06-20' },
  { id:4,  name:'Tomáš Blaha',        phone:'+420 601 777 888', email:'tblaha@gmail.com',          address:'Větrná 5, Brno-Líšeň',        notes:'Novostavba, velká zahrada. Zajímá se o zahradničení.',              tags:['nový','pravidelný'],       status:'active',   gardenSize:'velká',   joinDate:'2024-02-01' },
  { id:5,  name:'Lucie Marková',      phone:'+420 604 999 000', email:'l.markova@email.cz',        address:'Slunečná 2, Brno-Bohunice',   notes:'Jednorázová zakázka — jarní úpravy.',                               tags:['jednorázový'],             status:'inactive', gardenSize:'malá',    joinDate:'2024-04-10' },
  { id:6,  name:'Robert Šimánek',     phone:'+420 603 222 111', email:'r.simanek@podnikatel.cz',   address:'Jasanová 44, Kuřim',          notes:'Zahrada 1200 m². Precizní práce nutností. Vždy platí v hotovosti.', tags:['vip','pravidelný'],        status:'active',   gardenSize:'velká',   joinDate:'2021-12-01' },
  { id:7,  name:'Jana Procházková',   phone:'+420 606 444 555', email:'jana.proch@volny.cz',       address:'Kaštanová 7, Brno-Řečkovice', notes:'Dvě kočky v zahradě. Vstup přes zadní vrátka.',                     tags:['pravidelný'],              status:'active',   gardenSize:'střední', joinDate:'2023-05-12' },
  { id:8,  name:'Milan Kovář',        phone:'+420 609 888 777', email:'m.kovar@centrum.cz',        address:'Pionýrská 22, Brno-Černovice', notes:'Pensionista, doma vždy. Preferuje páteční návštěvy.',               tags:['pravidelný'],              status:'active',   gardenSize:'malá',    joinDate:'2022-08-30' },
  { id:9,  name:'Správa bytů Jižní',  phone:'+420 543 210 987', email:'sprava@jiznimesto.cz',      address:'Horova 100, Brno-Nový Lískovec', notes:'Správa 3 bytových domů. Fakturovat na IČO 55667788.',            tags:['firemní','pravidelný'],    status:'active',   gardenSize:'velká',   joinDate:'2022-03-01' },
  { id:10, name:'Petra Nováková',     phone:'+420 602 345 678', email:'petra.novakova@gmail.com',  address:'Náměstí 5, Rosice',           notes:'Odjíždí každý pátek na chatu. Klíče u sousedky Hanzlové č. 7.',    tags:['pravidelný'],              status:'active',   gardenSize:'střední', joinDate:'2023-09-15' },
  { id:11, name:'Hotel Galaxie',      phone:'+420 541 321 654', email:'zahrada@hotelgalaxie.cz',   address:'Velká 6, Brno-střed',         notes:'Hotelová zahrada — reprezentativní vzhled nutností. Každý týden.', tags:['firemní','vip'],           status:'active',   gardenSize:'velká',   joinDate:'2021-04-20' },
  { id:12, name:'Karel Sedláček',     phone:'+420 777 123 456', email:'k.sedlacek@post.cz',        address:'Polní 88, Modřice',           notes:'Starý sad, 15 ovocných stromů. Specialista na řez.',               tags:['pravidelný'],              status:'active',   gardenSize:'střední', joinDate:'2023-11-01' },
]

// ── Orders (28 zakázek) ───────────────────────
export const defaultOrders = [
  // Dokončené — minulost
  { id:101, clientId:1,  date:'2024-03-10', status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:90,  totalPrice:1800, paid:true,  paidDate:'2024-03-12', notes:'Sekáno do 5 cm. Keře u plotu zastřiženy.', worker:'Jan Novák' },
  { id:102, clientId:2,  date:'2024-03-11', status:'completed', services:['Sekání trávy','Vertikutace','Odvoz odpadu'],       duration:180, totalPrice:4200, paid:true,  paidDate:'2024-03-31', notes:'Firemní zahrada, velká plocha. Odvoz 2×.',  worker:'Jan Novák' },
  { id:103, clientId:3,  date:'2024-03-15', status:'completed', services:['Sekání trávy','Zálivka'],                          duration:60,  totalPrice:900,  paid:true,  paidDate:'2024-03-20', notes:'Zálivka ovocných stromků.',                 worker:'Jan Novák' },
  { id:104, clientId:6,  date:'2024-03-18', status:'completed', services:['Sekání trávy','Stříhání živého plotu','Mulčování'],duration:240, totalPrice:5800, paid:true,  paidDate:'2024-03-18', notes:'Zaplaceno hotově na místě.',               worker:'Jan Novák' },
  { id:105, clientId:9,  date:'2024-03-20', status:'completed', services:['Sekání trávy','Hnojení trávníku'],                 duration:300, totalPrice:6200, paid:true,  paidDate:'2024-04-01', notes:'3 bytové domy, velké plochy.',              worker:'Jan Novák' },
  { id:106, clientId:11, date:'2024-03-25', status:'completed', services:['Sekání trávy','Stříhání keřů','Výsadba rostlin'], duration:210, totalPrice:7500, paid:true,  paidDate:'2024-03-25', notes:'Hotelová zahrada — sezónní výsadba.',       worker:'Jan Novák' },
  { id:107, clientId:1,  date:'2024-04-08', status:'completed', services:['Vertikutace','Hnojení trávníku'],                  duration:120, totalPrice:2400, paid:true,  paidDate:'2024-04-10', notes:'Jarní vertikutace a hnojení.',              worker:'Jan Novák' },
  { id:108, clientId:7,  date:'2024-04-12', status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:90,  totalPrice:1950, paid:true,  paidDate:'2024-04-15', notes:'',                                          worker:'Jan Novák' },
  { id:109, clientId:4,  date:'2024-04-15', status:'completed', services:['Sekání trávy','Odvoz odpadu'],                    duration:150, totalPrice:3200, paid:true,  paidDate:'2024-04-20', notes:'První návštěva, nafocen stav zahrady.',     worker:'Jan Novák' },
  { id:110, clientId:8,  date:'2024-04-18', status:'completed', services:['Sekání trávy'],                                   duration:45,  totalPrice:800,  paid:true,  paidDate:'2024-04-18', notes:'Malá zahrada, rychlá práce.',               worker:'Jan Novák' },
  { id:111, clientId:6,  date:'2024-04-22', status:'completed', services:['Sekání trávy','Stříhání živého plotu'],            duration:180, totalPrice:4400, paid:true,  paidDate:'2024-04-22', notes:'Zaplaceno hotově.',                         worker:'Jan Novák' },
  { id:112, clientId:2,  date:'2024-04-25', status:'completed', services:['Sekání trávy','Stříhání keřů','Zálivka'],         duration:200, totalPrice:4800, paid:true,  paidDate:'2024-04-30', notes:'',                                          worker:'Jan Novák' },
  { id:113, clientId:10, date:'2024-05-03', status:'completed', services:['Sekání trávy','Výsadba rostlin'],                 duration:120, totalPrice:3400, paid:true,  paidDate:'2024-05-05', notes:'Výsadba letniček.',                          worker:'Jan Novák' },
  { id:114, clientId:12, date:'2024-05-07', status:'completed', services:['Řez stromů','Odvoz odpadu'],                      duration:240, totalPrice:6800, paid:true,  paidDate:'2024-05-10', notes:'Jarní řez 15 ovocných stromů.',             worker:'Jan Novák' },
  { id:115, clientId:3,  date:'2024-05-10', status:'completed', services:['Sekání trávy'],                                   duration:50,  totalPrice:750,  paid:true,  paidDate:'2024-05-14', notes:'',                                          worker:'Jan Novák' },
  { id:116, clientId:9,  date:'2024-05-15', status:'completed', services:['Sekání trávy','Hnojení trávníku','Zálivka'],      duration:360, totalPrice:7800, paid:true,  paidDate:'2024-06-01', notes:'Májová údržba všech 3 objektů.',            worker:'Jan Novák' },
  { id:117, clientId:11, date:'2024-05-20', status:'completed', services:['Sekání trávy','Stříhání živého plotu'],            duration:180, totalPrice:5200, paid:true,  paidDate:'2024-05-20', notes:'Hotel — příprava na sezónu.',               worker:'Jan Novák' },
  { id:118, clientId:1,  date:'2024-06-05', status:'completed', services:['Sekání trávy','Stříhání keřů'],                   duration:90,  totalPrice:1800, paid:true,  paidDate:'2024-06-07', notes:'',                                          worker:'Jan Novák' },
  { id:119, clientId:4,  date:'2024-06-10', status:'completed', services:['Sekání trávy','Mulčování'],                       duration:140, totalPrice:3600, paid:false, paidDate:null,         notes:'Čeká na platbu.',                           worker:'Jan Novák' },
  { id:120, clientId:7,  date:'2024-06-12', status:'completed', services:['Sekání trávy'],                                   duration:60,  totalPrice:1100, paid:true,  paidDate:'2024-06-13', notes:'',                                          worker:'Jan Novák' },
  { id:121, clientId:8,  date:'2024-06-15', status:'completed', services:['Sekání trávy','Zálivka'],                         duration:60,  totalPrice:1000, paid:true,  paidDate:'2024-06-15', notes:'',                                          worker:'Jan Novák' },
  { id:122, clientId:3,  date:'2024-06-17', status:'completed', services:['Sekání trávy'],                                   duration:50,  totalPrice:750,  paid:false, paidDate:null,         notes:'Po splatnosti!',                            worker:'Jan Novák' },
  // Naplánované
  { id:123, clientId:6,  date:'2024-07-01', status:'scheduled', services:['Sekání trávy','Stříhání živého plotu','Mulčování'],duration:240, totalPrice:5800, paid:false, paidDate:null,         notes:'',                                          worker:'Jan Novák' },
  { id:124, clientId:1,  date:'2024-07-02', status:'scheduled', services:['Sekání trávy'],                                   duration:90,  totalPrice:1200, paid:false, paidDate:null,         notes:'',                                          worker:'Jan Novák' },
  { id:125, clientId:9,  date:'2024-07-03', status:'scheduled', services:['Sekání trávy','Hnojení trávníku'],                duration:300, totalPrice:6200, paid:false, paidDate:null,         notes:'Všechny 3 objekty.',                        worker:'Jan Novák' },
  { id:126, clientId:11, date:'2024-07-05', status:'scheduled', services:['Sekání trávy','Stříhání keřů'],                   duration:180, totalPrice:5500, paid:false, paidDate:null,         notes:'Hotel — letní údržba.',                     worker:'Jan Novák' },
  { id:127, clientId:2,  date:'2024-07-08', status:'scheduled', services:['Sekání trávy','Vertikutace'],                     duration:200, totalPrice:4600, paid:false, paidDate:null,         notes:'Letní vertikutace.',                        worker:'Jan Novák' },
  { id:128, clientId:10, date:'2024-07-10', status:'scheduled', services:['Sekání trávy','Stříhání keřů','Odvoz odpadu'],    duration:150, totalPrice:3800, paid:false, paidDate:null,         notes:'',                                          worker:'Jan Novák' },
]

// ── Invoices (18 faktur) ──────────────────────
export const defaultInvoices = [
  { id:'2024001', orderId:101, clientId:1,  date:'2024-03-10', dueDate:'2024-03-24', amount:1800, paid:true,  paidDate:'2024-03-12' },
  { id:'2024002', orderId:102, clientId:2,  date:'2024-03-11', dueDate:'2024-03-31', amount:4200, paid:true,  paidDate:'2024-03-31' },
  { id:'2024003', orderId:103, clientId:3,  date:'2024-03-15', dueDate:'2024-03-29', amount:900,  paid:true,  paidDate:'2024-03-20' },
  { id:'2024004', orderId:104, clientId:6,  date:'2024-03-18', dueDate:'2024-04-01', amount:5800, paid:true,  paidDate:'2024-03-18' },
  { id:'2024005', orderId:105, clientId:9,  date:'2024-03-20', dueDate:'2024-04-03', amount:6200, paid:true,  paidDate:'2024-04-01' },
  { id:'2024006', orderId:106, clientId:11, date:'2024-03-25', dueDate:'2024-04-08', amount:7500, paid:true,  paidDate:'2024-03-25' },
  { id:'2024007', orderId:107, clientId:1,  date:'2024-04-08', dueDate:'2024-04-22', amount:2400, paid:true,  paidDate:'2024-04-10' },
  { id:'2024008', orderId:108, clientId:7,  date:'2024-04-12', dueDate:'2024-04-26', amount:1950, paid:true,  paidDate:'2024-04-15' },
  { id:'2024009', orderId:109, clientId:4,  date:'2024-04-15', dueDate:'2024-04-29', amount:3200, paid:true,  paidDate:'2024-04-20' },
  { id:'2024010', orderId:112, clientId:2,  date:'2024-04-25', dueDate:'2024-05-09', amount:4800, paid:true,  paidDate:'2024-04-30' },
  { id:'2024011', orderId:113, clientId:10, date:'2024-05-03', dueDate:'2024-05-17', amount:3400, paid:true,  paidDate:'2024-05-05' },
  { id:'2024012', orderId:114, clientId:12, date:'2024-05-07', dueDate:'2024-05-21', amount:6800, paid:true,  paidDate:'2024-05-10' },
  { id:'2024013', orderId:116, clientId:9,  date:'2024-05-15', dueDate:'2024-05-29', amount:7800, paid:true,  paidDate:'2024-06-01' },
  { id:'2024014', orderId:117, clientId:11, date:'2024-05-20', dueDate:'2024-06-03', amount:5200, paid:true,  paidDate:'2024-05-20' },
  { id:'2024015', orderId:118, clientId:1,  date:'2024-06-05', dueDate:'2024-06-19', amount:1800, paid:true,  paidDate:'2024-06-07' },
  { id:'2024016', orderId:119, clientId:4,  date:'2024-06-10', dueDate:'2024-06-24', amount:3600, paid:false, paidDate:null },
  { id:'2024017', orderId:121, clientId:8,  date:'2024-06-15', dueDate:'2024-06-29', amount:1000, paid:true,  paidDate:'2024-06-15' },
  { id:'2024018', orderId:122, clientId:3,  date:'2024-06-17', dueDate:'2024-07-01', amount:750,  paid:false, paidDate:null },
]

// ── Services ──────────────────────────────────
export const defaultServices = [
  { id:'sekani',  name:'Sekání trávy',           pricePerUnit:8,   unit:'m²',    unitLabel:'za m²'    },
  { id:'kere',    name:'Stříhání keřů',           pricePerUnit:350, unit:'ks',    unitLabel:'za keř'   },
  { id:'plot',    name:'Stříhání živého plotu',   pricePerUnit:80,  unit:'bm',    unitLabel:'za bm'    },
  { id:'vertik',  name:'Vertikutace',             pricePerUnit:12,  unit:'m²',    unitLabel:'za m²'    },
  { id:'mulc',    name:'Mulčování',               pricePerUnit:15,  unit:'m²',    unitLabel:'za m²'    },
  { id:'odvoz',   name:'Odvoz odpadu',            pricePerUnit:800, unit:'jízda', unitLabel:'za odvoz' },
  { id:'zavlaha', name:'Zálivka',                 pricePerUnit:400, unit:'hod',   unitLabel:'za hod'   },
  { id:'stromy',  name:'Řez stromů',              pricePerUnit:900, unit:'ks',    unitLabel:'za strom' },
  { id:'hnojeni', name:'Hnojení trávníku',        pricePerUnit:6,   unit:'m²',    unitLabel:'za m²'    },
  { id:'listi',   name:'Shrabání listí',          pricePerUnit:500, unit:'hod',   unitLabel:'za hod'   },
  { id:'vysadba', name:'Výsadba rostlin',         pricePerUnit:200, unit:'ks',    unitLabel:'za ks'    },
  { id:'postik',  name:'Postřik / chemie',        pricePerUnit:600, unit:'hod',   unitLabel:'za hod'   },
]

// ── Tag & Status styles ───────────────────────
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

// ── Monthly revenue for chart ─────────────────
export const monthlyRevenue = [
  { month:'Led', revenue:18400, orders:8  },
  { month:'Úno', revenue:12200, orders:5  },
  { month:'Bře', revenue:31800, orders:14 },
  { month:'Dub', revenue:42600, orders:18 },
  { month:'Kvě', revenue:56800, orders:22 },
  { month:'Čer', revenue:48200, orders:19 },
  { month:'Čvc', revenue:0,     orders:0  },
  { month:'Srp', revenue:0,     orders:0  },
  { month:'Zář', revenue:0,     orders:0  },
  { month:'Říj', revenue:0,     orders:0  },
  { month:'Lis', revenue:0,     orders:0  },
  { month:'Pro', revenue:0,     orders:0  },
]
