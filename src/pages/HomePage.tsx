import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { MapView } from '../components/map/MapView'
import { SidePanel } from '../components/panel/SidePanel'
import { DetailPanel } from '../components/panel/DetailPanel'
import { AuthModal } from './AuthModal'
import { useMapStore } from '../stores/mapStore'

const AUTH_USER_STORAGE_KEY = 'auth_username'

export function HomePage() {
  const selectedRegionId = useMapStore((s) => s.selectedRegionId)
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(AUTH_USER_STORAGE_KEY)
  )
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const syncUserFromStorage = () => {
      setUsername(localStorage.getItem(AUTH_USER_STORAGE_KEY))
    }

    window.addEventListener('storage', syncUserFromStorage)
    return () => window.removeEventListener('storage', syncUserFromStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    setUsername(null)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  const handleAuthSuccess = (newUsername: string) => {
    setUsername(newUsername)
    setIsAuthModalOpen(false)
  }

  return (
    <div className="app-root">
      <Layout
        mapSlot={<MapView />}
        sidePanelSlot={<SidePanel key={selectedRegionId} username={username} />}
        leftPanelSlot={<DetailPanel />}
      />

      {isAuthModalOpen && (
        <AuthModal onClose={closeAuthModal} onSuccess={handleAuthSuccess} />
      )}

      {username ? (
        <div className="auth-user-badge">
          <span className="auth-user-text">Hoş geldin, {username}</span>
          <button className="auth-logout-btn" type="button" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      ) : (
        <button
          className="login-fab"
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
        >
          Giriş Yap
        </button>
      )}
    </div>
  )
}
