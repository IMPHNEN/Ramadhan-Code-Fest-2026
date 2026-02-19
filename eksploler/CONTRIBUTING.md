# Kontribusi

Terima kasih telah tertarik untuk berkontribusi!

## Cara Berkontribusi

1. Fork repository ini
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Development Setup

```bash
# Install dependencies
bun install

# Build project
bun build

# Run tests
bun test

# Run in dev mode (watch)
bun run --watch src/index.ts
```

## Coding Standards

- Gunakan TypeScript dengan strict mode
- Format kode dengan Bun built-in formatter
- Tambahkan test untuk fitur baru
- Update dokumentasi jika diperlukan

## Testing

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage
```

## Commit Convention

- `feat:` Fitur baru
- `fix:` Bug fix
- `docs:` Dokumentasi
- `style:` Formatting (tidak mengubah kode)
- `refactor:` Refactoring kode
- `test:` Menambah atau memperbaiki test
- `chore:` Build process atau tools

## Questions?

Buat issue untuk diskusi atau pertanyaan.