import { CheckCircle2, Copy, Headset, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MobileShell } from '@/components/MobileShell'
import { TicketForm } from '@/components/TicketForm'
import { LABEL_KATEGORI, LABEL_PRIORITAS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import type { InputTiket } from '@/lib/types'
import { toast } from 'sonner'

export default function BuatTiket() {
  const [nomorTiket, setNomorTiket] = useState<string | null>(null)
  const [ringkasan, setRingkasan] = useState<InputTiket | null>(null)

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

  async function salinNomor() {
    if (!nomorTiket) return
    try {
      await navigator.clipboard.writeText(nomorTiket)
      toast.success('Nomor tiket disalin')
    } catch {
      toast.error('Gagal menyalin. Salin manual nomor tiket di atas.')
    }
  }

  return (
    <MobileShell latar="gelap">
      <div className="flex h-full flex-col bg-slate-50">
        <header className="shrink-0 rounded-b-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 px-5 pt-4 pb-6 text-white shadow-md">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/15 backdrop-blur-sm">
                <Headset className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] leading-tight font-medium text-indigo-100">
                  Koperasi Kredit Rukun
                </p>
                <p className="text-sm font-bold tracking-tight">Layanan IT Support</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-[11px] font-medium">
              Tanpa Login
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {nomorTiket ? 'Laporan Terkirim' : 'Lapor Masalah IT'}
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-indigo-100">
            {nomorTiket
              ? 'Simpan nomor tiket Anda sebagai bukti laporan.'
              : 'Isi formulir di bawah ini agar kendala teknis Anda segera tercatat dan ditangani tim IT.'}
          </p>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-5">
          {nomorTiket ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Laporan Diterima!</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Tiket Anda telah masuk ke antrean IT Support. Simpan nomor tiket berikut sebagai
                bukti laporan:
              </p>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Nomor Tiket Anda
                </span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span
                    className="font-mono text-xl font-extrabold tracking-tight text-indigo-700 tabular-nums"
                    data-testid="nomor-tiket"
                  >
                    {nomorTiket}
                  </span>
                  <button
                    type="button"
                    onClick={salinNomor}
                    title="Salin Nomor Tiket"
                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-xs transition-all hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {ringkasan && (
                <div className="mt-5 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-left text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Pelapor</span>
                    <span className="text-right font-semibold text-slate-700">
                      {ringkasan.nama_pelapor}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Unit / Kategori</span>
                    <span className="text-right font-semibold text-slate-700">
                      {ringkasan.unit_kerja} / {LABEL_KATEGORI[ringkasan.kategori]}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">Prioritas</span>
                    <span className="text-right font-semibold text-slate-700">
                      {LABEL_PRIORITAS[ringkasan.prioritas]}
                    </span>
                  </div>
                  <div className="border-t border-slate-200/60 pt-1.5">
                    <span className="mb-0.5 block text-slate-400">Judul Masalah</span>
                    <span className="block font-medium text-slate-800">{ringkasan.judul}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setNomorTiket(null)
                    setRingkasan(null)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Buat Laporan Lagi</span>
                </button>
                <Link
                  to="/admin/login"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200/80"
                >
                  <span>Lihat di Konsol Admin IT</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5 pb-2">
              <TicketForm onKirim={kirim} />

              <Link
                to="/admin/login"
                className="block pb-2 text-center text-[11px] font-semibold text-slate-400 transition-colors hover:text-indigo-600"
              >
                Masuk Konsol Admin IT
              </Link>
            </div>
          )}
        </main>
      </div>
    </MobileShell>
  )
}
