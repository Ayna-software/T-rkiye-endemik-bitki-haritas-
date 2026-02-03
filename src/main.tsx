import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Uygulamanın giriş noktası.
// Burada yalnızca React kökü oluşturulur, herhangi bir iş mantığı bulunmaz.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
