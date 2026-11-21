import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AmperaIcon } from '@/components/AmperaIcon'
import { FrostPass } from '@/components/FrostPass'
import { FrostShell, type FrostTema } from '@/components/FrostShell'
import { TicketForm } from '@/components/TicketForm'
import { supabase } from '@/lib/supabase'
import type { InputTiket } from '@/lib/types'
import { toast } from 'sonner'

/** Jam layanan IT (WIB): Senin–Jumat 07:30–15:30, Sabtu 07:30–13:00. */
function timItOnline(): boolean {
  const sekarang = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const hari = sekarang.getDay()
  const menit = sekarang.getHours() * 60 + sekarang.getMinutes()
  if (hari >= 1 && hari <= 5) return menit >= 7 * 60 + 30 && menit < 15 * 60 + 30
  if (hari === 6) return menit >= 7 * 60 + 30 && menit < 13 * 60
  return false
}

export default function BuatTiket() {
  const [nomorTiket, setNomorTiket] = useState<string | null>(null)
  const [ringkasan, setRingkasan] = useState<InputTiket | null>(null)
  const [tema, setTema] = useState<FrostTema>(() =>
    localStorage.getItem('frost-tema') === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    localStorage.setItem('frost-tema', tema)
  }, [tema])

  const online = timItOnline()

  async function kirim(nilai: InputTiket) {
    const { data, error } = await supabase.rpc('submit_tiket_publik', {
      p_nama_pelapor: nilai.nama_pelapor,
      p_unit_kerja: nilai.unit_kerja,
      p_kategori: nilai.kategori,
      p_judul: nilai.judul,
      p_penjelasan: nilai.penjelasan,
      p_prioritas: nilai.prioritas,
    })

    if (error || !data) {
      toast.error('Laporan gagal dikirim. Periksa koneksi internet lalu coba lagi.')
      return false
    }

    setRingkasan(nilai)
    setNomorTiket(String(data))
    return true
  }

  function reset() {
    setNomorTiket(null)
    setRingkasan(null)
  }

  return (
    <FrostShell tema={tema}>
      <header className="frost-header z-20 flex h-14 shrink-0 items-center justify-between px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="frost-surface frost-text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <AmperaIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="frost-text-primary text-sm leading-none font-extrabold tracking-tight">
              KoperasiCare
            </h1>
            <p className="frost-text-muted mt-1 truncate text-[10px] font-medium">
              Kopdit Rukun Palembang
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTema(tema === 'light' ? 'dark' : 'light')}
          aria-label="Ganti tema gelap atau terang"
          className="frost-surface frost-text-primary tap-press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
        >
          {tema === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>
      </header>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pt-3.5 pb-6">
        {nomorTiket && ringkasan ? (
          <FrostPass nomorTiket={nomorTiket} ringkasan={ringkasan} onBaru={reset} />
        ) : (
          <div className="animate-fade space-y-4">
            <div className="frost-surface flex items-center justify-between rounded-2xl px-3.5 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                {online ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
                  </span>
                ) : (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                )}
                <span className="frost-text-primary truncate text-[11px] font-semibold">
                  {online
                    ? 'Tim IT Online • Estimasi respon < 15 mnt'
                    : 'Di luar jam layanan • Laporan tetap tercatat'}
                </span>
              </div>
              <span
                className={
                  online
                    ? 'frost-accent-subtle frost-mono shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold'
                    : 'frost-track frost-text-muted frost-mono shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold'
                }
              >
                {online ? 'SIAGA' : 'OFFLINE'}
              </span>
            </div>

            <div>
              <h2 className="frost-text-primary text-lg font-extrabold tracking-tight">
                Lapor Masalah IT
              </h2>
              <p className="frost-text-secondary mt-0.5 text-xs">
                Sampaikan gangguan perangkat atau sistem tanpa perlu login.
              </p>
            </div>

            <TicketForm onKirim={kirim} labelTombol="Kirim Laporan Tiket" tampilkanPreset />

            <Link
              to="/admin/login"
              className="frost-text-muted block pb-2 text-center text-[11px] font-semibold hover:opacity-80"
            >
              Masuk Konsol Admin IT
            </Link>
          </div>
        )}
      </main>
    </FrostShell>
  )
}
