// Harita seviyeleri: bölge ve il bazında gösterim
export type MapLevel = 'region' | 'province'

// GeoJSON Feature için temel tipler (sadeleştirilmiş)
export interface GeoFeatureProperties {
  id: string
  name: string
  // Bölge için "region", il için "province"
  level: MapLevel
  // Hiyerarşi için parent id (ör: il -> bölge id)
  parentId?: string
}

export interface GeoFeature {
  type: 'Feature'
  id: string
  properties: GeoFeatureProperties
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

