import './DetailPanel.css'
import { useMapStore } from '../../stores/mapStore'

export function DetailPanel() {
  const isDetailPanelOpen = useMapStore((s) => s.isDetailPanelOpen)
  const isDetailsLoading = useMapStore((s) => s.isDetailsLoading)
  const plantDetails = useMapStore((s) => s.plantDetails)
  const closeDetailPanel = useMapStore((s) => s.closeDetailPanel)

  if (!isDetailPanelOpen) return null

  return (
    <div className={`detail-panel ${isDetailPanelOpen ? 'detail-panel--open' : ''}`}>
      <button className="detail-panel__close-btn" onClick={closeDetailPanel}>
        × Kapat
      </button>

      {isDetailsLoading ? (
        <div className="detail-panel__loading">
          <div className="spinner"></div>
          <p>Yapay zeka bitki hakkında bilgileri topluyor...</p>
        </div>
      ) : plantDetails ? (
        <div className="detail-panel__content">
          <h2 className="detail-panel__title">Bitki Detayları</h2>

          {plantDetails.imageUrl && (
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src={plantDetails.imageUrl} 
                alt="Bitki görseli" 
                style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} 
              />
            </div>
          )}
          
          <div className="detail-section">
            <h3>Genel Tanım</h3>
            <p>{plantDetails.description}</p>
          </div>

          <div className="detail-section">
            <h3>Yaşam Alanı</h3>
            <p>{plantDetails.habitat}</p>
          </div>

          <div className="detail-section">
            <h3>Özellikler</h3>
            <p>{plantDetails.features}</p>
          </div>

          <div className="detail-section fun-fact">
            <h3>Biliyor muydunuz?</h3>
            <p>{plantDetails.funFact}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
