// Endemik bitki kaydı için tip tanımı
export interface Plant {
  id: string
  name: string
  latinName: string
  description: string
  // Bitkinin yoğun olduğu bölge id'leri
  dominantRegions: string[]
  // Bitkinin yoğun olduğu il id'leri
  dominantProvinces: string[]
}

