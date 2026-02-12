# T-rkiye-endemik-bitki-haritas-
React-Vite ile geliştirilmiş Türkiye endemik bitki haritası web uygulaması

.env içine `VITE_AI_API_KEY` ve (isteğe bağlı) `VITE_AI_API_URL` ekleyin. Örnek:

```
VITE_AI_API_KEY=YOUR_KEY_HERE
VITE_AI_API_URL=https://generativelanguage.googleapis.com
```

Notlar:
- `.env` içindeki değişiklikleri uygulamak için geliştirme sunucusunu (`npm run dev`) yeniden başlatmanız gerekir (Vite değişkenleri build-time olarak inject edilir).
- Hızlı, rebuild gerektirmeyen runtime yapılandırması için proje kökünde `public/ai-config.json` dosyasını düzenleyebilirsiniz; uygulama çalışma zamanında bu dosyayı okur. Bu dosyayı düzenleyip sayfayı yenilemeniz yeterlidir.