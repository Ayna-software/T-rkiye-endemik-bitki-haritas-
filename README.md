# T-rkiye-endemik-bitki-haritas-
React-Vite ile geliştirilmiş Türkiye endemik bitki haritası web uygulaması

.env içine `VITE_AI_API_KEY` ve (isteğe bağlı) `VITE_AI_API_URL` ekleyin. `VITE_AI_API_URL` için sadece temel URL kullanın, tam endpoint yerine:

```
VITE_AI_API_KEY=YOUR_KEY_HERE
VITE_AI_API_URL=https://generativelanguage.googleapis.com
VITE_AI_MODEL=YOUR_KEY_MODEL
VITE_API_BASE_URL=/api
```

Notlar:
- `.env` içindeki değişiklikleri uygulamak için geliştirme sunucusunu (`npm run dev`) yeniden başlatmanız gerekir (Vite değişkenleri build-time olarak inject edilir).

- `npm run dev` hata verirse `pnpm install` komutunu kullan!

- Hızlı, rebuild gerektirmeyen runtime yapılandırması için proje kökünde `public/ai-config.json` dosyasını düzenleyebilirsiniz; uygulama çalışma zamanında bu dosyayı okur. Bu dosyayı düzenleyip sayfayı yenilemeniz yeterlidir.

## Kullanici giris sistemi (Flask + SQLite)

Frontend tarafinda sag alt koseye sabit bir `Giris Yap` butonu eklendi ve bu buton `/auth` sayfasina yonlendirir.

`/auth` sayfasinda:
- `Giris Yap` ve `Kayit Ol` sekmeleri
- Hatali giris/istek durumlarinda kullaniciya mesaj
- Basarili giriste ana sayfaya yonlendirme

Backend kurulumu:

1. Python sanal ortam olusturun (opsiyonel ama onerilir).
2. Flask bagimliliklarini yukleyin:

```
pip install -r backend/requirements.txt
```

3. Sunucuyu baslatin:

```
python backend/app.py
```

Flask backend su endpointleri saglar:
- `POST /auth/register` -> `username`, `email`, `password` alir ve SQLite'a kaydeder.
- `POST /auth/login` -> sifreyi hash ile dogrular.

Veritabani dosyasi `backend/users.db` olarak otomatik olusur. Sifreler veritabanina duz metin yerine `werkzeug.security.generate_password_hash` ile hashlenerek kaydedilir.

Not: Frontend auth istekleri varsayilan olarak `VITE_API_BASE_URL=/api` uzerinden gider. Vite gelistirme sunucusu bu yolu otomatik olarak Flask (`http://127.0.0.1:5000`) servisine proxy eder.