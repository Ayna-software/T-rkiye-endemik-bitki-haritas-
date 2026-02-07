import './App.css'
import { Layout } from './components/layout/Layout'
import { MapView } from './components/map/MapView'
import { SidePanel } from './components/panel/SidePanel'
import { DetailPanel } from './components/panel/DetailPanel'
import { useMapStore } from './stores/mapStore'

// Uygulamanın kök bileşeni sadece layout'u ve ana modülleri kompoze eder.
// İş mantığı `stores`, `data` ve `utils` katmanlarında tutulur.
function App() {
  const selectedRegionId = useMapStore((s) => s.selectedRegionId)
  
  return (
    <div className="app-root">
      <Layout
        mapSlot={<MapView />}
        sidePanelSlot={<SidePanel key={selectedRegionId} />}
        leftPanelSlot={<DetailPanel />}
      />
    </div>
  )
}

export default App
