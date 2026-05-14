import './SidePanel.css'

interface SettingsPanelProps {
  onClose?: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className={`side-panel ${'side-panel--account-space'}`}>
      <button
        className="side-panel__close-btn"
        onClick={() => {
          if (onClose) onClose()
        }}
      >
        ×
      </button>

      <header className="side-panel__header">
        <h1 className="side-panel__title">Ayarlar</h1>
      </header>

      <section className="side-panel__section">
        {/* Empty settings placeholder — content will be added later */}
      </section>
    </div>
  )
}
