import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, Button, Input, PillTabs } from '../components/ui'
import {
  BookOpen, Rocket, Lightbulb, HelpCircle, Phone, ChevronRight, ChevronDown,
  Search, CheckCircle, Sparkles, Star, Zap, Clock, Users, ClipboardList,
  Calendar as CalIcon, Receipt, FileEdit, FileSignature, AlertTriangle,
  Truck, Package, Building2, BadgeDollarSign, CheckSquare, Bell,
  Mail, Globe, Heart, Camera
} from 'lucide-react'
import { cn } from '../lib/utils'

// ── Manual sections ──
const sections = [
  {
    id: 'dashboard', icon: Sparkles, title: 'Dashboard',
    short: 'Centrální přehled celé firmy',
    content: [
      { type:'p', text:'Dashboard je úvodní obrazovka která ukazuje klíčové údaje pro daný den a měsíc. Pro majitele je to první místo kde ráno ověří stav firmy.' },
      { type:'h', text:'Co tady najdete' },
      { type:'list', items:[
        'Statistiky tržeb, zakázek, klientů a nezaplacených faktur',
        'Souhrn dne — tržby, výdaje (z účtenek), čistý zisk + marže',
        'Stav týmu dnes — kdo pracuje, kdo má volno, kolik zakázek',
        'Top klienti — nejvýdělečnější klienti tento měsíc',
        'Mapa klientů Praha-východ',
        'Rychlé akce pro vytvoření zakázky/klienta/faktury',
      ]},
      { type:'tip', text:'Klikněte na kartu "Stav týmu" → otevře sekci Tým s detailním rozvrhem' },
    ]
  },
  {
    id: 'calendar', icon: CalIcon, title: 'Kalendář',
    short: 'Plánování zakázek po dnech',
    content: [
      { type:'p', text:'Kalendář zobrazuje všechny zakázky v měsíčním nebo týdenním pohledu.' },
      { type:'h', text:'Jak používat' },
      { type:'list', items:[
        'Klikněte na den → zobrazí se zakázky daného dne',
        'Drag & drop zakázek mezi dny pro přeplánování',
        'Šipky vlevo/vpravo pro pohyb mezi měsíci',
        'Tlačítko "Dnes" vrátí na aktuální den',
      ]},
      { type:'tip', text:'Pro týmový pohled (kdo dělá co) použijte sekci Tým' },
    ]
  },
  {
    id: 'team', icon: Users, title: 'Tým',
    short: 'Rozvrh pracovníků a absence',
    content: [
      { type:'p', text:'Sekce Tým ukazuje kdo z pracovníků pracuje, má volno nebo je nemocný. Plus schvalování žádostí o volno.' },
      { type:'h', text:'Pro majitele (Jan)' },
      { type:'list', items:[
        'Vidí všechny pracovníky najednou v týdenním kalendáři',
        'Schvaluje/zamítá žádosti o volno (žluté upozornění nahoře)',
        'Klikem na den vidí kdo dělá co',
        'Přidává absence libovolnému pracovníkovi (rovnou schválené)',
      ]},
      { type:'h', text:'Pro zahradníka (Tomáš)' },
      { type:'list', items:[
        'Tlačítko "Požádat o volno" → vyberete typ a datum',
        'Žádost čeká na schválení od Jana',
        'Vidíte své zakázky a kolik mají kolegové',
      ]},
      { type:'tip', text:'Při tvorbě zakázky aplikace automaticky upozorní pokud má pracovník absenci v tom datu' },
    ]
  },
  {
    id: 'orders', icon: ClipboardList, title: 'Zakázky',
    short: 'Plánování konkrétních prací',
    content: [
      { type:'p', text:'Zakázka = konkrétní návštěva u klienta (např. "Sekání trávníku 6.5. u Šimánka").' },
      { type:'h', text:'Vytvoření zakázky' },
      { type:'list', items:[
        'Tlačítko "Nová zakázka" nebo FAB + → Nová zakázka',
        'Vyberte klienta → datum → služby z ceníku',
        'Cena se napočítá automaticky podle ceníku',
        'Přidělíte pracovníka (vidíte kdo má dostupnost)',
        'Volitelné: opakovaná zakázka (týdně, měsíčně...)',
      ]},
      { type:'h', text:'Po dokončení' },
      { type:'list', items:[
        'V Checklistu označíte zakázku jako dokončenou',
        'Aplikace nabídne automatické vytvoření faktury',
        'Pokud byla opakovaná → automaticky vytvoří další termín',
      ]},
      { type:'tip', text:'Swipe doleva na kartě = označit dokončené, swipe doprava = duplikovat' },
    ]
  },
  {
    id: 'checklist', icon: CheckSquare, title: 'Checklist',
    short: 'Vykonávání zakázek krok za krokem',
    content: [
      { type:'p', text:'Checklist je pracovní obrazovka pro zahradníka v terénu. Otevře aktuální zakázku a vede ho seznamem úkolů.' },
      { type:'h', text:'Jak používat' },
      { type:'list', items:[
        'Otevřete zakázku → načte šablonu úkolů podle objednaných služeb',
        'Spusťte časomíru pro měření doby práce',
        'Odškrtávejte úkoly jak je dokončujete',
        'Po splnění všech → tlačítko "Dokončit" + nabídka faktury',
      ]},
      { type:'tip', text:'Pro klienty s opakovanou zakázkou aplikace nabídne další termín automaticky' },
    ]
  },
  {
    id: 'clients', icon: Users, title: 'Klienti',
    short: 'Databáze zákazníků',
    content: [
      { type:'p', text:'CRM databáze klientů s mapou, historií, fotkami a sezónním plánem.' },
      { type:'h', text:'Karta klienta obsahuje' },
      { type:'list', items:[
        'Kontakt — telefon, email, adresa',
        'Štítky (premium, sezónní, hotel...)',
        'Časovou osu všech zakázek a faktur',
        'Náklady a účtenky pro daného klienta',
        'Sezónní plán prací',
        'Fotogalerie zahrady (před/po)',
      ]},
      { type:'h', text:'Mapa klientů' },
      { type:'p', text:'Tlačítko "Mapa" zobrazí všechny aktivní klienty na mapě Prahy-východ pro plánování tras.' },
      { type:'tip', text:'Klientský portál — sdílejte odkaz s PIN 4455, klient vidí své zakázky a faktury' },
    ]
  },
  {
    id: 'quotes', icon: FileEdit, title: 'Nabídky',
    short: 'Cenové nabídky před zakázkou',
    content: [
      { type:'p', text:'Cenová nabídka je dokument který pošlete klientovi před tím než přijmete zakázku. Klient ji buď přijme, odmítne nebo požádá o úpravy.' },
      { type:'h', text:'Životní cyklus nabídky' },
      { type:'list', items:[
        '1. Rozpracovaná — vytváříte ji, klient ji nevidí',
        '2. Odeslaná — klient ji obdržel a rozhoduje se',
        '3. Přijatá → konvertujte na fakturu jedním klikem',
        '3. Odmítnutá → můžete duplikovat a upravit',
      ]},
      { type:'h', text:'Položky z ceníku' },
      { type:'p', text:'V nabídce můžete přidat položku ručně nebo z ceníku služeb (dropdown "+ z ceníku služeb").' },
      { type:'tip', text:'Konverze přijaté nabídky → faktura zachová všechny položky a ceny' },
    ]
  },
  {
    id: 'contracts', icon: FileSignature, title: 'Smlouvy',
    short: 'Paušální dohody na sezónu/rok',
    content: [
      { type:'p', text:'Smlouvy jsou dlouhodobé dohody s paušální měsíční cenou — např. celoroční údržba zahrady za 8 500 Kč/měsíc.' },
      { type:'h', text:'Typy smluv' },
      { type:'list', items:[
        'Sezónní paušál — typicky březen-listopad (zahradnická sezóna)',
        'Roční smlouva — celoroční pokrytí',
        'Měsíční — krátkodobá smlouva',
        'Jednorázová — projekt s pevnou cenou',
      ]},
      { type:'h', text:'MRR (Monthly Recurring Revenue)' },
      { type:'p', text:'Hlavní KPI = součet měsíčních paušálů aktivních smluv. Ukazuje stabilní příjem který firma má bez ohledu na jednorázové zakázky.' },
      { type:'tip', text:'Auto-obnova upozorní 60 dnů před vypršením smlouvy' },
    ]
  },
  {
    id: 'invoices', icon: Receipt, title: 'Faktury',
    short: 'Vystavování a sledování plateb',
    content: [
      { type:'p', text:'Faktura = doklad pro zaplacení. Generuje se automaticky po dokončené zakázce nebo z přijaté nabídky.' },
      { type:'h', text:'Funkce' },
      { type:'list', items:[
        'PDF generování s logem firmy',
        'Tisk přímo z aplikace',
        'Filtry: zaplacené / nezaplacené / po splatnosti',
        'Označit jako zaplacené → pošle SMS poděkování klientovi',
        'Refakturace nákladů z účtenek (s marží)',
      ]},
      { type:'tip', text:'Číslování je automatické formát YYYYNNN (např. 2026007)' },
    ]
  },
  {
    id: 'receipts', icon: Receipt, title: 'Účtenky',
    short: 'Výdaje firmy a refakturace',
    content: [
      { type:'p', text:'Účtenky = doklady o nákupu materiálu (kůra, hnojiva, palivo...). Aplikace eviduje co se kupuje pro koho a kolik z toho refakturovat.' },
      { type:'h', text:'Naskenování účtenky' },
      { type:'list', items:[
        '1. V terénu zaplatíte v hobby marketu',
        '2. Otevřete app → tlačítko "Naskenovat účtenku" (nebo FAB → Camera)',
        '3. Vyfotíte → aplikace rozpozná částku a dodavatele (OCR)',
        '4. Vyberete pro kterého klienta a zakázku',
        '5. Uložíte → účtenka je propojená všude',
      ]},
      { type:'h', text:'Refakturace' },
      { type:'p', text:'Pokud je účtenka označena "Refakturovat klientovi" s marží např. 15 %, aplikace navrhne přidat ji k další faktuře.' },
      { type:'tip', text:'Účtenky se zobrazují i v detailu klienta (sekce Náklady) a snižují čistý zisk na Dashboardu' },
    ]
  },
  {
    id: 'complaints', icon: AlertTriangle, title: 'Reklamace',
    short: 'Problémy a jejich řešení',
    content: [
      { type:'p', text:'Track stížností a problémů od klientů. Pomáhá udržet kvalitu služeb a sledovat náklady reklamací.' },
      { type:'h', text:'Životní cyklus reklamace' },
      { type:'list', items:[
        '1. Otevřená — klient nahlásil problém',
        '2. Řeší se — pracujete na nápravě',
        '3. Vyřešená — problém uzavřený',
        '4. Zamítnutá — reklamace neuznaná',
      ]},
      { type:'h', text:'Statistiky' },
      { type:'p', text:'Aplikace měří průměrnou dobu řešení (např. 15 dnů) a celkové náklady reklamací.' },
      { type:'tip', text:'Reklamaci lze propojit ke konkrétní zakázce — historie pak ukáže kolik problémů bylo' },
    ]
  },
  {
    id: 'vehicles', icon: Truck, title: 'Vozidla',
    short: 'Tachograf a kniha jízd',
    content: [
      { type:'p', text:'Evidence vozidel firmy s knihou jízd, tankováním a dokumenty (pojištění, STK).' },
      { type:'h', text:'Tři záložky' },
      { type:'list', items:[
        'Vozidla — flotila, SPZ, stav km, dokumenty',
        'Jízdy — kniha jízd s účelem a klientem',
        'Tankování — palivo s cenou a litry',
      ]},
      { type:'h', text:'Upozornění' },
      { type:'p', text:'Aplikace upozorní 30 dnů před vypršením pojistky nebo STK.' },
      { type:'tip', text:'Pro daňové účely můžete jízdu propojit ke klientovi → uvidíte kilometry pro každého klienta' },
    ]
  },
  {
    id: 'pricelist', icon: BadgeDollarSign, title: 'Ceník služeb',
    short: 'Vaše služby a jejich ceny',
    content: [
      { type:'p', text:'Ceník je seznam všech služeb které firma nabízí (sekání trávníku 25 Kč/m², mulčování 180 Kč/pytel...).' },
      { type:'h', text:'Použití' },
      { type:'list', items:[
        'Při tvorbě zakázky vybíráte ze služeb v ceníku',
        'Při tvorbě nabídky můžete přidat položku z ceníku',
        'Cenové balíčky — zvýhodněné kombinace pro celé sezóny',
      ]},
      { type:'tip', text:'Změna ceny v ceníku neovlivní již vystavené zakázky/faktury' },
    ]
  },
  {
    id: 'products', icon: Package, title: 'Produkty',
    short: 'Skladové zásoby',
    content: [
      { type:'p', text:'Sklad zboží které firma drží — substráty, hnojiva, osiva, rostliny, nářadí.' },
      { type:'h', text:'Co aplikace sleduje' },
      { type:'list', items:[
        'Aktuální zásobu (kolik je na skladě)',
        'Minimální zásobu (upozornění při poklesu)',
        'Stav: Skladem / Nízký / Vyprodáno',
        'Hodnotu skladu (cena × kusy)',
        'Top kategorie a obraty',
      ]},
      { type:'tip', text:'Filtry: zobrazit jen "Nízký sklad" → vidíte co potřebuje doplnit' },
    ]
  },
  {
    id: 'suppliers', icon: Building2, title: 'Dodavatelé',
    short: 'Kontaktní adresář dodavatelů',
    content: [
      { type:'p', text:'Adresář všech firem od kterých nakupujete (AGRO CS, COMPO, Školka Litomyšl...).' },
      { type:'h', text:'U každého dodavatele' },
      { type:'list', items:[
        'Kontaktní osoba, telefon, email, web',
        'IČO, DIČ, číslo účtu (pro fakturaci)',
        'Kategorie zboží které dodává',
        'Hodnocení 1-5 hvězd (vaše zkušenost)',
        'Oblíbený toggle — TOP partneři',
        'Min. objednávka, doba dodání, sleva',
      ]},
      { type:'tip', text:'V detailu vidíte všechny produkty od daného dodavatele a jejich ceny' },
    ]
  },
]

