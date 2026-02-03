import type { GeoFeatureCollection } from '../types/geo'

// NOT: Bu veri yalnızca örnek iller içerir ve gerçek koordinatlar değildir.

export const provincesGeoJson: GeoFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // Marmara örnek iller
    {
      type: 'Feature',
      id: 'istanbul',
      properties: {
        id: 'istanbul',
        name: 'İstanbul',
        level: 'province',
        parentId: 'marmara',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [27.0, 40.8],
            [27.0, 41.4],
            [29.5, 41.4],
            [29.5, 40.8],
            [27.0, 40.8],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'bursa',
      properties: {
        id: 'bursa',
        name: 'Bursa',
        level: 'province',
        parentId: 'marmara',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [28.0, 40.0],
            [28.0, 40.6],
            [30.0, 40.6],
            [30.0, 40.0],
            [28.0, 40.0],
          ],
        ],
      },
    },
    // Ege örnek iller
    {
      type: 'Feature',
      id: 'izmir',
      properties: {
        id: 'izmir',
        name: 'İzmir',
        level: 'province',
        parentId: 'ege',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [26.0, 38.0],
            [26.0, 39.0],
            [28.0, 39.0],
            [28.0, 38.0],
            [26.0, 38.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'manisa',
      properties: {
        id: 'manisa',
        name: 'Manisa',
        level: 'province',
        parentId: 'ege',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [27.5, 38.5],
            [27.5, 39.5],
            [29.0, 39.5],
            [29.0, 38.5],
            [27.5, 38.5],
          ],
        ],
      },
    },
    // Akdeniz örnek iller
    {
      type: 'Feature',
      id: 'antalya',
      properties: {
        id: 'antalya',
        name: 'Antalya',
        level: 'province',
        parentId: 'akdeniz',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [30.5, 36.5],
            [30.5, 37.5],
            [32.5, 37.5],
            [32.5, 36.5],
            [30.5, 36.5],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'mersin',
      properties: {
        id: 'mersin',
        name: 'Mersin',
        level: 'province',
        parentId: 'akdeniz',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [33.0, 36.0],
            [33.0, 37.0],
            [35.0, 37.0],
            [35.0, 36.0],
            [33.0, 36.0],
          ],
        ],
      },
    },
  ],
}

