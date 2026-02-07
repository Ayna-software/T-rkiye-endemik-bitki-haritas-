// Bitki detaylarını getiren servis (Trefle.io kullanır)

export interface PlantDetail {
  description: string
  habitat: string
  features: string
  funFact: string
  imageUrl?: string
  scientificName?: string
}

const API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''

export const aiService = {
  async getPlantDetails(plantName: string): Promise<PlantDetail> {
    
    if (!API_KEY) {
      console.warn("AI API Key bulunamadı, mock veri kullanılıyor.")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        description: `${plantName} (Mock Veri) - API Anahtarı eksik olduğu için rastgele bir açıklama gösteriliyor.`,
        habitat: "Karadeniz ve Marmara bölgelerinde, nemli orman altlarında.",
        features: "Çok yıllık, otsu bir bitkidir. Çiçekleri genellikle bahar aylarında açar.",
        funFact: ".env dosyanıza VITE_AI_API_KEY eklerseniz gerçek veriler buraya gelecek.",
        scientificName: "Plantae Mockus"
      }
    }

    try {
      const isTrefle = API_URL.includes('trefle.io') || API_URL.includes('/trefle')

      if (isTrefle) {
        const token = API_KEY.trim()
        
        // 1. Arama Yap (Tam Ad ile)
        const fetchSearch = async (query: string) => {
            const res = await fetch(`${API_URL}/species/search?q=${encodeURIComponent(query)}&token=${token}`)
            if (!res.ok) return null
            const data = await res.json()
            return data.data?.[0]
        }

        let targetData = await fetchSearch(plantName)

        // Eğer sonuç yoksa ve isim 3 kelimeden fazlaysa (örn: Quercus macranthera syspirensis), 
        // son kelimeyi atıp tekrar dene (Quercus macranthera)
        if (!targetData) {
            const parts = plantName.split(' ')
            if (parts.length > 2) {
                // Son parçayı çıkar (subspecies/variety ismini at)
                const simplifiedName = parts.slice(0, 2).join(' ')
                console.log(`Tam ad ile bulunamadı, "${simplifiedName}" deneniyor...`)
                targetData = await fetchSearch(simplifiedName)
            }
        }

        // Hala yoksa plants/search dene
        if (!targetData) {
           const altRes = await fetch(`${API_URL}/plants/search?q=${encodeURIComponent(plantName)}&token=${token}`)
           const altData = await altRes.json()
           targetData = altData?.data?.[0]
        }

        // Hala yoksa hata
        if (!targetData) {
          throw new Error('Bitki veritabanında bulunamadı.')
        }

        // 2. Detay Çek
        const detailedRes = await fetch(`${API_URL}/species/${targetData.slug || targetData.id}?token=${token}`)
        const detailedData = await detailedRes.json()
        const d = detailedData?.data || targetData

        // -- YARDIMCI ÇEVİRİ VE FORMATLAMA --

        const trColor = (c: string) => ({
          white: 'beyaz', yellow: 'sarı', red: 'kırmızı', purple: 'mor', blue: 'mavi', 
          pink: 'pembe', orange: 'turuncu', green: 'yeşil', brown: 'kahverengi', black: 'siyah'
        }[c] || c)

        const trRegion = (r: string) => ({
          turkey: 'Türkiye', anatolia: 'Anadolu', europe: 'Avrupa', asia: 'Asya', middle_east: 'Orta Doğu', caucasus: 'Kafkasya'
        }[r.toLowerCase().replace(' ', '_')] || r)

        const trLight = (val: number) => {
          if (val === null || val === undefined) return null
          if (val <= 6) return 'Gölge veya yarı gölge sever'
          if (val <= 8) return 'Yarı gölge veya güneşli alanları sever'
          return 'Tam güneş ışığını sever'
        }

        const trHumidity = (val: number) => {
          if (val === null || val === undefined) return null
          if (val <= 4) return 'Kuraklığa dayanıklıdır, az nem ister'
          if (val <= 7) return 'Orta düzeyde nem ister'
          return 'Yüksek nemli ortamları sever'
        }
        
        const trRank = (rank?: string) => {
            if (!rank) return ''
            const map: Record<string, string> = {
                'species': 'tür',
                'subspecies': 'alttür',
                'variety': 'varyete',
                'genus': 'cins',
                'family': 'aile'
            }
            return map[rank.toLowerCase()] || rank
        }

        // -- VERİ HARİTALAMA --

        // 1. GENEL TANIM (Description)
        const sciName = d.scientific_name || targetData.scientific_name || ''
        const commonName = d.common_name || targetData.common_name || plantName
        const family = d.family || targetData.family
        const genus = d.genus || targetData.genus
        const rankTr = trRank(d.rank)
        const year = d.year || targetData.year
        
        let descParts = []
        
        if (commonName && commonName.toLowerCase() !== sciName.toLowerCase()) {
            descParts.push(`${commonName}, bilimsel adıyla ${sciName} olarak bilinen bitkidir.`)
        } else {
            descParts.push(`${sciName}, bir bitki ${rankTr ? `${rankTr}üdür` : 'türüdür'}.`)
        }

        if (family) descParts.push(`${family} ailesine mensuptur.`)
        if (genus) descParts.push(`${genus} cinsi içerisinde yer alır.`)
        if (year && d.author) descParts.push(`Bilim dünyasına ilk olarak ${year} yılında ${d.author} tarafından tanıtılmıştır.`)
        
        const description = descParts.join(' ')

        // 2. YAŞAM ALANI (Habitat)
        let habitatParts = []
        // Yayılış
        const distArr = (d.distribution?.native || d.distribution?.introduced || []).map((x: string) => trRegion(x))
        if (distArr.length > 0) {
          habitatParts.push(`Genel Yayılış: ${distArr.slice(0, 8).join(', ')} bölgesi ve çevresi.`)
        }
        // Toprak & Işık
        if (d.growth?.soil_texture) habitatParts.push(`${d.growth.soil_texture === 9 ? 'Kum' : 'Kireçli/Tınlı'} karakterli toprakları tercih eder.`)
        if (d.growth?.ph_min && d.growth?.ph_max) habitatParts.push(`Toprak pH isteği ${d.growth.ph_min}-${d.growth.ph_max} aralığındadır.`)
        
        const lightInfo = trLight(d.growth?.light)
        if (lightInfo) habitatParts.push(lightInfo + '.')
        
        const humidityInfo = trHumidity(d.growth?.atmospheric_humidity)
        if (humidityInfo) habitatParts.push(humidityInfo + '.')
          
        if (d.growth?.minimum_precipitation && d.growth.minimum_precipitation.mm != null) {
             habitatParts.push(`Yıllık yağış isteği minimum ${d.growth.minimum_precipitation.mm}mm'dir.`)
        }

        const habitat = habitatParts.length > 0 ? habitatParts.join(' ') : "Detaylı habitat bilgisi veritabanında bulunamadı ancak genellikle ılıman iklim kuşaklarında görülür."

        // 3. ÖZELLİKLER (Features)
        let featureParts = []
        // Fiziksel
        if (d.specifications?.growth_habit) featureParts.push(`büyüme formu ${d.specifications.growth_habit} şeklindedir`)
        if (d.specifications?.average_height?.cm) featureParts.push(`ortalama boyu ${d.specifications.average_height.cm} cm'ye ulaşır`)
        if (d.flower?.color) featureParts.push(`çiçekleri ${trColor(d.flower.color)} renklidir`)
        if (d.fruit?.color) featureParts.push(`meyveleri ${trColor(d.fruit.color)} renge sahiptir`)
        if (d.foliage?.texture) featureParts.push(`yaprak dokusu ${d.foliage.texture} yapıdadır`)
        if (d.foliage?.color) featureParts.push(`yaprakları ${trColor(d.foliage.color)} tonlarındadır`)
        
        // Diğer
        if (d.specifications?.toxicity && d.specifications.toxicity !== 'none') featureParts.push('toksik (zehirli) özellik gösterebilir')
        if (d.growth?.growth_rate) featureParts.push(`${
          {slow:'yavaş', moderate:'orta', rapid:'hızlı'}[d.growth.growth_rate as string] || 'orta'
        } hızda büyüme gösterir`)

        const features = featureParts.length > 0 
          ? "Bu bitkinin " + featureParts.join(', ') + "." 
          : "Spesifik morfolojik özellikleri hakkında detaylı veri bulunamadı."

        // 4. BİLİYOR MUYDUNUZ? (Fun Fact)
        let facts = []
        
        if (d.duration) {
             const durMap: any = { 'Annual': 'tek yıllık', 'Perennial': 'çok yıllık', 'Biennial': 'iki yıllık' }
             facts.push(`Bu bitki ${durMap[d.duration] || d.duration} bir yaşam döngüsüne sahiptir.`)
        }
        
        if (d.edible_part) {
            facts.push(`Yenebilir kısımları mevcuttur: ${d.edible_part.join(', ')}.`)
        }
        if (d.vegetable) {
            facts.push("Bazı kültürlerde sebze olarak tüketimi bilinmektedir.")
        }
        
        if (d.synonyms && Array.isArray(d.synonyms) && d.synonyms.length > 0) {
            const synList = d.synonyms.map((s: any) => {
                if (typeof s === 'string') return s;
                if (typeof s === 'object' && s.name) return s.name;
                return null;
            }).filter(Boolean);
            
            if (synList.length > 0) {
                facts.push(`Bilim dünyasında şu isimlerle de anılmıştır: ${synList.slice(0, 3).join(', ')}.`)
            }
        }

        if (facts.length === 0) {
           if (d.author && d.year) {
               facts.push(`Bilimsel olarak ilk kez ${d.year} yılında ${d.author} tarafından tanımlanmıştır.`)
           } else if (d.family_common_name) {
               facts.push(`Halk arasında ${d.family_common_name} ailesinin bir üyesi olarak bilinir.`)
           } else if (d.bibliography) {
                facts.push(`Bu tür hakkındaki temel bilgiler ${d.bibliography} çalışmasına dayanmaktadır.`)
           } else {
               facts.push("Bu bitki doğadaki biyolojik çeşitliliğin eşsiz bir parçasıdır.")
           }
        }

        const funFact = facts.join(' ')

        return {
          description,
          habitat,
          features,
          funFact,
          imageUrl: d.image_url || targetData.image_url,
          scientificName: sciName
        }

      } else {
         throw new Error("Sadece Trefle API yapılandırıldı.")
      }

    } catch (error) {
      console.error("AI Error:", error)
      const err = error as Error
      return {
        description: "Bilgi alınırken bir hata oluştu.",
        habitat: "Hata detayı: " + (err.message || String(error)),
        features: "Aranan isimle ilgili kayıt veritabanında bulunamadı.",
        funFact: "İnternet bağlantısınız ve API anahtarınızı kontrol edin.",
        scientificName: plantName
      }
    }
  }
}
