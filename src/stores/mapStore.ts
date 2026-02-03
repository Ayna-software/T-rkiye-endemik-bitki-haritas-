import { create } from 'zustand'
import type { MapLevel } from '../types/geo'

// Harita state'inin merkezi yönetimi.
// UI bileşenleri bu store üzerinden okuma/yazma yapar.

export interface MapState {
  level: MapLevel
  selectedRegionId: string | null
  selectedPlantId: string | null
}

interface MapActions {
  // Bölge seçildiğinde çağrılır
  selectRegion: (regionId: string) => void
  // Bitki seçildiğinde sadece bitki seçimi yapar, harita seviyesi değişmez
  selectPlant: (plantId: string) => void
  // İl seviyesindeyken geri bölge görünümüne dönmek için
  resetToRegions: () => void
}

export type MapStore = MapState & MapActions

export const useMapStore = create<MapStore>((set) => ({
  level: 'region',
  selectedRegionId: null,
  selectedPlantId: null,

  selectRegion: (regionId) =>
    set(() => ({
      level: 'region',
      selectedRegionId: regionId,
      selectedPlantId: null,
    })),

  selectPlant: (plantId) =>
    set((state) => ({
      // Bitki seçildiğinde harita seviyesi değişmez, sadece bitki seçilir
      level: state.level,
      selectedPlantId: plantId,
      // Bölge seçili değilse, mevcut değeri koru
      selectedRegionId: state.selectedRegionId,
    })),

  resetToRegions: () =>
    set((state) => ({
      level: 'region',
      // Bölge seçiliyse koru, değilse null yap
      selectedRegionId: state.selectedRegionId,
      selectedPlantId: null,
    })),
}))

