# Widal API

A Laravel REST API for encoding and decoding **Sundanese/Indonesian text** to and from **Widal code** — a phonetic cipher system.

## Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `POST` | `/api/v1/widal/encode` | Encode text → Widal code |
| `POST` | `/api/v1/widal/decode` | Decode Widal code → plain text |
| `POST` | `/api/v1/widal` | Legacy unified endpoint |

### Response shape

All responses share a consistent envelope:

```json
{
  "success": true,
  "message": "Text encoded successfully.",
  "data": {
    "input": "halo dunia",
    "result": "byaro pnyukninynya",
    "reversal": false
  }
}
```

---

## Quick Start with Docker (Recommended)

### 1. Clone the repo

```bash
git clone https://github.com/zhoeryamh/widal-api.git
cd widal-api
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env: set APP_KEY, DB_PASSWORD, APP_URL, etc.
```

### 3. Build and run

```bash
docker compose up -d --build
```

### 4. Generate app key (first run only)

```bash
docker exec widal-api php artisan key:generate
```

### 5. Run migrations (optional — only needed if DB logging is enabled)

```bash
docker exec widal-api php artisan migrate
```

The API will be available at `http://localhost:8000`.

---

## Manual / VPS Setup (without Docker)

### Requirements

- PHP >= 8.2
- Composer
- MySQL (optional, only for DB logging)
- Nginx or Apache
- `php-mbstring`, `php-intl`, `php-pdo_mysql`, `php-zip`

### Steps

```bash
git clone https://github.com/zhoeryamh/widal-api.git
cd widal-api

composer install --no-dev --optimize-autoloader

cp .env.example .env
php artisan key:generate

# Point Nginx/Apache document root to /path/to/widal-api/public
# Then:
php artisan config:cache
php artisan route:cache

# Optional — only if WIDAL_ENABLE_DB_LOG=true
php artisan migrate
```

---

## Feature Flags

| `.env` key | Default | Description |
|------------|---------|-------------|
| `WIDAL_ENABLE_DB_LOG` | `false` | Save every request to DB |
| `APP_DEBUG` | `false` | Show detailed errors |
| `CORS_ALLOWED_ORIGINS` | `*` | Comma-separated allowed origins |

---

## API Usage Examples

### Encode

```bash
curl -X POST http://localhost:8000/api/v1/widal/encode \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"text": "halo dunia", "reversal": false}'
```

### Decode

```bash
curl -X POST http://localhost:8000/api/v1/widal/decode \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"text": "byaro pnyukninynya"}'
```

---

## Postman Collection

Import `Widal API Test.postman_collection.json` into Postman and set the `base_url` variable to your server address.

---

## License

MIT
