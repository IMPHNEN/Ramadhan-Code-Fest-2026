# PANDUAN MIGRASI DATABASE (SQLx)

Dokumen ini berisi perintah-perintah penting untuk mengelola skema database PostgreSQL menggunakan `sqlx-cli`.

## Prasyarat

Pastikan file `.env` sudah memiliki variabel `DATABASE_URL` yang benar:
```bash
DATABASE_URL=postgres://user:password@localhost:5432/nama_database
````

Dan pastikan `sqlx-cli` sudah terinstall:

```bash
cargo install sqlx-cli --no-default-features --features native-tls,postgres
```

-----

## 1\. Setup Awal

Jalankan perintah ini hanya jika database belum pernah dibuat sebelumnya.

```bash
# Membuat database baru sesuai nama di URL .env
sqlx database create
```

## 2\. Membuat File Migrasi Baru

Gunakan perintah ini setiap kali ingin membuat tabel baru atau mengubah struktur tabel.

```bash
# Format: sqlx migrate add -r <nama_deskriptif_tanpa_spasi>
# Contoh:
sqlx migrate add -r create_users_table
```

  * Flag `-r` (reversible) akan membuat dua file di folder `/migrations`:
      * `*.up.sql`: Script untuk membuat tabel/perubahan.
      * `*.down.sql`: Script untuk membatalkan perubahan (rollback).

## 3\. Menjalankan Migrasi (Apply)

Menerapkan perubahan (file `.up.sql`) yang belum dieksekusi ke database.

```bash
sqlx migrate run
```

## 4\. Membatalkan Migrasi (Rollback)

Membatalkan migrasi terakhir yang dijalankan (menjalankan file `.down.sql` terakhir).

```bash
# Hati-hati: Data pada tabel terkait mungkin akan hilang
sqlx migrate revert
```

## 5\. Cek Status Migrasi

Melihat daftar migrasi yang sudah dijalankan dan yang belum.

```bash
sqlx migrate info
```

## 6\. Reset Database (Bahaya)

Menghapus seluruh database dan membuatnya ulang dari awal (semua data hilang). Berguna untuk development bersih.

```bash
sqlx database drop
sqlx database create
sqlx migrate run
```