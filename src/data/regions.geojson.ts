import type { GeoFeatureCollection } from '../types/geo'

// NOT: Bu veri gerçek idari sınırları temsil etmez.
// Türkiye haritasını demonstrasyon amaçlı sadeleştirilmiş dikdörtgenlerle,
// yaklaşık olarak gerçek konumlarının üzerine yerleştirerek temsil eder.

export const regionsGeoJson: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'marmara',
      properties: {
        id: 'marmara',
        name: 'Marmara',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Marmara: Türkiye'nin kuzeybatısı
            [27.0, 39.8],
            [27.0, 41.5],
            [30.0, 41.5],
            [30.0, 39.8],
            [27.0, 39.8],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ege',
      properties: {
        id: 'ege',
        name: 'Ege',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Ege: Batı kıyı şeridi
            [25.5, 37.0],
            [25.5, 39.5],
            [29, 39.5],
            [29, 37.0],
            [25.5, 37.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'akdeniz',
      properties: {
        id: 'akdeniz',
        name: 'Akdeniz',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Akdeniz: Güney kıyı şeridi
            [30.0, 36.0],
            [30.0, 37.5],
            [36.0, 37.5],
            [36.0, 36.0],
            [30.0, 36.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'icanadolu',
      properties: {
        id: 'icanadolu',
        name: 'İç Anadolu',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // İç Anadolu: Merkez plateau
            [31.5, 38],
            [31.5, 40.0],
            [36.5, 40.0],
            [36.5, 38],
            [31.5, 38],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'karadeniz',
      properties: {
        id: 'karadeniz',
        name: 'Karadeniz',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Karadeniz: Kuzey kıyı şeridi
            [31.0, 40.5],
            [31.0, 41.8],
            [41.0, 41.8],
            [41.0, 40.5],
            [31.0, 40.5],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'doguanadolu',
      properties: {
        id: 'doguanadolu',
        name: 'Doğu Anadolu',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Doğu Anadolu: Doğu yüksek platolar
            [38.0, 38.5],
            [38.0, 40],
            [44.0, 40],
            [44.0, 38.5],
            [38.0, 38.5],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'guneydogu',
      properties: {
        id: 'guneydogu',
        name: 'Güneydoğu Anadolu',
        level: 'region',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Güneydoğu Anadolu: Güneydoğu ovaları
            [37.0, 36.5],
            [37.0, 38.0],
            [42.0, 38.0],
            [42.0, 36.5],
            [37.0, 36.5],
          ],
        ],
      },
    },
  ],
}

