import { AlertCircle, Building2, ChevronDown, Send, User } from 'lucide-react'
import { useState } from 'react'
import { IKON_KATEGORI } from '@/components/Badges'
import { KATEGORI, LABEL_KATEGORI, LABEL_PRIORITAS, PRIORITAS, UNIT_KERJA } from '@/lib/constants'
import type { InputTiket } from '@/lib/types'
import { cn } from '@/lib/utils'

type NilaiForm = {
  nama_pelapor: string
  unit_kerja: string
  kategori: string
  judul: string
  penjelasan: string
  prioritas: string
}

type Kesalahan = Partial<Record<keyof NilaiForm, string>>

const AWAL: NilaiForm = {
  nama_pelapor: '',
  unit_kerja: '',
  kategori: '',
  judul: '',
  penjelasan: '',
  prioritas: 'sedang',
}

const KETERANGAN_KATEGORI: Record<string, string> = {
  komputer: 'PC / Laptop / Layar',
  printer: 'Cetak / Tinta / Macet',
  jaringan: 'WiFi / LAN / Internet',
  software: 'Aplikasi / Sistem',
}

const GAYA_PIL_PRIORITAS: Record<string, string> = {
  rendah: 'bg-slate-700 text-white shadow-sm',
  sedang: 'bg-amber-500 text-white shadow-sm',
  tinggi: 'bg-rose-600 text-white shadow-sm',
}

function validasi(nilai: NilaiForm): Kesalahan {
  const salah: Kesalahan = {}
  if (nilai.nama_pelapor.trim().length < 3) salah.nama_pelapor = 'Nama pelapor wajib diisi'
  if (!nilai.unit_kerja) salah.unit_kerja = 'Silakan pilih unit kerja'
  if (!nilai.kategori) salah.kategori = 'Pilih salah satu kategori masalah'
  if (nilai.judul.trim().length < 5) salah.judul = 'Judul masalah wajib diisi'
  if (nilai.penjelasan.trim().length < 10) salah.penjelasan = 'Penjelasan masalah wajib diisi'
  return salah
}

function PesanSalah({ pesan }: { pesan?: string }) {
  if (!pesan) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{pesan}</span>
    </p>
  )
}

const GAYA_INPUT =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none'

type Props = {
  onKirim: (nilai: InputTiket) => Promise<boolean>
  labelTombol?: string
  onBatal?: () => void
}

