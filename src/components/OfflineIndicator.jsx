import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on  = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online',on); window.removeEventListener('offline',off) }
  }, [])
  if (!offline) return null
  return (
    <div className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-medium py-2 px-4">
      <WifiOff size={13}/>
      Jste offline — data jsou uložena lokálně
    </div>
  )
}
