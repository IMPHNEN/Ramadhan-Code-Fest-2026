# 🌙 Ramadan Tracker API

A simple REST API to track fasting and daily worship activities during the holy month of Ramadan. Built with **Bun** + **Hono** + **SQLite**.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **Database**: SQLite (via `bun:sqlite`)
- **Validation**: [Zod](https://zod.dev)

## 🚀 Getting Started

### 1. Navigate to project folder

```bash
cd ramadan-tracker-api
```

### 2. Install dependencies

```bash
bun install
```

### 3. Setup environment

```bash
cp .env.example .env
```

### 4. Run the server

```bash
# Development (auto-reload)
bun run dev

# Production
bun run start
```

Server will be running at `http://localhost:3000`

---

## 📖 API Documentation

Interactive API documentation is available via Swagger UI after running the server:

```
http://localhost:3000/docs
```

---

## 📡 API Endpoints

### API Test Status

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET    | /test    | API status  |

---

### 🌙 Fasting `/api/puasa`

| Method | Endpoint           | Description               |
| ------ | ------------------ | ------------------------- |
| GET    | /api/puasa         | Get all fasting records   |
| GET    | /api/puasa/summary | Get fasting summary stats |
| GET    | /api/puasa/:id     | Get fasting record by ID  |
| POST   | /api/puasa         | Add a fasting record      |
| PUT    | /api/puasa/:id     | Update a fasting record   |
| DELETE | /api/puasa/:id     | Delete a fasting record   |

**Request Body POST/PUT:**

```json
{
  "tanggal": "2026-03-01",
  "status": "penuh",
  "catatan": "Alhamdulillah, smooth day"
}
```

> `status`: `penuh` (full) | `qadha` (make-up) | `batal` (broken)

---

### 🕌 Worship `/api/ibadah`

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | /api/ibadah                | Get all worship records     |
| GET    | /api/ibadah/hari-ini       | Get today's worship records |
| GET    | /api/ibadah/rekap/:tanggal | Get worship recap by date   |
| POST   | /api/ibadah                | Add a worship record        |
| PUT    | /api/ibadah/:id            | Update a worship record     |
| DELETE | /api/ibadah/:id            | Delete a worship record     |

**Request Body POST/PUT:**

```json
{
  "tanggal": "2026-03-01",
  "jenis": "subuh",
  "status": true,
  "jumlah": null,
  "catatan": "On time"
}
```

> `jenis`: `subuh` | `dzuhur` | `ashar` | `maghrib` | `isya` | `tarawih` | `tahajud` | `tilawah` | `dzikir`

---

### 🎯 Goals `/api/target`

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| GET    | /api/target              | Get all goals             |
| GET    | /api/target/progress     | Get progress of all goals |
| GET    | /api/target/:id          | Get goal by ID            |
| POST   | /api/target              | Create a new goal         |
| PUT    | /api/target/:id          | Update a goal             |
| PATCH  | /api/target/:id/progress | Add progress to a goal    |
| DELETE | /api/target/:id          | Delete a goal             |

**Request Body POST/PUT:**

```json
{
  "nama": "Khatam Al-Quran",
  "deskripsi": "Finish reading the Quran once during Ramadan",
  "target_nilai": 30,
  "satuan": "juz"
}
```

**Request Body PATCH progress:**

```json
{
  "tambah_nilai": 1
}
```

---

## 📁 Project Structure

```
ramadan-tracker-api/
├── src/
│   ├── index.ts              # Entry point
│   ├── db.ts                 # Database setup
│   ├── routes/
│   │   ├── puasa.ts          # Fasting routes
│   │   ├── ibadah.ts         # Worship routes
│   │   └── target.ts         # Goals routes
│   └── middleware/
│       └── logger.ts         # Logger middleware
├── .env.example
├── package.json
└── README.md
```

---

## 🚫 Ignored Files

- `.env` — environment variables (use `.env.example` as reference)
- `ramadan.db` — local SQLite database, auto-generated on first run
