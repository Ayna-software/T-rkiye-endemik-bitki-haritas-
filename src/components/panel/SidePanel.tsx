import './SidePanel.css'

import { useMemo } from 'react'
import { plants } from '../../data/plants'
import { useMapStore } from '../../stores/mapStore'

// Sağ panel yalnızca görsel listeleme ve kullanıcı etkileşimlerini içerir.
// Harita state'i `mapStore` üzerinden okunur / güncellenir.

export function SidePanel() {
  const level = useMapStore((s) => s.level)
  const selectedRegionId = useMapStore((s) => s.selectedRegionId)
  const selectedPlantId = useMapStore((s) => s.selectedPlantId)
  const selectPlant = useMapStore((s) => s.selectPlant)
  const resetToRegions = useMapStore((s) => s.resetToRegions)

  const filteredPlants = useMemo(() => {
    if (!selectedRegionId) return []
    return plants.filter((p) => p.dominantRegions.includes(selectedRegionId))
  }, [selectedRegionId])

  const isVisible = Boolean(selectedRegionId)

  return (
    <div className={`side-panel ${!isVisible ? 'side-panel--hidden' : ''}`}>
      <header className="side-panel__header">
        <h1 className="side-panel__title">Türkiye Endemik Bitkileri</h1>
        {level === 'province' && (
          <button type="button" className="side-panel__reset-btn" onClick={resetToRegions}>
            ← Bölgelere Dön
          </button>
        )}
      </header>

      <section className="side-panel__section">
        <h2 className="side-panel__section-title">Endemik Bitkiler</h2>
        <ul className="plant-list">
          {filteredPlants.map((plant) => {
            const isActive = plant.id === selectedPlantId
            return (
              <li key={plant.id}>
                <button
                  type="button"
                  className={`plant-list__item ${isActive ? 'plant-list__item--active' : ''}`}
                  onClick={() => {
                    // Google search yerine, AI ile detay getir ve sol panelde göster
                    selectPlant(plant.id, plant.name)
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
          {filteredPlants.length === 0 && (
            <li className="plant-list__empty">
              Bu bölge için bitki bulunamadı.
            </li>
          )}
        </ul>
      </section>
    </div>
  )
}

