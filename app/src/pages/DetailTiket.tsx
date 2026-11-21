import { AlertCircle, CheckCircle2, MessageSquareText, Wrench, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { KategoriLabel, PrioritasBadge, StatusBadge } from '@/components/Badges'
import { MobileShell } from '@/components/MobileShell'
import { formatLama, formatTanggal, lamaJam } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Ticket } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function DetailTiket() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tiket, setTiket] = useState<Ticket | null>(null)
  const [memuat, setMemuat] = useState(true)
  const [gagal, setGagal] = useState('')
  const [proses, setProses] = useState(false)
  const [tindakan, setTindakan] = useState('')
  const [salahTindakan, setSalahTindakan] = useState('')

  const muat = useCallback(async () => {
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single()

    if (error || !data) {
      setGagal('Tiket tidak ditemukan atau gagal dimuat.')
      setMemuat(false)
      return
    }

    setTiket(data as Ticket)
    setMemuat(false)
  }, [id])

  useEffect(() => {
    void muat()
  }, [muat])

  async function mulaiKerjakan() {
    setProses(true)
    const { error } = await supabase.from('tickets').update({ status: 'dikerjakan' }).eq('id', id)
    setProses(false)

    if (error) {
      toast.error('Gagal mengubah status tiket. Coba lagi.')
      return
    }

    toast.success('Tiket ditandai sedang dikerjakan.')
    void muat()
  }

  async function tandaiSelesai(e: React.FormEvent) {
    e.preventDefault()

    if (tindakan.trim().length < 5) {
      setSalahTindakan('Tindakan wajib diisi sebelum menandai selesai.')
      return
    }

    setProses(true)
    const { error } = await supabase
      .from('tickets')
      .update({
        status: 'selesai',
        tindakan: tindakan.trim(),
        selesai_at: new Date().toISOString(),
      })
      .eq('id', id)
    setProses(false)

    if (error) {
      toast.error('Gagal menandai tiket selesai. Coba lagi.')
      return
    }

    toast.success('Tiket ditandai selesai.')
    void muat()
  }

  return (
    <MobileShell>
      <div className="flex h-full flex-col">
        {/* Kepala panel */}
        <div className="shrink-0 border-b border-slate-100 bg-white px-5 pt-3 pb-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {tiket && (
                <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-mono text-xs font-extrabold text-indigo-700 tabular-nums">
                  {tiket.nomor_tiket}
                </span>
              )}
              {tiket && <StatusBadge status={tiket.status} />}
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              aria-label="Tutup detail tiket"
              className="rounded-full bg-slate-100 p-1.5 text-slate-500 transition-all hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {memuat ? (
            <p className="py-12 text-center text-xs text-slate-500">Memuat tiket...</p>
          ) : gagal || !tiket ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{gagal}</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <PrioritasBadge prioritas={tiket.prioritas} />
                  <KategoriLabel kategori={tiket.kategori} className="capitalize text-slate-600" />
                </div>
                <h2 className="text-base leading-snug font-bold text-slate-900">{tiket.judul}</h2>
              </div>

              <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400">Pelapor</span>
                  <span className="font-semibold text-slate-800">{tiket.nama_pelapor}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Unit Kerja</span>
                  <span className="font-semibold text-slate-800">{tiket.unit_kerja}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <MessageSquareText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Penjelasan Masalah</span>
                </h3>
                <p className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs leading-relaxed whitespace-pre-wrap text-slate-600">
                  {tiket.penjelasan}
                </p>
              </div>

              {/* Riwayat status */}
              <div className="border-t border-slate-100 pt-3">
                <h3 className="mb-2.5 text-xs font-semibold text-slate-700">Riwayat Status</h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    <div>
                      <span className="block font-medium text-slate-800">Tiket Dibuat (Baru)</span>
                      <span className="text-[11px] text-slate-400">
                        {formatTanggal(tiket.created_at)}
                      </span>
                    </div>
                  </div>

                  {tiket.status !== 'baru' && (
                    <div className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      <div>
                        <span className="block font-medium text-blue-700">Sedang Dikerjakan</span>
                        <span className="text-[11px] text-slate-400">
                          Ditangani oleh Chandra (Admin IT)
                        </span>
                      </div>
                    </div>
                  )}

                  {tiket.status === 'selesai' && (
                    <div className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                      <div>
                        <span className="block font-medium text-emerald-700">Tiket Selesai</span>
                        <span className="text-[11px] text-slate-400">
                          {formatTanggal(tiket.selesai_at)} Â·{' '}
                          {formatLama(lamaJam(tiket.created_at, tiket.selesai_at!))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Aksi sesuai status */}
              {tiket.status === 'baru' && (
                <div className="space-y-3 pt-1">
                  <p className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-[11px] leading-relaxed text-blue-800">
                    Klik tombol di bawah untuk mengubah status tiket menjadi{' '}
                    <strong>Dikerjakan</strong> agar pelapor mengetahui masalah sedang ditangani.
                  </p>
                  <button
                    type="button"
                    onClick={mulaiKerjakan}
                    disabled={proses}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60"
                  >
                    <Wrench className="h-4 w-4" />
                    <span>{proses ? 'Menyimpan...' : 'Mulai Kerjakan'}</span>
                  </button>
                </div>
              )}

              {tiket.status === 'dikerjakan' && (
                <form
                  onSubmit={tandaiSelesai}
                  className="space-y-3 border-t border-slate-100 pt-4"
                  noValidate
                >
                  <div>
                    <label
                      htmlFor="tindakan"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Tindakan yang Dilakukan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="tindakan"
                      rows={4}
                      value={tindakan}
                      onChange={(e) => {
                        setTindakan(e.target.value)
                        setSalahTindakan('')
                      }}
                      placeholder="Catat langkah perbaikan yang dilakukan secara jelas untuk rekap KPI..."
                      aria-invalid={!!salahTindakan}
                      className={cn(
                        'w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/25 focus:outline-none',
                        salahTindakan
                          ? 'border-rose-400'
                          : 'border-slate-300 focus:border-emerald-600',
                      )}
                    />
                    {salahTindakan && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{salahTindakan}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={proses}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{proses ? 'Menyimpan...' : 'Tandai Selesai'}</span>
                  </button>
                </form>
              )}

              {tiket.status === 'selesai' && (
                <div className="space-y-1.5 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Tindakan Penyelesaian</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Terkunci
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-emerald-900">
                    {tiket.tindakan}
                  </p>
                  <p className="border-t border-emerald-200/70 pt-1.5 text-[10px] text-emerald-700/80 italic">
                    * Tiket sudah selesai. Jika masalah muncul lagi, buat tiket baru.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </MobileShell>
  )
}