// ── Quick start steps ──
const quickStartSteps = [
  { num: 1, title: 'Přihlaste se',
    text: 'Otevřete aplikaci → vyberte profil (Jan/Tomáš/Eva) → zadejte PIN. Jan má PIN 1234.' },
  { num: 2, title: 'Projděte Dashboard',
    text: 'Hlavní obrazovka s přehledem dne. Najdete tu vše co potřebujete vědět ráno.' },
  { num: 3, title: 'Vytvořte první zakázku',
    text: 'Klikněte FAB tlačítko (+) → Nová zakázka → vyberte klienta a služby. Cena se napočítá sama.' },
  { num: 4, title: 'V terénu otevřete Checklist',
    text: 'V den zakázky → Checklist → otevřete dnešní zakázku → spusťte časomíru → odškrtávejte úkoly.' },
  { num: 5, title: 'Po dokončení vytvořte fakturu',
    text: 'Po dokončení zakázky aplikace nabídne vystavit fakturu. Klikněte ano. Hotovo.' },
]

// ── Tips ──
const tips = [
  { icon: '⌘K', title: 'Globální vyhledávání', text: 'Klávesa Cmd+K (nebo K) otevře vyhledávač přes celou aplikaci — najde klienty, zakázky, faktury.' },
  { icon: '+', title: 'FAB tlačítko na mobilu', text: 'Velké zelené tlačítko + vpravo dole. 5 rychlých akcí: Nová zakázka, klient, faktura, produkt, naskenovat účtenku.' },
  { icon: '👈', title: 'Swipe gesta', text: 'Na mobilu: swipe doleva na kartě = smazat / dokončit. Swipe doprava = duplikovat / označit.' },
  { icon: '📷', title: 'OCR účtenek', text: 'V Účtenkách → Naskenovat → vyfotíte účtenku → aplikace rozpozná částku a dodavatele automaticky.' },
  { icon: '🌙', title: 'Tmavý režim', text: 'V Nastavení → vlevo dole najdete přepínač tmavého režimu. Šetří baterku a oči.' },
  { icon: '🔄', title: 'Pull to refresh', text: 'Na mobilu na hlavních stránkách stáhněte prstem dolů od horního okraje pro refresh dat.' },
  { icon: '🎯', title: 'Klávesové zkratky', text: 'Stiskněte ? pro zobrazení všech klávesových zkratek (N=nová zakázka, C=nový klient, F=faktura...).' },
  { icon: '📌', title: 'Sbalený sidebar', text: 'Klikněte na nadpis skupiny v menu (např. KATALOG) pro sbalení/rozbalení. Stav se uloží.' },
  { icon: '👤', title: 'Klientský portál', text: 'Sdílejte odkaz /portal/[id] s PIN 4455 — klient vidí své zakázky, faktury a může komunikovat.' },
  { icon: '💰', title: 'Refakturace', text: 'V účtenkách zaškrtněte "Refakturovat klientovi" + marži. Aplikace navrhne připojit k další faktuře.' },
]

