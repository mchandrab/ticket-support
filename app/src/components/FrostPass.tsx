import { CheckCircle2, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { LABEL_KATEGORI, LABEL_PRIORITAS_FROST } from '@/lib/constants'
import type { InputTiket } from '@/lib/types'

type Props = {
  nomorTiket: string
  ringkasan: InputTiket
  onBaru: () => void
}

/** Batang barcode dekoratif, diturunkan dari nomor tiket agar stabil per tiket. */
function barcodeBars(kode: string) {
  const bars: { x: number; w: number }[] = []
  let x = 4
  for (let i = 0; i < 40; i++) {
    const c = kode.charCodeAt(i % kode.length)
    const w = 1.5 + ((c + i * 7) % 4)
    bars.push({ x, w })
    x += w + 2.2
  }
  return bars
}

/**
 * Kartu bukti laporan ala "Frost Support Pass": nomor tiket, rincian
 * laporan, garis perforasi, dan barcode dekoratif.
 */
export function FrostPass({ nomorTiket, ringkasan, onBaru }: Props) {
  async function salinNomor() {
    try {
      await navigator.clipboard.writeText(nomorTiket)
      toast.success(`Nomor ${nomorTiket} disalin.`)
    } catch {
      toast.error('Gagal menyalin nomor tiket.')
    }
  }

  return (
    <div className="animate-fade space-y-4">
      <div className="flex items-center justify-between">
        <span className="frost-accent-subtle inline-flex items-center gap-1.5 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Laporan Diterima!</span>
        </span>
        <button
          type="button"
          onClick={onBaru}
          className="frost-text-secondary cursor-pointer text-xs font-bold hover:opacity-80"
        >
          + Laporan Baru
        </button>
      </div>

      <div className="frost-surface-elevated overflow-hidden rounded-3xl">
        <div className="frost-divider flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="frost-mono frost-text-muted text-[10px] tracking-widest uppercase">
              Kopdit Rukun Palembang
            </p>
            <p className="frost-text-primary mt-0.5 text-sm font-extrabold">
              Frost Support Pass
            </p>
          </div>
          <span className="frost-accent-subtle frost-mono rounded-full px-2.5 py-1 text-[10px] font-bold">
            SLA &lt; 15m
          </span>
        </div>

        <div className="frost-divider flex items-center justify-between border-b px-5 py-4">
          <div>
            <span className="frost-mono frost-text-muted text-[10px] tracking-wider uppercase">
              Nomor Tiket
            </span>
            <p
              data-testid="nomor-tiket"
              className="frost-mono frost-text-primary mt-0.5 text-lg font-bold tracking-tight"
            >
              {nomorTiket}
            </p>
          </div>
          <button
            type="button"
            onClick={salinNomor}
            className="frost-surface frost-text-primary tap-press flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Salin</span>
          </button>
        </div>

        <div className="space-y-3 p-5 text-xs">
          <div>
            <span className="frost-mono frost-text-muted text-[10px] uppercase">Kendala</span>
            <p className="frost-text-primary mt-0.5 leading-snug font-bold">{ringkasan.judul}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="frost-mono frost-text-muted text-[10px] uppercase">Pelapor</span>
              <p className="frost-text-primary mt-0.5 font-bold">{ringkasan.nama_pelapor}</p>
            </div>
            <div>
              <span className="frost-mono frost-text-muted text-[10px] uppercase">
                Unit Kerja
              </span>
              <p className="frost-text-primary mt-0.5 truncate font-bold">
                {ringkasan.unit_kerja}
              </p>
            </div>
            <div>
              <span className="frost-mono frost-text-muted text-[10px] uppercase">Kategori</span>
              <p className="frost-text-secondary mt-0.5 font-semibold">
                {LABEL_KATEGORI[ringkasan.kategori]}
              </p>
            </div>
            <div>
              <span className="frost-mono frost-text-muted text-[10px] uppercase">Urgensi</span>
              <p className="frost-text-primary mt-0.5 font-bold">
                {LABEL_PRIORITAS_FROST[ringkasan.prioritas]}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex h-5 items-center">
          <div className="frost-notch -ml-2 h-4 w-4 rounded-full border-r" />
          <div className="frost-perforation mx-1 h-[1.5px] flex-1" />
          <div className="frost-notch -mr-2 h-4 w-4 rounded-full border-l" />
        </div>

        <div className="flex flex-col items-center px-5 pt-1 pb-5">
          <svg
            className="frost-text-primary h-10 w-full opacity-80"
            viewBox="0 0 260 40"
            fill="currentColor"
            aria-hidden="true"
          >
            {barcodeBars(nomorTiket).map((bar, i) => (
              <rect key={i} x={bar.x} y="2" width={bar.w} height="36" />
            ))}
          </svg>
          <span className="frost-mono frost-text-muted mt-1.5 text-[10px] tracking-[0.25em]">
            {nomorTiket}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onBaru}
          className="frost-btn-primary tap-press w-full cursor-pointer rounded-2xl py-3 text-xs font-extrabold"
        >
          Buat Laporan Lagi
        </button>
        <Link
          to="/admin/login"
          className="frost-text-muted block pb-2 text-center text-[11px] font-semibold hover:opacity-80"
        >
          Masuk Konsol Admin IT
        </Link>
      </div>
    </div>
  )
}
