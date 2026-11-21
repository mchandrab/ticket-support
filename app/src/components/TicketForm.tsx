import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  KATEGORI,
  LABEL_KATEGORI,
  LABEL_PRIORITAS_FROST,
  PRIORITAS,
  UNIT_KERJA,
} from '@/lib/constants'
import type { InputTiket, Kategori } from '@/lib/types'
import { cn } from '@/lib/utils'

type NilaiForm = {
  nama_pelapor: string
  unit_kerja: string
  kategori: string
  judul: string
  penjelasan: string
  prioritas: string
}

type SalahForm = Partial<Record<keyof NilaiForm, string>>

type Props = {
  onKirim: (nilai: InputTiket) => Promise<boolean>
  labelTombol?: string
  onBatal?: () => void
  /** Tampilkan chip kendala cepat (hanya untuk form publik). */
  tampilkanPreset?: boolean
}

const DOT_PRIORITAS: Record<string, string> = {
  rendah: 'bg-teal-400',
  sedang: 'bg-amber-500',
  tinggi: 'bg-rose-500',
}

/** Preset kendala umum: sekali ketuk mengisi kategori, judul, dan penjelasan. */
const PRESET_KENDALA: {
  label: string
  kategori: Kategori
  judul: string
  penjelasan: string
}[] = [
  {
    label: 'Wi-Fi / LAN Putus',
    kategori: 'jaringan',
    judul: 'Koneksi Wi-Fi / LAN terputus',
    penjelasan: 'Komputer tidak terhubung ke jaringan lokal kantor.',
  },
  {
    label: 'Sistem Koperasi Lambat',
    kategori: 'software',
    judul: 'Aplikasi koperasi merespons lambat',
    penjelasan: 'Proses penyimpanan transaksi mengalami loading lama.',
  },
  {
    label: 'Printer Kasir Error',
    kategori: 'printer',
    judul: 'Printer kasir / passbook macet',
    penjelasan: 'Printer tidak dapat mencetak bukti transaksi atau buku tabungan.',
  },
  {
    label: 'PC / Laptop Bermasalah',
    kategori: 'komputer',
    judul: 'Komputer / laptop tidak bisa dipakai',
    penjelasan: 'Perangkat tidak menyala, lambat, atau muncul pesan error.',
  },
]

const NILAI_AWAL: NilaiForm = {
  nama_pelapor: '',
  unit_kerja: '',
  kategori: '',
  judul: '',
  penjelasan: '',
  prioritas: 'sedang',
}

function PesanSalah({ pesan }: { pesan?: string }) {
  if (!pesan) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{pesan}</span>
    </p>
  )
}

