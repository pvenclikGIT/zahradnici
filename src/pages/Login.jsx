import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { Leaf, Delete } from 'lucide-react'

export function Login() {
  const { profiles, login } = useAuth()
  const [selected, setSelected] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function selectProfile(p) {
    setSelected(p)
    setPin('')
    setError('')
  }

  function pressKey(key) {
    if (pin.length >= 6) return
    const next = pin + key
    setPin(next)
    setError('')

    // Auto-submit when 4 digits
    if (next.length === 4) {
      setTimeout(() => tryLogin(next), 120)
    }
  }

  function tryLogin(pinValue) {
    const result = login(selected.id, pinValue || pin)
    if (!result.ok) {
      setError('Špatný PIN. Zkuste znovu.')
      setPin('')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  function backspace() {
    setPin(p => p.slice(0, -1))
    setError('')
  }

  const pinColors = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
          <Leaf size={20} className="text-green-400" strokeWidth={2}/>
        </div>
        <div>
          <p className="text-lg font-bold text-white tracking-tight">ZahradaPro</p>
          <p className="text-xs text-white/40">Správa zakázek</p>
        </div>
      </div>

      {!selected ? (
        /* ── Profile Selection ── */
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white text-center mb-2 tracking-tight">Vyberte profil</h1>
          <p className="text-sm text-white/40 text-center mb-8">Kdo se dnes přihlašuje?</p>

          <div className="space-y-3">
            {profiles.map((p, i) => (
              <button key={p.id} onClick={() => selectProfile(p)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/8 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all active:scale-[0.98] touch-manipulation text-left">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0', pinColors[i % pinColors.length])}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{p.name}</p>
                  <p className="text-sm text-white/50">{p.roleLabel}</p>
                </div>
                <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-400 opacity-60"/>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-white/20 mt-8">ZahradaPro v2.7.0</p>
        </div>
      ) : (
        /* ── PIN Entry ── */
        <div className={cn('w-full max-w-xs transition-transform', shake && 'animate-bounce')}>
          {/* Profile badge */}
          <button onClick={() => setSelected(null)} className="flex items-center gap-3 mx-auto mb-8 group">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white', selected.color || 'bg-green-600')}>
              {selected.initials}
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">{selected.name}</p>
              <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">{selected.roleLabel} · Změnit</p>
            </div>
          </button>

          <h2 className="text-xl font-bold text-white text-center mb-2">Zadejte PIN</h2>
          <p className="text-sm text-white/40 text-center mb-6">4-místný kód</p>

          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className={cn('w-4 h-4 rounded-full border-2 transition-all duration-150',
                pin.length > i
                  ? 'bg-green-400 border-green-400 scale-110'
                  : 'border-white/30 bg-transparent'
              )}/>
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-center text-sm text-red-400 font-medium mb-5">{error}</p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((key, idx) => {
              if (key === '') return <div key={idx}/>
              if (key === 'del') return (
                <button key={idx} onClick={backspace}
                  className="h-14 sm:h-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/15 active:scale-95 transition-all touch-manipulation">
                  <Delete size={20}/>
                </button>
              )
              return (
                <button key={idx} onClick={() => pressKey(String(key))}
                  className="h-14 sm:h-16 rounded-2xl bg-white/10 border border-white/10 text-white text-xl font-semibold hover:bg-white/20 active:scale-95 transition-all touch-manipulation select-none">
                  {key}
                </button>
              )
            })}
          </div>

          {pin.length > 0 && pin.length < 4 && (
            <button onClick={() => tryLogin()}
              className="w-full mt-4 h-12 rounded-2xl bg-green-600 text-white font-bold hover:bg-green-500 active:scale-95 transition-all touch-manipulation">
              Přihlásit se
            </button>
          )}

          <p className="text-center text-xs text-white/20 mt-6">Nápověda: PIN je 1234 pro majitele</p>
        </div>
      )}
    </div>
  )
}
