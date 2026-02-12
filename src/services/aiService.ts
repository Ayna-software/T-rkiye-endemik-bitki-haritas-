// Bitki detaylarını getiren servis (Trefle.io kullanır)

export interface PlantDetail {
  description: string
  habitat: string
  features: string
  funFact: string
  imageUrl?: string
  scientificName?: string
}

const API_URL = import.meta.env.VITE_AI_API_URL || 'https://generativelanguage.googleapis.com'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''

export const aiService = {
  async getPlantDetails(plantName: string): Promise<PlantDetail> {
    if (!API_KEY) {
      console.warn("AI API Key bulunamadı, mock veri kullanılıyor.")
      await new Promise((resolve) => setTimeout(resolve, 800))
      return {
        description: `${plantName} (Mock Veri) - API Anahtarı eksik olduğu için özet gösteriliyor.`,
        habitat: "Bölgesel olarak değişir; örnek habitat bilgisi mevcut değil.",
        features: "Detaylar mevcut değil.",
        funFact: ".env dosyanıza VITE_AI_API_KEY eklerseniz gerçek veriler gösterilecektir.",
        scientificName: plantName
      }
    }

    // Genel yaklaşım:
    // - Eğer kullanıcı .env içine VITE_AI_API_KEY ve (opsiyonel) VITE_AI_API_URL koyduysa,
    //   doğrudan sağlanan LLM endpoint'ine bir istek gönderilir (client-side). Bu dosya
    //   hem Google Generative (Gemini) hem OpenAI tarzı endpoint'leri esnekçe ele alır.

    const model = (import.meta.env.VITE_AI_MODEL as string) || 'gemini-2.5-flash'

    const buildPrompt = (name: string) => {
      return `${name} bitkisini kısaca Türkçe olarak özetle.

JSON formatında cevap ver:
{
  "description": "Tanım",
  "habitat": "Yayılış ve yaşam ortamı",
  "features": "Fiziksel özellikleri",
  "funFact": "İlginç bilgi",
  "scientificName": "Latince adı"
}`
    }

    const prompt = buildPrompt(plantName)

    const parseTextToJson = (text: string) => {
      // Deneme: doğrudan JSON ise parse et, değilse ilk JSON bloğunu çıkarıp parse et
      try {
        return JSON.parse(text)
      } catch {
        const m = text.match(/\{[\s\S]*\}/m)
        if (m) {
          try {
            return JSON.parse(m[0])
          } catch {
            return null
          }
        }
        return null
      }
    }

    // Öncelik sırası (en yüksek -> en düşük):
    // 1) runtime config: `window.__AI_CONFIG__` veya `public/ai-config.json` (isteğe bağlı)
    // 2) build-time .env (import.meta.env)
    let apiUrl = API_URL
    let key = API_KEY.trim()
    
    console.log('Initial config from .env:', { apiUrl: apiUrl.slice(0, 30) + '...', key: key.slice(-10) })

    // Try to load runtime config from window or public/ai-config.json
    try {
      const winCfg = (window as any).__AI_CONFIG__
      if (winCfg && typeof winCfg === 'object') {
        console.log('Found window.__AI_CONFIG__')
        if (winCfg.VITE_AI_API_URL) apiUrl = winCfg.VITE_AI_API_URL
        if (winCfg.VITE_AI_API_KEY) key = String(winCfg.VITE_AI_API_KEY).trim()
      } else {
        // fetch public/ai-config.json (editable without rebuilding the app)
        console.log('Attempting to fetch /ai-config.json')
        const cfgRes = await fetch('/ai-config.json', { cache: 'no-store' }).catch((e) => {
          console.error('Failed to fetch ai-config.json:', e)
          return null
        })
        if (cfgRes && cfgRes.ok) {
          const cfg = await cfgRes.json().catch((e) => {
            console.error('Failed to parse ai-config.json:', e)
            return null
          })
          if (cfg) {
            console.log('Loaded ai-config.json successfully')
            if (cfg.VITE_AI_API_URL) apiUrl = cfg.VITE_AI_API_URL
            if (cfg.VITE_AI_API_KEY) key = String(cfg.VITE_AI_API_KEY).trim()
          }
        }
      }
    } catch (e) {
      console.error('Runtime config load error:', e)
      // ignore runtime config errors and fall back to .env values
    }
    
    console.log('Final config to use:', { apiUrl: apiUrl.slice(0, 40) + '...', key: key ? key.slice(-10) : 'EMPTY' })

    const tryParseResponse = async (resp: any) => {
      // esnek parsing: response'ı text olarak oku ve parse et
      try {
        const text = await resp.text()
        console.log('Raw API Response:', text)
        
        // İlk olarak JSON parse etmeye çalış
        let parsed: any = null
        try {
          parsed = JSON.parse(text)
          console.log('Parsed JSON response:', parsed)
        } catch {
          // JSON parse başarısız, text'ten JSON bloğu çıkarmaya çalış
          const m = text.match(/\{[\s\S]*\}/m)
          if (m) {
            try {
              parsed = JSON.parse(m[0])
              console.log('Extracted JSON from text:', parsed)
            } catch {
              return null
            }
          }
          return null
        }

        if (!parsed) return null

        // OpenAI-like format
        if (parsed.choices?.[0]?.message?.content) {
          const msgContent = parsed.choices[0].message.content
          console.log('OpenAI format detected, content:', msgContent)
          return parseTextToJson(msgContent)
        }

        // Google Generative / Gemini-like: candidates[0].content.parts[0].text
        if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
          const googleText = parsed.candidates[0].content.parts[0].text
          console.log('Google format detected, text:', googleText)
          return parseTextToJson(googleText)
        }

        // Fallback: doğrudan JSON varsa döndür
        if (typeof parsed === 'object' && (parsed.description || parsed.habitat)) {
          console.log('Direct JSON object format detected')
          return parsed
        }

        console.log('Could not match any format in response')
        return null
      } catch (err) {
        console.error('tryParseResponse error:', err)
        return null
      }
    }

    try {
      // Google Generative / Gemini tarzı endpoint tespiti
      const isGoogleGenerative = apiUrl.includes('generativelanguage.googleapis.com') || apiUrl.includes('googleapis.com') || apiUrl.includes('gemini')

      if (isGoogleGenerative) {
        // Google Generative API (Gemini) endpoint
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
        // v1 endpoint (gemini-2.5-flash için)
        const endpoint = `${baseUrl}/v1/models/${model}:generateContent?key=${encodeURIComponent(key)}`
        console.log('Calling Google Generative API:', { endpoint, model, key: key.slice(0, 10) + '...' })

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 2048
            }
          })
        })

        if (!res.ok) {
          const errorText = await res.text().catch(() => '')
          console.error('Google API HTTP Error:', {
            status: res.status,
            statusText: res.statusText,
            endpoint: endpoint,
            body: errorText.slice(0, 500)
          })
          throw new Error(`Google API error (${res.status}): ${errorText.slice(0, 150)}`)
        }

        const parsed = await tryParseResponse(res)
        console.log('Final parsed response:', parsed)
        
        if (parsed) {
          return {
            description: parsed.description || `${plantName} hakkında bilgi bulunamadı.`,
            habitat: parsed.habitat || '-',
            features: parsed.features || '-',
            funFact: parsed.funFact || '-',
            imageUrl: parsed.imageUrl || undefined,
            scientificName: parsed.scientificName || plantName
          }
        }

        throw new Error('LLM yanıtı parse edilemedi')
      }

      // OpenAI-compatible endpoints (chat completions)
      const isOpenAI = apiUrl.includes('openai.com') || apiUrl.includes('/v1/chat/completions')
      if (isOpenAI) {
        const endpoint = apiUrl.includes('/v1') ? apiUrl : `${apiUrl}/v1/chat/completions`
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'Türkçe cevapla ve sadece JSON dön.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 800
          })
        })

        const parsed = await tryParseResponse(res)
        if (parsed) {
          return {
            description: parsed.description || parsed.summary || `${plantName} hakkında bilgi bulunamadı.`,
            habitat: parsed.habitat || '-',
            features: parsed.features || '-',
            funFact: parsed.funFact || '-',
            imageUrl: parsed.imageUrl || undefined,
            scientificName: parsed.scientificName || plantName
          }
        }

        throw new Error('LLM yanıtı parse edilemedi (OpenAI).')
      }

      // Genel/Wrapping isteği: kullanıcı özel bir endpoint verdiğinde doğrudan POST gönder
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })

      const parsed = await tryParseResponse(res)
      if (parsed) {
        return {
          description: parsed.description || parsed.summary || `${plantName} hakkında bilgi bulunamadı.`,
          habitat: parsed.habitat || '-',
          features: parsed.features || '-',
          funFact: parsed.funFact || '-',
          imageUrl: parsed.imageUrl || undefined,
          scientificName: parsed.scientificName || plantName
        }
      }

      throw new Error('LLM yanıtı parse edilemedi (genel).')
    } catch (error) {
      console.error('AI Error:', error)
      const err = error as Error
      return {
        description: 'Bilgi alınırken bir hata oluştu.',
        habitat: 'Hata detayı: ' + (err.message || String(error)),
        features: 'Aranan isimle ilgili kayıt veritabanında bulunamadı.',
        funFact: 'Lütfen .env içindeki VITE_AI_API_KEY ve VITE_AI_API_URL ayarlarını kontrol edin.',
        scientificName: plantName
      }
    }
  }
}
