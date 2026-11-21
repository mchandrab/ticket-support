import { readFileSync } from 'node:fs'
import path from 'node:path'

/** Membaca variabel dari satu/lebih file .env tanpa dependency tambahan. */
export function bacaEnv(...berkas: string[]): Record<string, string> {
  const hasil: Record<string, string> = {}
  for (const berkasEnv of berkas) {
    try {
      const isi = readFileSync(path.resolve(berkasEnv), 'utf8')
      for (const baris of isi.split(/\r?\n/)) {
        if (!baris.includes('=') || baris.trim().startsWith('#')) continue
        const i = baris.indexOf('=')
        hasil[baris.slice(0, i).trim()] = baris.slice(i + 1).trim()
      }
    } catch {
      // file tidak ada: biarkan kosong
    }
  }
  return hasil
}

export const envApp = bacaEnv('.env.local', '.env.test.local')
