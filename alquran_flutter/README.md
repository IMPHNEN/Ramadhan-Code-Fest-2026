# Al-Qur'an Flutter App (AlQuran Cloud)

Aplikasi Al-Qur'an sederhana (Flutter) menggunakan AlQuran Cloud API.

## Fitur
- Daftar surah
- Detail surah (teks Arab) + terjemahan Indonesia (id.indonesian)
- UI sederhana (Material 3)

## Cara menjalankan (lokal)
> Folder ini sengaja ringan (tanpa folder android/ios) agar mudah diupload ke repo event.

1. Install Flutter SDK
2. Masuk ke folder `alquran_flutter/`
3. Generate file platform (sekali saja):
   ```bash
   flutter create .
   ```
4. Jalankan:
   ```bash
   flutter pub get
   flutter run
   ```

## API
- Surah list: `https://api.alquran.cloud/v1/surah`
- Surah arab: `https://api.alquran.cloud/v1/surah/{number}`
- Terjemahan ID: `https://api.alquran.cloud/v1/surah/{number}/id.indonesian`

Sumber: https://alquran.cloud/api
