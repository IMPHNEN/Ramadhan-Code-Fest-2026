# Home Analyzer

Analisis isi home directory dengan fitur lengkap, mirip dengan `ls` tapi lebih informatif.

## Fitur

### CLI (Command Line Interface)
- **Tampilan Informasi**: Menampilkan nama, ukuran, tanggal modifikasi, tipe file, dan permission
- **Sorting**: Sort by name, size, modified date, atau type
- **Filter**: Cari file berdasarkan nama
- **Rekursif**: Tampilkan semua subdirektori dengan depth control
- **Statistik**: Total file, direktori, ukuran, dan hidden files
- **Format Long**: Tampilkan detail lengkap seperti `ls -l`
- **Color Output**: File tersembunyi berwarna abu-abu, direktori biru

### Web Interface
- **RESTful API**: Endpoint `/api/files` dan `/api/stats`
- **Responsive UI**: Frontend dengan HTML/CSS/JS vanilla
- **Real-time filtering**: Filter, sort, dan opsi langsung diterapkan
- **Statistik visual**: Tampilkan statistik dalam card format
- **CORS enabled**: Bisa diakses dari domain lain

## Instalasi

```bash
# Install dependencies
bun install

# Build both CLI and web server
bun run build

# Atau build terpisah
bun run build:cli   # Hanya CLI
bun run build:web   # Hanya web server
```

## Penggunaan

### CLI (Command Line)

```bash
# Dasar
bun run dist/index.js

# Dengan opsi
bun run dist/index.js -a -l -S -R -d 2
bun run dist/index.js -f "node" --stats
```

**Opsi CLI:**

| Opsi | Deskripsi |
|------|-----------|
| `-a`, `--all` | Tampilkan file tersembunyi |
| `-l`, `--long` | Format panjang dengan detail |
| `-r`, `--reverse` | Reverse sorting |
| `-R`, `--recursive` | Tampilkan rekursif |
| `-S` | Sort by ukuran |
| `-t` | Sort by tanggal modifikasi |
| `-f`, `--filter <text>` | Filter berdasarkan nama file |
| `-d`, `--depth <number>` | Maximum depth untuk rekursif |
| `--stats` | Hanya tampilkan statistik |
| `<path>` | Path direktori yang akan dianalisis (default: home) |

### Web Interface

```bash
# Start web server
bun run dist/server.js

# Atau dengan dev mode
bun run dev:web
```

Server akan berjalan di `http://localhost:3000`

**API Endpoints:**

- `GET /` - Web interface (frontend)
- `GET /api/files` - List files dengan query params
- `GET /api/stats` - Statistik direktori

**Query Parameters untuk `/api/files`:**

| Parameter | Deskripsi | Default |
|-----------|-----------|---------|
| `path` | Path direktori untuk scan | home directory |
| `sortBy` | Sort by: name, size, modified, type | name |
| `order` | asc atau desc | asc |
| `filter` | Filter nama file | - |
| `all` | Tampilkan hidden files (true/false) | false |
| `long` | Format panjang (true/false) | false |
| `recursive` | Scan rekursif (true/false) | false |
| `depth` | Maximum depth untuk rekursif | 1 |

**Contoh API calls:**

```bash
# Get all files
curl http://localhost:3000/api/files

# With filtering and options
curl "http://localhost:3000/api/files?filter=node&all=true&sortBy=size&order=desc"

# Get stats only
curl http://localhost:3000/api/stats
```

## Contoh Output

### CLI Simple format
```
📁 Documents/
📄 file.txt
📄 .hidden
```

### CLI Long format
```
drwxr-xr-x        0 B 06/02/2026, 12.24 📁 Documents
-rw-r--r--     4.0 KB 25/01/2026, 20.26 📄 file.txt
-rw-------       21 B 11/12/2025, 05.02 📄 .bashrc
```

### CLI Statistik
```
Statistik Direktori:
  Total File: 10
  Total Direktori: 15
  Total Ukuran: 913.9 KB
  File Tersembunyi: 3
```

### Web Interface
Web interface menampilkan:
- Statistik card (files, directories, size, hidden)
- File list dengan icon dan details
- Controls untuk filter, sort, dan opsi
- Responsive design untuk mobile & desktop

## Teknologi

- **Bun**: Runtime JavaScript/TypeScript
- **TypeScript**: Type-safe development
- **Bun APIs**: fs, path, serve untuk web server
- **Vanilla JS**: Frontend tanpa framework

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `bun run build` | Build CLI dan web server |
| `bun run build:cli` | Build hanya CLI |
| `bun run build:web` | Build hanya web server |
| `bun run start` | Jalankan CLI |
| `bun run web` | Jalankan web server |
| `bun run dev` | Dev mode untuk CLI (watch) |
| `bun run dev:web` | Dev mode untuk web server (watch) |
| `bun test` | Run tests |

## License

MIT