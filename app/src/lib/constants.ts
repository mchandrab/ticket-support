import type { Kategori, Prioritas, Status, UnitKerja } from './types'

export const UNIT_KERJA: UnitKerja[] = [
  'IT',
  'Keuangan',
  'SDM',
  'Operasional',
  'Bag. Umum',
  'Logistik',
]

export const KATEGORI: Kategori[] = ['komputer', 'printer', 'jaringan', 'software']

export const PRIORITAS: Prioritas[] = ['rendah', 'sedang', 'tinggi']

export const STATUS: Status[] = ['baru', 'dikerjakan', 'selesai']

export const LABEL_KATEGORI: Record<Kategori, string> = {
  komputer: 'Komputer',
  printer: 'Printer',
  jaringan: 'Jaringan',
  software: 'Software',
}

export const LABEL_STATUS: Record<Status, string> = {
  baru: 'Baru',
  dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
}

export const LABEL_PRIORITAS: Record<Prioritas, string> = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi',
}

/** Label urgensi ala Frost (hanya untuk form publik). */
export const LABEL_PRIORITAS_FROST: Record<Prioritas, string> = {
  rendah: 'Normal',
  sedang: 'Mendesak',
  tinggi: 'Kritis',
}
