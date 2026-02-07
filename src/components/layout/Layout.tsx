import './Layout.css'
import type { ReactNode } from 'react'

interface LayoutProps {
  // Harita bileşeninin yerleştirileceği alan
  mapSlot: ReactNode
  // Sağdaki bilgi panelinin yerleştirileceği alan
  sidePanelSlot: ReactNode
  // Soldaki detay panelinin yerleştirileceği alan (Opsiyonel)
  leftPanelSlot?: ReactNode
}

// Uygulamanın temel iki kolonlu yerleşimi.
// Sadece görsel yerleşimden sorumludur, iş mantığı içermez.
export function Layout({ mapSlot, sidePanelSlot, leftPanelSlot }: LayoutProps) {
  return (
    <div className="layout">
      <main className="layout-main">
        <section className="layout-map-column">{mapSlot}</section>
        <aside className="layout-side-column">{sidePanelSlot}</aside>
        {leftPanelSlot && <aside className="layout-left-column">{leftPanelSlot}</aside>}
      </main>
    </div>
  )
}

