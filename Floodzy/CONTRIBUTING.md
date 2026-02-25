# Contributing to Floodzy

Terima kasih telah tertarik untuk berkontribusi ke **Floodzy**.  
Dokumen ini menjelaskan aturan dan alur kontribusi agar kolaborasi berjalan rapi, aman, dan efisien.

---

## Aturan Umum

- Jangan melakukan push langsung ke branch `main`
- Selalu gunakan branch terpisah untuk setiap perubahan
- Semua kontribusi harus melalui Pull Request (PR)
- Jangan pernah menyertakan secret, credential, API key, atau `.env` ke dalam repository
- Pastikan aplikasi tetap bisa dijalankan menggunakan Docker

---

## Alur Kontribusi

1. **Fork repository** (jika contributor eksternal)  
   atau buat branch baru (jika collaborator).

2. **Buat branch fitur**
   ```bash
   git checkout -b feat/nama-fitur
Contoh:

feat/weather-cache

fix/map-render

chore/refactor-utils

Lakukan perubahan

Ikuti struktur dan gaya kode yang sudah ada

Jangan hardcode konfigurasi atau credential

Gunakan environment variable jika diperlukan

Pastikan aplikasi berjalan

bash
Salin kode
docker compose up --build
atau (jika tidak pakai Docker):

bash
Salin kode
npm install
npm run dev
Commit dengan pesan yang jelas

bash
Salin kode
git commit -m "feat: add weather caching logic"
Push branch dan buka Pull Request

Jelaskan:

Apa yang diubah

Alasan perubahan

Dampak ke sistem (jika ada)

Aturan Pull Request
Pull Request akan direview berdasarkan hal berikut:

Teknis
Build tidak error

Docker setup tetap berjalan

Tidak merusak mode:

Docker Local DB

Supabase Public Read-only

Keamanan
Tidak mengakses table Supabase secara langsung (harus via VIEW)

Tidak ada secret / credential di kode

Tidak menurunkan level keamanan (RLS, policy, dll)

Kesesuaian Scope
Relevan dengan tujuan Floodzy

Tidak menambah kompleksitas yang tidak perlu

Dependency baru harus punya alasan yang jelas

Keputusan Review
Maintainer berhak untuk:

✅ Menerima dan merge PR

🔄 Meminta revisi

❌ Menolak PR jika tidak sesuai arah proyek

Menutup PR bukan konflik, tetapi bagian dari proses kurasi kontribusi.

Catatan Penting
Database production tidak pernah dibagikan

Data publik hanya tersedia melalui VIEW Supabase (read-only)

Untuk pengembangan lokal, gunakan Docker atau database dummy

Terima kasih telah berkontribusi dan membantu mengembangkan Floodzy.

markdown
Salin kode

---

### Status Dokumen
- ✅ Aman untuk open-source
- ✅ Jelas untuk contributor baru
- ✅ Tidak bocor informasi sensitif
- ✅ Konsisten dengan Docker & Supabase setup kamu

Kalau mau, langkah berikutnya yang paling ideal:
- Buat **`PULL_REQUEST_TEMPLATE.md`**
- Tambah **`SECURITY.md`**
- Tambah **GitHub branch protection rule**

Tinggal bilang mau lanjut yang mana.
