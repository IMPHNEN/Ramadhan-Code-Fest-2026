import { Database } from "bun:sqlite";

const db = new Database("ramadan.db", { create: true });

db.run(`PRAGMA journal_mode = WAL;`);

db.run(`
  CREATE TABLE IF NOT EXISTS puasa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tanggal TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK(status IN ('penuh', 'qadha', 'batal')),
    catatan TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS ibadah (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL,
  jenis TEXT NOT NULL CHECK(jenis IN ('subuh', 'dzuhur', 'ashar', 'maghrib', 'isya', 'tarawih', 'tahajud', 'tilawah', 'dzikir')),
  status INTEGER NOT NULL DEFAULT 0,
  jumlah TEXT,
  catatan TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
  ) 
`);

db.run(`
  CREATE TABLE IF NOT EXISTS target (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    target_nilai INTEGER NOT NULL,
    current_nilai INTEGER NOT NULL DEFAULT 0,
    satuan TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

export default db;
