# Website UI Builder - User Guide

## 1. Ringkasan
Website UI Builder adalah editor layout berbasis komponen untuk wireframing dan UI composition website. Fokus utamanya:
- workflow cepat drag-and-drop,
- edit properti visual dan layout secara detail,
- preview responsif,
- export code siap lanjut development.

## 2. Menjalankan Aplikasi
1. Install dependency:
```bash
npm install
```
2. Set environment variable:
```bash
export DATABASE_URL="postgresql://USER:PASSWORD@YOUR-NEON-HOST/neondb?sslmode=require"
```
Gunakan `server/.env.example` sebagai referensi format connection string.
3. Jalankan client + server:
```bash
npm run dev
```
4. Akses:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`

## 3. Tata Letak Workspace
- Top Bar: project actions, template preset, viewport mode, zoom, preview, export.
- Left Panel: Component Library.
- Center: Canvas editor.
- Right Panel: Inspector.
- Splitter kiri/kanan: panel width bisa di-drag untuk menyesuaikan ruang kerja.

Jika layar terlalu kecil, aplikasi menampilkan popup rekomendasi:
- pakai fullscreen,
- atau gunakan desktop/laptop agar editor lebih optimal.

## 4. Komponen dan Kategori
- Layout: `Container`, `Section`, `Grid Layout`, `Spacer`
- Navigation: `Navbar`, `Sidebar`, `Footer`
- Content: `Hero`, `Heading`, `Paragraph`, `Card`, `List`
- Form: `Button`, `Input`, `Textarea`, `Select`
- Media: `Image`
- Interactive: `Modal`, `Dropdown`, `Accordion`
- Utility: `Divider`, `Badge`

## 5. Workflow Dasar
1. Drag komponen dari library ke canvas.
2. Klik elemen untuk select.
3. Drag elemen untuk memindahkan posisi.
4. Resize pakai handle di sisi/sudut elemen.
5. Atur properti dari Inspector.
6. Simpan project dengan `Save`.
7. Cek mode `Desktop/Tablet/Mobile`.
8. Aktifkan `Preview` untuk uji interaksi.
9. Export saat layout final.

## 6. Interaksi Canvas
- Drag/move pakai pointer (ada drag threshold untuk mencegah geser tidak sengaja saat klik).
- Resize 8 arah (N, S, E, W, NE, NW, SE, SW).
- Snap-to-grid: toggle `Snap` di Top Bar.
- Auto alignment guide: toggle `Guides` di Top Bar.
- Nesting: node bisa dipindahkan parent-nya (drop ke container) atau lewat `Parent Container` di Inspector.
- Saat node dipilih, opacity diturunkan sedikit agar elemen tertutup tetap terlihat.

## 7. Ribbon Label Node
- Ribbon label hanya tampil untuk tipe:
  - `container`
  - `section`
  - `grid`
- Ribbon default tersembunyi dan muncul saat hover.
- Ribbon otomatis disembunyikan saat resize agar tidak mengganggu handle.
- Label ribbon:
  - pakai `Layer Name` jika tersedia,
  - fallback ke format `type/id` jika nama kosong.

## 8. Preview Mode
Saat `Preview` aktif:
- handle edit dan drag dinonaktifkan,
- elemen interaktif bisa dicoba langsung:
  - `button`
  - `input`
  - `textarea`
  - `select`
  - `dropdown`
  - `accordion`

Gunakan switch viewport:
- `desktop`
- `tablet`
- `mobile`

## 9. Inspector (Edit Properti)
Inspector berisi section berikut:
- Layer Tree
- Actions:
  - `Duplicate`
  - `Delete`
- Labeling:
  - Layer Name
  - Label
  - Text
  - Placeholder
  - Select Options
  - Image URL
  - Image Alt
- Frame:
  - X, Y, Width, Height
- Auto Layout:
  - Parent Container
  - Display (`block/flex/grid`)
  - Flex controls (`direction`, `justify`, `align`, `gap`)
  - Grid controls (`columns`, `gap`)
- Spacing:
  - padding dan margin 4 sisi
- Fill & Stroke:
  - fill color, fill opacity
  - text color, text opacity
  - stroke color, opacity, width, style
  - radius, layer opacity, shadow
- Typography:
  - font family
  - font size, font weight
  - line height, letter spacing
  - text align, text transform

## 10. Preset Typography Scale
Template bawaan sudah menerapkan ritme tipografi konsisten:
- H1: heading utama (hero/auth/register title)
- H2: section heading
- Body: paragraph/list
- Form text: input/select/textarea
- Button/Badge text

Tujuannya agar hierarchy teks antar template tetap rapi secara default.

## 11. Template Preset
Di Top Bar:
1. pilih dari dropdown `Template preset...`
2. klik `Apply Template`

Template tersedia:
1. `SaaS Landing`
2. `Portfolio Creator`
3. `Storefront Shop`
4. `Login Page`
5. `Register Page`

Semua template bisa langsung diedit dan sudah berisi contoh style (warna, spacing, border, shadow, typography, layout nested).

## 12. Project Management
- `New`: project kosong baru
- `Save`: simpan project aktif ke Neon PostgreSQL
- `Refresh`: refresh daftar project
- `Load`: muat project dari daftar

Database:
- dikelola di Neon melalui `DATABASE_URL`.

## 13. Zoom dan Navigasi
Kontrol zoom ada di Top Bar:
- tombol `-`
- input persen
- tombol `+`
- tombol `100` untuk reset

Range zoom:
- minimum `40%`
- maksimum `200%`

## 14. Keyboard Shortcut
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + D`: Duplicate selected node
- `Delete` / `Backspace`: Delete selected node
- `Ctrl/Cmd + +`: Zoom in
- `Ctrl/Cmd + -`: Zoom out
- `Ctrl/Cmd + 0`: Reset zoom ke `100%`

Catatan:
- Shortcut delete/duplicate diabaikan saat fokus sedang mengetik di `input`, `textarea`, `select`, atau elemen editable.

## 15. Export
Tombol `Export` menghasilkan:
- HTML + TailwindCSS
- React component

Output diunduh sebagai file `.txt` dan hasil React juga dicoba dicopy ke clipboard (jika browser mengizinkan).

## 16. Tips Workflow Cepat
1. Mulai dari template preset terdekat dengan use case.
2. Pakai `Snap` + `Guides` saat susun struktur utama.
3. Rapikan hirarki parent-child di `Layer Tree`.
4. Validasi desktop/tablet/mobile sebelum export.
5. Gunakan zoom + panel resize agar area kerja nyaman untuk detail kecil.