export function TicketForm({
  onKirim,
  labelTombol = 'Kirim Laporan',
  onBatal,
  tampilkanPreset = false,
}: Props) {
  const [nilai, setNilai] = useState<NilaiForm>(NILAI_AWAL)
  const [salah, setSalah] = useState<SalahForm>({})
  const [mengirim, setMengirim] = useState(false)

  function ubah<K extends keyof NilaiForm>(kunci: K, isi: NilaiForm[K]) {
    setNilai((lama) => ({ ...lama, [kunci]: isi }))
    setSalah((lama) => ({ ...lama, [kunci]: undefined }))
  }

  function terapkanPreset(preset: (typeof PRESET_KENDALA)[number]) {
    setNilai((lama) => ({
      ...lama,
      kategori: preset.kategori,
      judul: preset.judul,
      penjelasan: preset.penjelasan,
    }))
    setSalah((lama) => ({
      ...lama,
      kategori: undefined,
      judul: undefined,
      penjelasan: undefined,
    }))
    toast.success(`Preset "${preset.label}" diterapkan.`)
  }

  function validasi(): SalahForm {
    const hasil: SalahForm = {}
    if (nilai.nama_pelapor.trim().length < 3) hasil.nama_pelapor = 'Nama minimal 3 karakter'
    if (!nilai.unit_kerja) hasil.unit_kerja = 'Pilih unit kerja dulu'
    if (!nilai.kategori) hasil.kategori = 'Pilih salah satu kategori masalah'
    if (nilai.judul.trim().length < 5) hasil.judul = 'Judul minimal 5 karakter'
    if (nilai.penjelasan.trim().length < 10)
      hasil.penjelasan = 'Penjelasan minimal 10 karakter'
    return hasil
  }

  async function kirim(e: React.FormEvent) {
    e.preventDefault()
    const masalah = validasi()
    setSalah(masalah)
    if (Object.keys(masalah).length > 0) return
    setMengirim(true)
    const berhasil = await onKirim({
      ...nilai,
      nama_pelapor: nilai.nama_pelapor.trim(),
      judul: nilai.judul.trim(),
      penjelasan: nilai.penjelasan.trim(),
    } as InputTiket)
    setMengirim(false)
    if (berhasil) {
      setNilai(NILAI_AWAL)
      setSalah({})
    }
  }

  return (
    <div className="frost-root">
      {tampilkanPreset && (
        <div className="mb-4 space-y-1.5">
          <span className="frost-mono frost-text-muted text-[10px] font-bold tracking-wider uppercase">
            Kendala Cepat (Ketuk untuk isi)
          </span>
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-0.5">
            {PRESET_KENDALA.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => terapkanPreset(preset)}
                className="frost-surface frost-text-primary tap-press cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={kirim} className="space-y-3.5" noValidate>
        <div className="frost-surface space-y-3.5 rounded-2xl p-4">
          <div>
            <label
              htmlFor="nama_pelapor"
              className="frost-text-primary mb-1 block text-[11px] font-bold"
            >
              Nama Pelapor
            </label>
            <input
              id="nama_pelapor"
              type="text"
              value={nilai.nama_pelapor}
              onChange={(e) => ubah('nama_pelapor', e.target.value)}
              placeholder="Contoh: Siti Rahmawati"
              aria-invalid={!!salah.nama_pelapor}
              className={cn(
                'frost-input w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold',
                salah.nama_pelapor && 'frost-input-error',
              )}
            />
            <PesanSalah pesan={salah.nama_pelapor} />
          </div>

          <div>
            <p
              id="label-unit-kerja"
              className="frost-text-primary mb-1.5 block text-[11px] font-bold"
            >
              Unit Kerja
            </p>
            <div
              role="radiogroup"
              aria-labelledby="label-unit-kerja"
              className="grid grid-cols-3 gap-1.5"
            >
              {UNIT_KERJA.map((unit) => {
                const aktif = nilai.unit_kerja === unit
                return (
                  <button
                    key={unit}
                    type="button"
                    role="radio"
                    aria-checked={aktif}
                    onClick={() => ubah('unit_kerja', unit)}
                    className={cn(
                      'tap-press cursor-pointer truncate rounded-xl px-2 py-2 text-[11px] transition-all',
                      aktif ? 'frost-pill-active font-bold' : 'frost-pill-inactive font-semibold',
                    )}
                  >
                    {unit}
                  </button>
                )
              })}
            </div>
            <PesanSalah pesan={salah.unit_kerja} />
          </div>

          <div>
            <p
              id="label-kategori"
              className="frost-text-primary mb-1.5 block text-[11px] font-bold"
            >
              Kategori Masalah
            </p>
            <div
              role="radiogroup"
              aria-labelledby="label-kategori"
              className="grid grid-cols-2 gap-1.5"
            >
              {KATEGORI.map((kategori) => {
                const aktif = nilai.kategori === kategori
                return (
                  <button
                    key={kategori}
                    type="button"
                    role="radio"
                    aria-checked={aktif}
                    onClick={() => ubah('kategori', kategori)}
                    className={cn(
                      'tap-press cursor-pointer truncate rounded-xl px-2 py-2 text-[11px] transition-all',
                      aktif ? 'frost-pill-active font-bold' : 'frost-pill-inactive font-semibold',
                    )}
                  >
                    {LABEL_KATEGORI[kategori]}
                  </button>
                )
              })}
            </div>
            <PesanSalah pesan={salah.kategori} />
          </div>

          <div>
            <label
              htmlFor="judul"
              className="frost-text-primary mb-1 block text-[11px] font-bold"
            >
              Judul Masalah
            </label>
            <input
              id="judul"
              type="text"
              value={nilai.judul}
              onChange={(e) => ubah('judul', e.target.value)}
              placeholder="Judul singkat gangguan..."
              aria-invalid={!!salah.judul}
              className={cn(
                'frost-input w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold',
                salah.judul && 'frost-input-error',
              )}
            />
            <PesanSalah pesan={salah.judul} />
          </div>

          <div>
            <label
              htmlFor="penjelasan"
              className="frost-text-primary mb-1 block text-[11px] font-bold"
            >
              Penjelasan Masalah
            </label>
            <textarea
              id="penjelasan"
              rows={2}
              value={nilai.penjelasan}
              onChange={(e) => ubah('penjelasan', e.target.value)}
              placeholder="Jelaskan detail gangguan, nomor PC, atau pesan error..."
              aria-invalid={!!salah.penjelasan}
              className={cn(
                'frost-input w-full resize-none rounded-xl px-3.5 py-2 text-xs font-medium',
                salah.penjelasan && 'frost-input-error',
              )}
            />
            <PesanSalah pesan={salah.penjelasan} />
          </div>

          <div>
            <p
              id="label-prioritas"
              className="frost-text-primary mb-1.5 block text-[11px] font-bold"
            >
              Tingkat Urgensi
            </p>
            <div
              role="radiogroup"
              aria-labelledby="label-prioritas"
              className="grid grid-cols-3 gap-1.5"
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
                      'tap-press flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] transition-all',
                      aktif ? 'frost-pill-active font-bold' : 'frost-pill-inactive font-semibold',
                    )}
                  >
                    <span
                      className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_PRIORITAS[prioritas])}
                    />
                    <span>{LABEL_PRIORITAS_FROST[prioritas]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={mengirim}
          className="frost-btn-primary tap-press flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold tracking-wide shadow-sm"
        >
          {mengirim ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <span>{labelTombol}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        {onBatal && (
          <button
            type="button"
            onClick={onBatal}
            className="frost-text-secondary w-full cursor-pointer py-1 text-center text-xs font-semibold hover:opacity-80"
          >
            Batal
          </button>
        )}
      </form>
    </div>
  )
}
