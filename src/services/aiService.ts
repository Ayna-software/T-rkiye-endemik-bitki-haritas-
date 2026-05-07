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
        funFact: "Bu türle ilgili daha fazla saha gözlemi eklendikçe içerik zenginleşecektir.",
        scientificName: plantName
      }
    }

    // Genel yaklaşım:
    // - Eğer kullanıcı .env içine VITE_AI_API_KEY ve (opsiyonel) VITE_AI_API_URL koyduysa,
    //   doğrudan sağlanan LLM endpoint'ine bir istek gönderilir (client-side). Bu dosya
    //   hem Google Generative (Gemini) hem OpenAI tarzı endpoint'leri esnekçe ele alır.

    const model = (import.meta.env.VITE_AI_MODEL as string) || 'gemini-3-flash'

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

    const buildGoogleEndpoint = (baseUrl: string, modelName: string) => {
      const trimmed = baseUrl.trim()
      const isFullGenerativeEndpoint =
        trimmed.includes('/v1/models/') && trimmed.includes(':generateContent')

      if (isFullGenerativeEndpoint) {
        return trimmed
      }

      return `${trimmed.replace(/\/+$/, '')}/v1/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`
    }


    // Öncelik sırası (en yüksek -> en düşük):
    // 1) runtime config: `window.__AI_CONFIG__` veya `public/ai-config.json` (isteğe bağlı)
    // 2) build-time .env (import.meta.env)
    let apiUrl = API_URL
    let key = API_KEY.trim()
    let runtimeModel = model
    
    console.log('Initial config from .env:', { apiUrl: apiUrl.slice(0, 30) + '...', key: key.slice(-10), model: runtimeModel })

    // Try to load runtime config from window or public/ai-config.json
    try {
      const winCfg = (window as any).__AI_CONFIG__
      if (winCfg && typeof winCfg === 'object') {
        console.log('Found window.__AI_CONFIG__')
        if (winCfg.VITE_AI_API_URL) apiUrl = winCfg.VITE_AI_API_URL
        if (winCfg.VITE_AI_API_KEY) key = String(winCfg.VITE_AI_API_KEY).trim()
        if (winCfg.VITE_AI_MODEL) runtimeModel = String(winCfg.VITE_AI_MODEL).trim()
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
            if (cfg.VITE_AI_MODEL) runtimeModel = String(cfg.VITE_AI_MODEL).trim()
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
        const endpoint = buildGoogleEndpoint(apiUrl, runtimeModel)

        console.log('Calling Google Generative API:', {
          endpoint,
          model: runtimeModel,
          key: key ? key.slice(0, 10) + '...' : 'NO_KEY'
        })

        let res = await fetch(endpoint, {
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
          const modelNotFound =
            res.status === 404 && /models\/.+\s+is not found|not found for API version/i.test(errorText)
          const rateLimitOrBusy = [429, 503].includes(res.status)

          if (modelNotFound) {
            console.error('Google API unsupported model:', {
              model: runtimeModel,
              status: res.status,
              endpoint,
              body: errorText.slice(0, 500)
            })
            throw new Error(`Google API model desteklenmiyor: ${runtimeModel}. .env veya ai-config ayarlarını kontrol edin.`)
          }

          if (rateLimitOrBusy) {
            console.error('Google API rate-limit/high-demand error:', {
              model: runtimeModel,
              status: res.status,
              endpoint,
              body: errorText.slice(0, 500)
            })
            throw new Error(`Google API yoğun: ${errorText.slice(0, 150)}`)
          }

          console.error('Google API HTTP Error:', {
            status: res.status,
            statusText: res.statusText,
            endpoint,
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
        funFact: 'Bu kayıt için temel bilgi gösteriliyor; daha sonra tekrar detay alınabilir.',
        scientificName: plantName
      }
    }
  }
}
