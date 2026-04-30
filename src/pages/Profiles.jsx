import { useState } from 'react'
import { useAuth, defaultProfiles } from '../hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormField, Dialog, ConfirmDialog, toast } from '../components/ui'
import { Plus, Edit2, Trash2, Eye, EyeOff, Shield, Briefcase, Calculator, User, Lock } from 'lucide-react'
import { cn } from '../lib/utils'

const ROLES = [
  { value:'owner',     label:'Majitel',   icon:Shield,     color:'bg-green-600',  desc:'Plný přístup — vše včetně nastavení a mazání dat' },
  { value:'worker',    label:'Zahradník', icon:Briefcase,  color:'bg-blue-600',   desc:'Zakázky, checklist, klienti, kalendář. Finance skryty.' },
  { value:'accountant',label:'Účetní',    icon:Calculator, color:'bg-purple-600', desc:'Faktury, ceník a exporty. Zakázky a klienti skryti.' },
]

const PERMISSIONS_MAP = {
  owner:      { dashboard:true, orders:true, checklist:true, clients:true, invoices:true, pricelist:true, notifications:true, settings:true, calendar:true, seeFinances:true, editPrices:true, deleteData:true },
  worker:     { dashboard:true, orders:true, checklist:true, clients:true, invoices:false, pricelist:false, notifications:false, settings:false, calendar:true, seeFinances:false, editPrices:false, deleteData:false },
  accountant: { dashboard:true, orders:false, checklist:false, clients:false, invoices:true, pricelist:true, notifications:false, settings:false, calendar:false, seeFinances:true, editPrices:false, deleteData:false },
}

const PERM_LABELS = {
  dashboard:'Dashboard', orders:'Zakázky', checklist:'Checklist', clients:'Klienti',
  invoices:'Faktury', pricelist:'Ceník', notifications:'Notifikace', settings:'Nastavení',
  calendar:'Kalendář', seeFinances:'Vidí finance', editPrices:'Upraví ceny', deleteData:'Může mazat',
}

const pinColors = ['bg-green-600','bg-blue-600','bg-purple-600','bg-amber-600','bg-rose-600']
const emptyForm = { name:'', role:'worker', pin:'', confirmPin:'', initials:'' }

