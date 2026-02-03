import 'leaflet/dist/leaflet.css'
import './MapView.css'

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { GeoJSON as LeafletGeoJSON } from 'leaflet'
import { useCallback, useMemo } from 'react'

import { regionsGeoJson } from '../../data/regions.geojson'
import { provincesGeoJson } from '../../data/provinces.geojson'
import { plants } from '../../data/plants'
import { useMapStore } from '../../stores/mapStore'
import { getProvinceBorderColor, getProvinceFillColor } from '../../utils/colors'

// Harita komponenti yalnızca render ve etkileşimleri yönetir.
// Seçim ve iş akışı `mapStore` ve `data` tarafından kontrol edilir.

export function MapView() {
  const level = useMapStore((s) => s.level)
  const selectedRegionId = useMapStore((s) => s.selectedRegionId)
  const selectedPlantId = useMapStore((s) => s.selectedPlantId)
  const selectRegion = useMapStore((s) => s.selectRegion)

  // Seçili bitkiye göre il yoğunluk verisini hesapla
  const dominantProvinceIds = useMemo(() => {
    if (!selectedPlantId) return new Set<string>()
    const plant = plants.find((p) => p.id === selectedPlantId)
    return new Set(plant?.dominantProvinces ?? [])
  }, [selectedPlantId])

  // Türkiye'nin yaklaşık merkez noktası
  const initialCenter: [number, number] = [39.0, 35.0]

  // Bölge seviyesinde GeoJSON stilleri (görünmez)
  const regionStyle = useCallback(() => {
    return {
      color: 'transparent',
      weight: 0,
      fillColor: 'transparent',
      fillOpacity: 0,
      opacity: 0,
    }
  }, [])

  // İl seviyesinde GeoJSON stilleri
  const provinceStyle = useCallback(
    (feature: any) => {
      const isDominant = dominantProvinceIds.has(feature.properties.id)
      return {
        color: getProvinceBorderColor({ isDominant }),
        weight: isDominant ? 2 : 1,
        fillColor: getProvinceFillColor({ isDominant }),
        fillOpacity: isDominant ? 0.85 : 0.6,
      }
    },
    [dominantProvinceIds],
  )

  // Bölgeye tıklama ve hover davranışı
  const onEachRegionFeature = useCallback(
    (feature: any, layer: LeafletGeoJSON) => {
      const regionId = feature.properties.id
      const regionName = feature.properties.name
      const isSelected = selectedRegionId === regionId

      // Bölge adı için tooltip oluştur
      layer.bindTooltip(regionName, {
        permanent: true,
        direction: 'center',
        className: `region-tooltip ${isSelected ? 'region-tooltip--selected' : ''}`,
        offset: [0, 0],
      })

      // Tıklama davranışı
      layer.on('click', () => {
        if (!feature?.properties?.id) return
        selectRegion(feature.properties.id)
      })

      // Hover efektleri
      layer.on('mouseover', () => {
        const tooltip = layer.getTooltip()
        if (tooltip) {
          const tooltipElement = tooltip.getElement()
          if (tooltipElement) {
            tooltipElement.classList.add('region-tooltip--hover')
          }
        }
      })

      layer.on('mouseout', () => {
        const tooltip = layer.getTooltip()
        if (tooltip) {
          const tooltipElement = tooltip.getElement()
          if (tooltipElement) {
            tooltipElement.classList.remove('region-tooltip--hover')
          }
        }
      })
    },
    [selectedRegionId, selectRegion],
  )

  // İl seviyesinde tıklamalar şu an için sadece hover / vurgu olarak bırakıldı.
  const onEachProvinceFeature = useCallback((feature: any, layer: LeafletGeoJSON) => {
    if (!feature?.properties?.name) return
    layer.bindTooltip(feature.properties.name, {
      direction: 'auto',
      sticky: true,
      className: 'map-tooltip',
    })
  }, [])

  // Haritada gösterilecek GeoJSON katmanını seç
  const geoJsonData = level === 'region' ? regionsGeoJson : provincesGeoJson
  const styleFn = level === 'region' ? regionStyle : provinceStyle
  const onEachFn = level === 'region' ? onEachRegionFeature : onEachProvinceFeature

  return (
    <div className="map-view">
      <MapContainer
        center={initialCenter}
        zoom={5}
        minZoom={4}
        maxZoom={9}
        scrollWheelZoom
        className="map-view__container"
      >
        {/* OpenStreetMap taban katmanı */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* GeoJSON katmanı (bölge / il) */}
        <GeoJSON data={geoJsonData as any} style={styleFn as any} onEachFeature={onEachFn as any} />
      </MapContainer>
    </div>
  )
}

