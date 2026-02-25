import { initDb } from '../../src/db/client';

let initPromise: Promise<void> | null = null;

export async function ensureDbReady(): Promise<void> {
  if (!initPromise) {
    initPromise = initDb();
  }
  await initPromise;
}