export function Profiles() {
  const { profiles, currentUser, addProfile, updateProfile, deleteProfile, logout, ROLE_DESCRIPTIONS } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showPin, setShowPin] = useState(false)
  const [pinError, setPinError] = useState('')

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setPinError('')
    setModalOpen(true)
  }
  function openEdit(p) {
    setEditingId(p.id)
    setForm({ name:p.name, role:p.role, pin:p.pin, confirmPin:p.pin, initials:p.initials })
    setPinError('')
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) { toast('Zadejte jméno', 'error'); return }
    if (!form.pin || form.pin.length < 4) { setPinError('PIN musí mít alespoň 4 číslice'); return }
    if (form.pin !== form.confirmPin) { setPinError('PINy se neshodují'); return }
    const initials = form.initials || form.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    const data = { name:form.name.trim(), role:form.role, roleLabel:ROLES.find(r=>r.value===form.role)?.label||'', pin:form.pin, initials, permissions:PERMISSIONS_MAP[form.role], color: pinColors[profiles.length % pinColors.length] }
    if (editingId) {
      updateProfile({ ...profiles.find(p=>p.id===editingId), ...data })
      toast('Profil upraven')
    } else {
      addProfile(data)
      toast('Profil přidán')
    }
    setModalOpen(false)
  }

  function handleAutoInitials(name) {
    const initials = name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    setForm(f => ({ ...f, name, initials }))
  }

  const isOwner = currentUser?.role === 'owner'

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Profily a přístupy</h2>
          <p className="text-sm text-muted-foreground">Správa uživatelů a jejich oprávnění</p>
        </div>
        {isOwner && (
          <Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nový profil</Button>
        )}
      </div>

      {/* Current user banner */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0', currentUser?.color||'bg-green-600')}>
          {currentUser?.initials}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{currentUser?.name}</p>
          <p className="text-xs text-muted-foreground">{currentUser?.roleLabel} · Přihlášen</p>
        </div>
        <Button size="sm" variant="ghost" onClick={logout} className="gap-1 flex-shrink-0"><Lock size={12}/>Odhlásit</Button>
      </div>

      {/* Profiles list */}
      <div className="space-y-3">
        {profiles.map((p, i) => {
          const RoleIcon = ROLES.find(r=>r.value===p.role)?.icon || User
          const isCurrent = currentUser?.id === p.id
          return (
            <Card key={p.id} className={cn(isCurrent && 'ring-2 ring-primary')}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0', pinColors[i % pinColors.length])}>
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold tracking-tight">{p.name}</p>
                      {isCurrent && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">Aktivní</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <RoleIcon size={12} className="text-muted-foreground"/>
                      <p className="text-sm text-muted-foreground">{p.roleLabel}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{ROLE_DESCRIPTIONS[p.role]}</p>
                    {/* Permissions chips */}
                    <div className="flex flex-wrap gap-1 mt-3 overflow-hidden">
                      {Object.entries(p.permissions||{}).filter(([,v])=>v).map(([key]) => (
                        <span key={key} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                          {PERM_LABELS[key]||key}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isOwner && !isCurrent && (
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button size="icon-sm" onClick={() => openEdit(p)}><Edit2 size={12}/></Button>
                      {p.id !== 1 && (
                        <Button variant="danger" size="icon-sm" onClick={() => setDeleteId(p.id)}><Trash2 size={12}/></Button>
                      )}
                    </div>
                  )}
                  {isOwner && isCurrent && (
                    <Button size="sm" onClick={() => openEdit(p)} className="flex-shrink-0 gap-1"><Edit2 size={12}/>Upravit</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Role descriptions */}
      <Card>
        <CardHeader><CardTitle>Typy oprávnění</CardTitle></CardHeader>
        <CardContent className="p-4 space-y-3">
          {ROLES.map(r => (
            <div key={r.value} className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', r.color)}>
                <r.icon size={14} className="text-white"/>
              </div>
              <div>
                <p className="text-sm font-semibold">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit profil' : 'Nový profil'}
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit profil</Button></>}>

        <FormField label="Celé jméno *">
          <Input value={form.name} onChange={e => handleAutoInitials(e.target.value)} placeholder="Jan Novák"/>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Zkratka (2 písmena)">
            <Input value={form.initials} onChange={e => setForm(f=>({...f,initials:e.target.value.toUpperCase().slice(0,2)}))} placeholder="JN" maxLength={2}/>
          </FormField>
        </div>

        <FormField label="Role a oprávnění *">
          <div className="space-y-2">
            {ROLES.map(r => (
              <label key={r.value} className={cn('flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all touch-manipulation',
                form.role === r.value ? 'border-primary bg-green-50' : 'border-border hover:border-green-300'
              )}>
                <input type="radio" name="role" value={r.value} checked={form.role===r.value}
                  onChange={() => setForm(f=>({...f,role:r.value}))} className="mt-0.5 accent-primary flex-shrink-0"/>
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="PIN (4+ číslice) *" hint="Pouze čísla">
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                value={form.pin}
                onChange={e => { setForm(f=>({...f,pin:e.target.value.replace(/\D/,'')})); setPinError('') }}
                placeholder="1234"
                maxLength={8}
                inputMode="numeric"
              />
              <button type="button" onClick={() => setShowPin(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground touch-manipulation">
                {showPin ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </FormField>
          <FormField label="Potvrdit PIN *">
            <Input
              type={showPin ? 'text' : 'password'}
              value={form.confirmPin}
              onChange={e => { setForm(f=>({...f,confirmPin:e.target.value.replace(/\D/,'')})); setPinError('') }}
              placeholder="1234"
              maxLength={8}
              inputMode="numeric"
            />
          </FormField>
        </div>
        {pinError && <p className="text-sm text-destructive font-medium">{pinError}</p>}
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteProfile(deleteId); toast('Profil odstraněn', 'warning') }}
        title="Odstranit profil?" description="Tato akce je nevratná." confirmLabel="Odstranit" variant="danger"/>
    </div>
  )
}
