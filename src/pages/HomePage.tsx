import { useEffect, useState } from 'react'
import { Layout } from '../components/layout/Layout'
import { MapView } from '../components/map/MapView'
import { SidePanel } from '../components/panel/SidePanel'
import { SettingsPanel } from '../components/panel/SettingsPanel'
import { DetailPanel } from '../components/panel/DetailPanel'
import { AuthModal } from './AuthModal'
import { useMapStore } from '../stores/mapStore'

const AUTH_USER_STORAGE_KEY = 'auth_username'

export function HomePage() {
  const selectedRegionId = useMapStore((s) => s.selectedRegionId)
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem(AUTH_USER_STORAGE_KEY)
  )
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(() => !localStorage.getItem(AUTH_USER_STORAGE_KEY))

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
    setIsAuthModalOpen(true)
  }

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    // When a region is selected and the side panel shows plant list,
    // automatically close the settings panel so they don't overlap.
    if (selectedRegionId) {
      setIsSettingsOpen(false)
    }
  }, [selectedRegionId])

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
        sidePanelSlot={isSettingsOpen ? <SettingsPanel onClose={() => setIsSettingsOpen(false)} /> : <SidePanel key={selectedRegionId} username={username} />}
        leftPanelSlot={<DetailPanel />}
      />

      {isAuthModalOpen && (
        <AuthModal onClose={closeAuthModal} onSuccess={handleAuthSuccess} />
      )}

      {username && (
        <div className="auth-status-panel">
          <div className="auth-status-panel__copy">
            <span className="auth-status-panel__label">Hesap</span>
            <span className="auth-status-panel__text">Hoş geldin, {username}</span>
          </div>
          <div className="auth-status-panel__actions">
            <button
              className="auth-status-panel__action auth-status-panel__action--settings"
              type="button"
              onClick={() => {
                // Toggle settings panel; ensure side panel is closed when opening
                if (isSettingsOpen) setIsSettingsOpen(false)
                else {
                  setIsSettingsOpen(true)
                }
              }}
              aria-label="Ayarlar"
              title="Ayarlar"
            >
              ⚙
            </button>
            <button
              className="auth-status-panel__action"
              type="button"
              onClick={handleLogout}
              aria-label="Çıkış yap"
              title="Çıkış yap"
            >
              ⎋
            </button>
          </div>
        </div>
      )}
      {isSettingsOpen && (
        <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  )
}
