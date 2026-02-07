import { create } from 'zustand'
import type { MapLevel } from '../types/geo'
import { aiService, type PlantDetail } from '../services/aiService'

// Harita state'inin merkezi yönetimi.
// UI bileşenleri bu store üzerinden okuma/yazma yapar.

export interface MapState {
  level: MapLevel
  selectedRegionId: string | null
  selectedPlantId: string | null
  // AI tarafından getirilen detaylar
  plantDetails: PlantDetail | null
  isDetailsLoading: boolean
  isDetailPanelOpen: boolean
}

interface MapActions {
  // Bölge seçildiğinde çağrılır
  selectRegion: (regionId: string) => void
  // Bitki seçildiğinde sadece bitki seçimi yapar, harita seviyesi değişmez
  selectPlant: (plantId: string, plantName: string) => void
  // İl seviyesindeyken geri bölge görünümüne dönmek için
  resetToRegions: () => void
  // Detay panelini kapatma
  closeDetailPanel: () => void
}

export type MapStore = MapState & MapActions

export const useMapStore = create<MapStore>((set) => ({
  level: 'region',
  selectedRegionId: null,
  selectedPlantId: null,
  plantDetails: null,
  isDetailsLoading: false,
  isDetailPanelOpen: false,

  selectRegion: (regionId) =>
    set(() => ({
      level: 'region',
      selectedRegionId: regionId,
      selectedPlantId: null,
      plantDetails: null,
      isDetailPanelOpen: false
    })),

  selectPlant: async (plantId, plantName) => {
    // Önce UI'ı yükleniyor moduna al
    set((state) => ({
      level: state.level,
      selectedPlantId: plantId,
      selectedRegionId: state.selectedRegionId,
      isDetailsLoading: true,
      isDetailPanelOpen: true,
      plantDetails: null // Önceki detayları temizle
    }))

    try {
      // AI servisinden veriyi çek
      const details = await aiService.getPlantDetails(plantName)
      
      set({
        plantDetails: details,
        isDetailsLoading: false
      })
    } catch (error) {
      console.error("AI veri çekme hatası:", error)
      set({
        isDetailsLoading: false,
        // Hata durumunda boş veya hata mesajı
        plantDetails: {
          description: "Bilgi alınamadı.",
          habitat: "-",
          features: "-",
          funFact: "-"
        }
      })
    }
  },

  resetToRegions: () =>
    set((state) => ({
      level: 'region',
      // Bölge seçiliyse koru, değilse null yap
      selectedRegionId: state.selectedRegionId,
      selectedPlantId: null,
      plantDetails: null,
      isDetailPanelOpen: false
    })),

  closeDetailPanel: () => set({ isDetailPanelOpen: false })
}))

