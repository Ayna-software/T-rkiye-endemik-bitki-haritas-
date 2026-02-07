// Bitki detaylarını getiren simüle edilmiş AI servisi

export interface PlantDetail {
  description: string
  habitat: string
  features: string
  funFact: string
}

export const aiService = {
  async getPlantDetails(plantName: string): Promise<PlantDetail> {
    // Gerçek bir API çağrısı simülasyonu (1.5 saniye gecikme)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      description: `${plantName}, Anadolu'nun zengin florasında özel bir yere sahiptir. Çoğunlukla yüksek rakımlı kayalık bölgelerde ve bozkır alanlarında yetişir.`,
      habitat: "Genellikle kalkerli topraklarda ve 1000-2000m rakım aralığında görülür.",
      features: "Yaprakları gümüşi tüylerle kaplıdır, çiçekleri ise parlak renklere sahiptir. Kuraklığa karşı oldukça dayanıklıdır.",
      funFact: "Bu bitki türü, yerel halk tarafından yüzyıllardır geleneksel tıpta kullanılmaktadır."
    }
  }
}
