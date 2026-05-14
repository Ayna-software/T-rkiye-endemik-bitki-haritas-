import './SidePanel.css'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { plants } from '../../data/plants'
import { useMapStore } from '../../stores/mapStore'

// Sağ panel yalnızca görsel listeleme ve kullanıcı etkileşimlerini içerir.
// Harita state'i `mapStore` üzerinden okunur / güncellenir.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_USER_STORAGE_KEY = 'auth_username'

interface CommunityPlant {
  id: number
  plant_name: string
  latin_name: string
  family: string
  endemism_status: string
  user_note: string
  region_id: string
  username: string
}

interface SidePanelProps {
  username?: string | null
}

export function SidePanel({ username }: SidePanelProps) {
  const level = useMapStore((s) => s.level)
  const selectedRegionId = useMapStore((s) => s.selectedRegionId)
  const selectedPlantId = useMapStore((s) => s.selectedPlantId)
  const selectPlant = useMapStore((s) => s.selectPlant)
  const resetToRegions = useMapStore((s) => s.resetToRegions)
  const closeSidePanel = useMapStore((s) => s.closeSidePanel)
  const [sessionUsername, setSessionUsername] = useState<string | null>(() =>
    localStorage.getItem(AUTH_USER_STORAGE_KEY)
  )
  const [communityPlants, setCommunityPlants] = useState<CommunityPlant[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newPlantName, setNewPlantName] = useState('')
  const [newPlantNote, setNewPlantNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isFeedbackError, setIsFeedbackError] = useState(false)

  // Username prop'u değiştiğinde state'i güncelle
  useEffect(() => {
    setSessionUsername(username ?? null)
  }, [username])

  const filteredPlants = useMemo(() => {
    if (!selectedRegionId) return []
    return plants.filter((p) => p.dominantRegions.includes(selectedRegionId))
  }, [selectedRegionId])

  const mergedPlants = useMemo(() => {
    const userPlants = communityPlants.map((plant) => ({
      id: `user-${plant.id}`,
      name: plant.plant_name,
      latinName: plant.latin_name,
      description: `${plant.user_note} (Familya: ${plant.family}, Endemiklik: ${plant.endemism_status})`,
    }))

    const basePlants = filteredPlants.map((plant) => ({
      id: plant.id,
      name: plant.name,
      latinName: plant.latinName,
      description: plant.description,
    }))

    return [...userPlants, ...basePlants]
  }, [communityPlants, filteredPlants])

  useEffect(() => {
    if (!selectedRegionId) {
      setCommunityPlants([])
      return
    }

    const loadCommunityPlants = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/plants?region_id=${encodeURIComponent(selectedRegionId)}`
        )
        if (!response.ok) {
          throw new Error('Bitki listesi getirilemedi.')
        }

        const data = (await response.json()) as { plants?: CommunityPlant[] }
        setCommunityPlants(data.plants ?? [])
      } catch {
        setCommunityPlants([])
      }
    }

    loadCommunityPlants()
  }, [selectedRegionId])

  const handleAddPlant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sessionUsername || !selectedRegionId) return

    setIsSubmitting(true)
    setFeedbackMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/add-plant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: newPlantName,
          note: newPlantNote,
          regionId: selectedRegionId,
          username: sessionUsername,
        }),
      })

      const data = (await response.json()) as { message?: string; plant?: CommunityPlant }
      if (!response.ok || !data.plant) {
        setIsFeedbackError(true)
        setFeedbackMessage(data.message ?? 'Bitki eklenemedi.')
        return
      }

      setCommunityPlants((prev) => [data.plant as CommunityPlant, ...prev])
      setIsFeedbackError(false)
      setFeedbackMessage('Bitki başarıyla eklendi.')
      setIsModalOpen(false)
      setNewPlantName('')
      setNewPlantNote('')
    } catch {
      setIsFeedbackError(true)
      setFeedbackMessage('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isVisible = Boolean(selectedRegionId)
  const hasAccountBadge = Boolean(username)

  return (
    <div
      className={`side-panel ${!isVisible ? 'side-panel--hidden' : ''} ${
        hasAccountBadge ? 'side-panel--account-space' : ''
      }`}
    >
      <button className="side-panel__close-btn" onClick={closeSidePanel}>
        ×
      </button>
      <header className="side-panel__header">
        <h1 className="side-panel__title">Endemik Bitkileri</h1>
        {level === 'province' && (
          <button type="button" className="side-panel__reset-btn" onClick={resetToRegions}>
            ← Bölgelere Dön
          </button>
        )}
      </header>

      <section className="side-panel__section">
        {sessionUsername && sessionUsername !== 'Misafir' && (
          <button
            type="button"
            className="side-panel__add-btn"
            onClick={() => {
              setFeedbackMessage('')
              setIsModalOpen(true)
            }}
          >
            Yeni Bitki Ekle
          </button>
        )}
        <ul className="plant-list">
          {mergedPlants.map((plant) => {
            const isActive = plant.id === selectedPlantId
            return (
              <li key={plant.id}>
                <button
                  type="button"
                  className={`plant-list__item ${isActive ? 'plant-list__item--active' : ''}`}
                  onClick={() => {
                    // AI/Trefle ile detay getir – arama doğruluğu için latin adı kullan
                    selectPlant(plant.id, plant.latinName)
                  }}
                >
                  <div className="plant-list__name-row">
                    <span className="plant-list__name">{plant.name}</span>
                    <span className="plant-list__latin">{plant.latinName}</span>
                  </div>
                  <p className="plant-list__description">{plant.description}</p>
                </button>
              </li>
            )
          })}
          {mergedPlants.length === 0 && (
            <li className="plant-list__empty">
              Bu bölge için bitki bulunamadı.
            </li>
          )}
        </ul>
        {feedbackMessage && (
          <p className={isFeedbackError ? 'side-panel__feedback error' : 'side-panel__feedback success'}>
            {feedbackMessage}
          </p>
        )}
      </section>

      {isModalOpen && (
        <div className="add-plant-modal__backdrop" role="presentation">
          <div className="add-plant-modal">
            <h3 className="add-plant-modal__title">Yeni Bitki Ekle</h3>
            <form className="add-plant-modal__form" onSubmit={handleAddPlant}>
              <label className="add-plant-modal__field">
                Bitki Adı
                <input
                  type="text"
                  value={newPlantName}
                  onChange={(event) => setNewPlantName(event.target.value)}
                  required
                  minLength={2}
                />
              </label>
              <label className="add-plant-modal__field">
                Kişisel Not / Kısa Açıklama
                <textarea
                  value={newPlantNote}
                  onChange={(event) => setNewPlantNote(event.target.value)}
                  required
                  rows={4}
                />
              </label>
              <div className="add-plant-modal__actions">
                <button
                  type="button"
                  className="add-plant-modal__cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </button>
                <button type="submit" className="add-plant-modal__submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

