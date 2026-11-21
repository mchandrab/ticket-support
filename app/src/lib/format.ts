const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const NAMA_BULAN_PENDEK = NAMA_BULAN.map((b) => b.slice(0, 3))

/** 21 November 2026, 14.05 */
export function formatTanggal(waktu: string | null): string {
  if (!waktu) return '-'
  const d = new Date(waktu)
  const jam = String(d.getHours()).padStart(2, '0')
  const menit = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}, ${jam}.${menit}`
}

/** 21 Nov 2026 */
export function formatTanggalSingkat(waktu: string): string {
  const d = new Date(waktu)
  return `${d.getDate()} ${NAMA_BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`
}

/** Kunci bulan lokal, mis. "2026-11" */
export function kunciBulan(waktu: string | Date): string {
  const d = typeof waktu === 'string' ? new Date(waktu) : waktu
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function labelBulan(kunci: string): string {
  const [tahun, bulan] = kunci.split('-')
  return `${NAMA_BULAN[Number(bulan) - 1]} ${tahun}`
}

export function labelBulanPendek(kunci: string): string {
  const [tahun, bulan] = kunci.split('-')
  return `${NAMA_BULAN_PENDEK[Number(bulan) - 1]} ${tahun.slice(2)}`
}

/** Lama penyelesaian dalam jam, dibulatkan 1 desimal */
export function lamaJam(mulai: string, selesai: string): number {
  const selisih = new Date(selesai).getTime() - new Date(mulai).getTime()
  return Math.round((selisih / 3_600_000) * 10) / 10
}

export function formatLama(jam: number): string {
  if (!Number.isFinite(jam)) return '-'
  if (jam < 1) return 'kurang dari 1 jam'
  if (jam < 24) return `${jam} jam`
  const hari = Math.round((jam / 24) * 10) / 10
  return `${hari} hari`
}

/** Versi ringkas untuk kartu KPI, mis. "< 1 jam", "1j 45m", "2,5 hari" */
export function formatLamaRingkas(jam: number): string {
  if (!Number.isFinite(jam)) return '-'
  if (jam < 1) return '< 1 jam'
  if (jam < 24) {
    const bagianJam = Math.floor(jam)
    const menit = Math.round((jam - bagianJam) * 60)
    return menit > 0 ? `${bagianJam}j ${menit}m` : `${bagianJam}j`
  }
  const hari = Math.round((jam / 24) * 10) / 10
  return `${String(hari).replace('.', ',')} hari`
}