// ── FAQ ──
const faq = [
  { q: 'Kde se ukládají moje data?', a: 'Lokálně ve vašem prohlížeči (localStorage). Když smažete data prohlížeče, data zmizí. Pro zálohu použijte Nastavení → Export.' },
  { q: 'Jak přidám nového pracovníka?', a: 'Sekce Profily → Nový profil. Zadejte jméno, roli (zahradník/účetní/majitel), barvu a PIN.' },
  { q: 'Funguje aplikace offline?', a: 'Ano. Po prvním načtení můžete pracovat bez internetu. Změny se uloží lokálně.' },
  { q: 'Jak vyexportuji data do Excelu?', a: 'Nastavení → Export. Můžete stáhnout CSV se všemi klienty nebo fakturami pro Excel.' },
  { q: 'Mohu zakázku upravit po vytvoření?', a: 'Ano. V seznamu zakázek klikněte na zakázku → tlačítko Upravit. Cena se přepočte.' },
  { q: 'Co znamená MRR ve smlouvách?', a: 'Monthly Recurring Revenue — měsíční obrat z paušálů. Klíčový ukazatel stability příjmů.' },
  { q: 'Jak mám naskenovat účtenku?', a: 'Účtenky → tlačítko "Naskenovat účtenku" → klikněte "Vyfotit" → aplikace rozpozná údaje → potvrdíte.' },
  { q: 'Co dělat když zapomenu PIN?', a: 'V Nastavení → Resetovat aplikaci. POZOR: smaže všechna data. Lepší si PIN někam zaznamenat.' },
  { q: 'Jak změnit logo na faktuře?', a: 'V současné verzi je logo pevné. V budoucí verzi přidáme nahrání vlastního loga.' },
  { q: 'Mohu poslat fakturu emailem?', a: 'Tlačítko "Odeslat" v náhledu faktury simuluje odeslání. Pro reálné odeslání zatím použijte stažený PDF a vlastní email.' },
]

