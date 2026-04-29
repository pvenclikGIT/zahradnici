import { createContext, useContext, useState, useCallback } from 'react'

// ── Default profiles ─────────────────────────
export const defaultProfiles = [
  {
    id: 1,
    name: 'Jan Novák',
    role: 'owner',
    roleLabel: 'Majitel',
    initials: 'JN',
    pin: '1234',
    color: 'bg-green-600',
    permissions: {
      dashboard: true, orders: true, checklist: true,
      clients: true, invoices: true, pricelist: true,
      notifications: true, settings: true, calendar: true,
      seeFinances: true, editPrices: true, deleteData: true,
    }
  },
  {
    id: 2,
    name: 'Tomáš Zelený',
    role: 'worker',
    roleLabel: 'Zahradník',
    initials: 'TZ',
    pin: '5678',
    color: 'bg-blue-600',
    permissions: {
      dashboard: true, orders: true, checklist: true,
      clients: true, invoices: false, pricelist: false,
      notifications: false, settings: false, calendar: true,
      seeFinances: false, editPrices: false, deleteData: false,
    }
  },
  {
    id: 3,
    name: 'Eva Horáková',
    role: 'accountant',
    roleLabel: 'Účetní',
    initials: 'EH',
    pin: '9012',
    color: 'bg-purple-600',
    permissions: {
      dashboard: true, orders: false, checklist: false,
      clients: false, invoices: true, pricelist: true,
      notifications: false, settings: false, calendar: false,
      seeFinances: true, editPrices: false, deleteData: false,
    }
  },
]

const ROLE_DESCRIPTIONS = {
  owner:     'Plný přístup ke všem funkcím, datům a nastavení.',
  worker:    'Vidí zakázky, checklist a kalendář. Finance skryty.',
  accountant:'Přístup pouze k fakturám, ceníku a exportům.',
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zp3_profiles')) || defaultProfiles } catch { return defaultProfiles }
  })
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zp3_currentUser')) || null } catch { return null }
  })
  const [locked, setLocked] = useState(() => !localStorage.getItem('zp3_currentUser'))

  const saveProfiles = useCallback(p => {
    setProfiles(p)
    localStorage.setItem('zp3_profiles', JSON.stringify(p))
  }, [])

  const login = useCallback((profileId, pin) => {
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) return { ok: false, error: 'Profil nenalezen' }
    if (profile.pin !== pin) return { ok: false, error: 'Špatný PIN' }
    setCurrentUser(profile)
    setLocked(false)
    localStorage.setItem('zp3_currentUser', JSON.stringify(profile))
    return { ok: true }
  }, [profiles])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setLocked(true)
    localStorage.removeItem('zp3_currentUser')
  }, [])

  const addProfile = useCallback(p => {
    const next = [...profiles, { ...p, id: Date.now() }]
    saveProfiles(next)
  }, [profiles, saveProfiles])

  const updateProfile = useCallback(p => {
    const next = profiles.map(x => x.id === p.id ? p : x)
    saveProfiles(next)
    if (currentUser?.id === p.id) {
      setCurrentUser(p)
      localStorage.setItem('zp3_currentUser', JSON.stringify(p))
    }
  }, [profiles, currentUser, saveProfiles])

  const deleteProfile = useCallback(id => {
    saveProfiles(profiles.filter(p => p.id !== id))
  }, [profiles, saveProfiles])

  const can = useCallback((permission) => {
    if (!currentUser) return false
    return currentUser.permissions?.[permission] ?? false
  }, [currentUser])

  return (
    <AuthContext.Provider value={{
      profiles, currentUser, locked,
      login, logout,
      addProfile, updateProfile, deleteProfile,
      can, ROLE_DESCRIPTIONS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
