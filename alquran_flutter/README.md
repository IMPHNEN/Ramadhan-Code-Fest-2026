# Al-Qur'an Flutter App (AlQuran Cloud)

Aplikasi Al-Qur'an sederhana menggunakan Flutter + AlQuran Cloud API.

## Author
Created by **ajiputra**

## Fitur
- Daftar surah
- Search surah
- Detail surah (Arab) + Terjemahan Indonesia (id.indonesian)
- Audio murattal per ayat (edition: ar.alafasy)
- Dark Mode toggle
- Branding footer: "Created by ajiputra"

## Cara menjalankan (lokal)
> Folder ini sengaja ringan (tanpa folder android/ios) agar mudah diupload.

1. Install Flutter SDK
2. Masuk ke folder `alquran_flutter/`
3. Generate file platform (sekali saja):
   ```bash
   flutter create .

## API
- Surah list: `https://api.alquran.cloud/v1/surah`
- Surah arab: `https://api.alquran.cloud/v1/surah/{number}`
- Terjemahan ID: `https://api.alquran.cloud/v1/surah/{number}/id.indonesian`

Sumber: https://alquran.cloud/api
