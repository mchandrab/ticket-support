export type Status = 'baru' | 'dikerjakan' | 'selesai'
export type Prioritas = 'rendah' | 'sedang' | 'tinggi'
export type Kategori = 'komputer' | 'printer' | 'jaringan' | 'software'
export type UnitKerja =
  | 'IT'
  | 'Keuangan'
  | 'SDM'
  | 'Operasional'
  | 'Bag. Umum'
  | 'Logistik'

export type Ticket = {
  id: string
  nomor_tiket: string
  created_at: string
  nama_pelapor: string
  unit_kerja: UnitKerja
  kategori: Kategori
  judul: string
  penjelasan: string
  prioritas: Prioritas
  status: Status
  tindakan: string | null
  selesai_at: string | null
}

export type InputTiket = {
  nama_pelapor: string
  unit_kerja: UnitKerja
  kategori: Kategori
  judul: string
  penjelasan: string
  prioritas: Prioritas
}