const TABS = [
  { value:'manual',  label:'Příručka',     icon:BookOpen },
  { value:'quick',   label:'Rychlý start', icon:Rocket },
  { value:'tips',    label:'Tipy',         icon:Lightbulb },
  { value:'faq',     label:'FAQ',          icon:HelpCircle },
  { value:'support', label:'Podpora',      icon:Phone },
]

export function Help() {
  const [tab, setTab] = useState('manual')
  const [search, setSearch] = useState('')
  const [openSection, setOpenSection] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  const filteredSections = sections.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
      || s.short.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">

      {/* Hero */}
      <Card className="bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-200">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-white"/>
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Nápověda a návody</h1>
              <p className="text-sm text-muted-foreground">Naučte se používat ZahradaPro naplno. Kompletní průvodce všemi funkcemi.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all touch-manipulation flex-shrink-0',
                tab === t.value ? 'bg-foreground text-white border-foreground' : 'bg-white text-muted-foreground border-border hover:border-foreground'
              )}>
              <t.icon size={14}/>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* MANUAL */}
      {tab === 'manual' && (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hledat v příručce…" className="pl-8"/>
          </div>

          <div className="space-y-2">
            {filteredSections.map(s => {
              const isOpen = openSection === s.id
              return (
                <Card key={s.id} className={cn('transition-all', isOpen && 'shadow-md')}>
                  <button onClick={() => setOpenSection(isOpen ? null : s.id)}
                    className="w-full p-4 flex items-center gap-3 text-left touch-manipulation">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <s.icon size={18} className="text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold tracking-tight">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.short}</p>
                    </div>
                    {isOpen ? <ChevronDown size={18} className="text-muted-foreground flex-shrink-0"/>
                            : <ChevronRight size={18} className="text-muted-foreground flex-shrink-0"/>}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 -mt-1 space-y-3">
                      {s.content.map((block, i) => {
                        if (block.type === 'p')   return <p key={i} className="text-sm leading-relaxed">{block.text}</p>
                        if (block.type === 'h')   return <p key={i} className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-3 mb-1">{block.text}</p>
                        if (block.type === 'list') return (
                          <ul key={i} className="space-y-1.5">
                            {block.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm">
                                <CheckCircle size={13} className="text-primary mt-0.5 flex-shrink-0"/>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )
                        if (block.type === 'tip') return (
                          <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                            <Lightbulb size={14} className="text-amber-600 flex-shrink-0 mt-0.5"/>
                            <p className="text-xs leading-relaxed text-amber-900"><strong>Tip:</strong> {block.text}</p>
                          </div>
                        )
                        return null
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
            {filteredSections.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">Žádné výsledky pro "{search}"</p>
            )}
          </div>
        </>
      )}

      {/* QUICK START */}
      {tab === 'quick' && (
        <div className="space-y-3">
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">
                <strong>Začínáte poprvé?</strong> Tento průvodce vás provede aplikací za 5 jednoduchých kroků.
                Po každém kroku vyzkoušejte si v aplikaci to co jste se naučili.
              </p>
            </CardContent>
          </Card>

          {quickStartSteps.map(step => (
            <Card key={step.num}>
              <CardContent className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20}/>
              </div>
              <div className="flex-1">
                <p className="font-bold">Hotovo!</p>
                <p className="text-sm text-muted-foreground">Teď máte základ. Pro detaily ostatních funkcí jděte do <strong>Příručky</strong>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TIPS */}
      {tab === 'tips' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-base font-mono font-bold">
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm mb-1">{tip.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ */}
      {tab === 'faq' && (
        <div className="space-y-2">
          {faq.map((item, i) => (
            <Card key={i} className={cn('transition-all', openFaq === i && 'shadow-md')}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 flex items-start gap-3 text-left touch-manipulation">
                <HelpCircle size={16} className="text-primary mt-0.5 flex-shrink-0"/>
                <p className="font-semibold text-sm flex-1">{item.q}</p>
                {openFaq === i ? <ChevronDown size={16} className="text-muted-foreground flex-shrink-0"/>
                              : <ChevronRight size={16} className="text-muted-foreground flex-shrink-0"/>}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 -mt-1 ml-7">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* SUPPORT */}
      {tab === 'support' && (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Phone size={24} className="text-primary"/>
                </div>
                <h3 className="text-lg font-bold mb-1">Kontaktní podpora</h3>
                <p className="text-sm text-muted-foreground">Něco vám nejde? Napište nám nebo zavolejte.</p>
              </div>

              <div className="space-y-2">
                <a href="mailto:podpora@zahradapro.cz" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-green-50 transition-all touch-manipulation">
                  <Mail size={18} className="text-primary flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold text-sm">podpora@zahradapro.cz</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0"/>
                </a>
                <a href="tel:+420800123456" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-green-50 transition-all touch-manipulation">
                  <Phone size={18} className="text-primary flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Telefon (po-pá 9-17h)</p>
                    <p className="font-semibold text-sm">800 123 456</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0"/>
                </a>
                <a href="https://zahradapro.cz" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-green-50 transition-all touch-manipulation">
                  <Globe size={18} className="text-primary flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Web a dokumentace</p>
                    <p className="font-semibold text-sm">zahradapro.cz</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0"/>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50/50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Heart size={16} className="text-rose-500 flex-shrink-0 mt-0.5"/>
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Dejte nám zpětnou vazbu</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Aplikaci stále vylepšujeme. Pokud máte nápad na novou funkci nebo narážíte na problém,
                    napište nám. Vaše zpětná vazba nás žene dopředu.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">ZahradaPro · verze 2.5</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Vyrobeno s láskou pro zahradnické firmy v ČR 🌱</p>
          </div>
        </div>
      )}
    </div>
  )
}
