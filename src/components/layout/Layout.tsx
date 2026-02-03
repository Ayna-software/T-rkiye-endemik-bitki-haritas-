import './Layout.css'
import type { ReactNode } from 'react'

interface LayoutProps {
  // Harita bileşeninin yerleştirileceği alan
  mapSlot: ReactNode
  // Sağdaki bilgi panelinin yerleştirileceği alan
  sidePanelSlot: ReactNode
}

// Uygulamanın temel iki kolonlu yerleşimi.
// Sadece görsel yerleşimden sorumludur, iş mantığı içermez.
export function Layout({ mapSlot, sidePanelSlot }: LayoutProps) {
  return (
    <div className="layout">
      <main className="layout-main">
        <section className="layout-map-column">{mapSlot}</section>
        <aside className="layout-side-column">{sidePanelSlot}</aside>
      </main>
    </div>
  )
}