export function TicketForm({ onKirim, labelTombol = 'Kirim Laporan', onBatal }: Props) {
  const [nilai, setNilai] = useState<NilaiForm>(AWAL)
  const [salah, setSalah] = useState<Kesalahan>({})
  const [mengirim, setMengirim] = useState(false)

  function ubah<K extends keyof NilaiForm>(kunci: K, isi: NilaiForm[K]) {
    setNilai((lama) => ({ ...lama, [kunci]: isi }))
    setSalah((lama) => ({ ...lama, [kunci]: undefined }))
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault()
    const hasil = validasi(nilai)
    setSalah(hasil)
    if (Object.keys(hasil).length > 0) return

    setMengirim(true)
    const berhasil = await onKirim(nilai as InputTiket)
    setMengirim(false)
    if (berhasil) setNilai(AWAL)
  }

  return (
    <form onSubmit={kirim} className="space-y-4" noValidate>
      <div>
        <label htmlFor="nama_pelapor" className="mb-1.5 block text-xs font-semibold text-slate-700">
          Nama Pelapor <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="nama_pelapor"
            value={nilai.nama_pelapor}
            onChange={(e) => ubah('nama_pelapor', e.target.value)}
            placeholder="Contoh: Rina Marlina"
            aria-invalid={!!salah.nama_pelapor}
            className={cn(
              GAYA_INPUT,
              'border-slate-200 pl-10',
              salah.nama_pelapor ? 'border-rose-400' : 'focus:border-indigo-500',
            )}
          />
        </div>
        <PesanSalah pesan={salah.nama_pelapor} />
      </div>

      <div>
        <label htmlFor="unit_kerja" className="mb-1.5 block text-xs font-semibold text-slate-700">
          Unit Kerja <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            id="unit_kerja"
            value={nilai.unit_kerja}
            onChange={(e) => ubah('unit_kerja', e.target.value)}
            aria-invalid={!!salah.unit_kerja}
            className={cn(
              GAYA_INPUT,
              'appearance-none border-slate-200 pr-9 pl-10',
              salah.unit_kerja ? 'border-rose-400' : 'focus:border-indigo-500',
            )}
          >
            <option value="">Pilih unit kerja Anda...</option>
            {UNIT_KERJA.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <PesanSalah pesan={salah.unit_kerja} />
      </div>

      <div>
        <p id="label-kategori" className="mb-1.5 block text-xs font-semibold text-slate-700">
          Kategori Masalah <span className="text-rose-500">*</span>
        </p>
        <div
          role="radiogroup"
          aria-labelledby="label-kategori"
          className="grid grid-cols-2 gap-2.5"
        >
          {KATEGORI.map((kategori) => {
            const Ikon = IKON_KATEGORI[kategori]
            const aktif = nilai.kategori === kategori
            return (
              <button
                key={kategori}
                type="button"
                role="radio"
                aria-checked={aktif}
                onClick={() => ubah('kategori', kategori)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all',
                  aktif
                    ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-indigo-300',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    aktif ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600',
                  )}
                >
                  <Ikon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-800">
                    {LABEL_KATEGORI[kategori]}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {KETERANGAN_KATEGORI[kategori]}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <PesanSalah pesan={salah.kategori} />
      </div>

      <div>
        <label htmlFor="judul" className="mb-1.5 block text-xs font-semibold text-slate-700">
          Judul Masalah <span className="text-rose-500">*</span>
        </label>
        <input
          id="judul"
          value={nilai.judul}
          onChange={(e) => ubah('judul', e.target.value)}
          placeholder="Contoh: Printer kasir tidak bisa menarik kertas"
          aria-invalid={!!salah.judul}
          className={cn(
            GAYA_INPUT,
            'border-slate-200',
            salah.judul ? 'border-rose-400' : 'focus:border-indigo-500',
          )}
        />
        <PesanSalah pesan={salah.judul} />
      </div>

      <div>
        <label htmlFor="penjelasan" className="mb-1.5 block text-xs font-semibold text-slate-700">
          Penjelasan Masalah <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="penjelasan"
          rows={3}
          value={nilai.penjelasan}
          onChange={(e) => ubah('penjelasan', e.target.value)}
          placeholder="Jelaskan kronologi atau pesan error yang muncul..."
          aria-invalid={!!salah.penjelasan}
          className={cn(
            GAYA_INPUT,
            'resize-none border-slate-200',
            salah.penjelasan ? 'border-rose-400' : 'focus:border-indigo-500',
          )}
        />
        <PesanSalah pesan={salah.penjelasan} />
      </div>

      <div>
        <p id="label-prioritas" className="mb-1.5 block text-xs font-semibold text-slate-700">
          Tingkat Prioritas
        </p>
        <div
          role="radiogroup"
          aria-labelledby="label-prioritas"
          className="grid grid-cols-3 gap-2 rounded-xl bg-slate-200/70 p-1"
        >
          {PRIORITAS.map((prioritas) => {
            const aktif = nilai.prioritas === prioritas
            return (
              <button
                key={prioritas}
                type="button"
                role="radio"
                aria-checked={aktif}
                onClick={() => ubah('prioritas', prioritas)}
                className={cn(
                  'rounded-lg px-2 py-2 text-xs font-semibold transition-all',
                  aktif ? GAYA_PIL_PRIORITAS[prioritas] : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {LABEL_PRIORITAS[prioritas]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="submit"
          disabled={mengirim}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          <span>{mengirim ? 'Mengirim...' : labelTombol}</span>
        </button>
        {onBatal && (
          <button
            type="button"
            onClick={onBatal}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  )
}
