# Website UI Builder

Aplikasi wireframing dan UI layout builder untuk website dengan pendekatan drag-and-drop seperti Excalidraw, tetapi fokus ke komponen web production-friendly.

- Demo: https://ui-builder-client.vercel.app

## Tech Stack
- Frontend: React + TypeScript + TailwindCSS
- Backend: Node.js + Express + Neon PostgreSQL
- Shared package: `@builder/shared` (type contract frontend/backend)

## Fitur
- Komponen UI dikelompokkan per kategori: Layout, Navigation, Content, Form, Media, Interactive, Utility.
- Canvas editor drag-and-drop dengan nested structure (container bisa punya child).
- Edit properti lengkap via Inspector: frame, auto layout, spacing, fill/stroke, typography, content.
- Resize dengan 8 handle, duplicate/delete node, dan layer tree.
- Snap-to-grid dan alignment guides saat drag.
- Preview responsive: desktop, tablet, mobile.
- Preview interaktif: `button`, `input`, `textarea`, `select`, `dropdown`, `accordion` bisa diinteraksikan.
- Zoom controls (`40% - 200%`) + shortcut keyboard.
- Undo/Redo dengan tombol dan shortcut.
- Side panel kiri/kanan bisa di-resize (draggable splitter).
- Warning modal saat viewport terlalu kecil (saran fullscreen/desktop).
- Export ke:
  - HTML + TailwindCSS
  - React component
- Simpan/muat project ke Neon PostgreSQL.
- Template siap edit:
  - SaaS Landing
  - Portfolio Creator
  - Storefront Shop
  - Login Page
  - Register Page

## Struktur Monorepo
- `client/` aplikasi builder (Vite + React)
- `server/` REST API + Neon PostgreSQL
- `shared/` tipe data bersama
- `docs/USER_GUIDE.md` panduan penggunaan detail

## Menjalankan Aplikasi
1. Install dependency:
```bash
npm install
```
2. Set environment variable Neon:
```bash
export DATABASE_URL="postgresql://USER:PASSWORD@YOUR-NEON-HOST/neondb?sslmode=require"
```
Opsional: gunakan `server/.env.example` sebagai referensi nilai.
3. Jalankan mode development (client + server):
```bash
npm run dev
```
4. Buka:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

## Build Production
1. Build semua workspace:
```bash
npm run build
```
2. Jalankan API server production:
```bash
npm run start --workspace server
```
3. Deploy static output frontend dari `client/dist` (Nginx, Caddy, Vercel static, dsb).

## Script Penting
- Root:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
  - `npm run typecheck`
- Client:
  - `npm run dev --workspace client`
  - `npm run build --workspace client`
  - `npm run preview --workspace client`
- Server:
  - `npm run dev --workspace server`
  - `npm run build --workspace server`
  - `npm run start --workspace server`

## Keyboard Shortcut
- `Ctrl/Cmd + Z`: undo
- `Ctrl/Cmd + Shift + Z`: redo
- `Ctrl/Cmd + D`: duplicate selected node
- `Delete` / `Backspace`: delete selected node (nonaktif saat sedang mengetik di input/textarea/select)
- `Ctrl/Cmd + +`: zoom in
- `Ctrl/Cmd + -`: zoom out
- `Ctrl/Cmd + 0`: reset zoom ke `100%`

## Catatan Deploy
- Gunakan `DATABASE_URL` Neon pada environment deploy (wajib).
- Arsitektur yang direkomendasikan: 2 project Vercel dalam 1 repo.
- Frontend Vercel: root repo, output `client/dist`.
- Backend Vercel: set Root Directory ke `server` (pakai Serverless Functions di `server/api`).
- Set `VITE_API_URL` di frontend ke URL backend Vercel, contoh: `https://your-backend.vercel.app/api`.
- Disarankan tambah autentikasi jika dipakai multi-user.

---

Built with full vibe coding using GPT-5.3 Codex.
