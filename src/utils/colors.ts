// Harita katmanları için basit renk üreticileri.
// UI bileşenleri doğrudan renk hesaplamaz; bu util fonksiyonları kullanır.

const regionPalette = ['#22c55e', '#0ea5e9', '#a855f7', '#f97316', '#e11d48']

export function getRegionColor(index: number): string {
  return regionPalette[index % regionPalette.length]
}

export function getProvinceFillColor(options: {
  isDominant: boolean
}): string {
  return options.isDominant ? '#16a34a' : '#4b5563'
}

export function getProvinceBorderColor(options: {
  isDominant: boolean
}): string {
  return options.isDominant ? '#bbf7d0' : '#9ca3af'
}

