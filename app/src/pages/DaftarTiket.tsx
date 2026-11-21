import { Inbox, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/AdminLayout'
import { KategoriLabel, PrioritasBadge, StatusBadge } from '@/components/Badges'
import { LABEL_KATEGORI, LABEL_STATUS, STATUS } from '@/lib/constants'
import { formatTanggalSingkat } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Kategori, Status, Ticket } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const GAYA_CHIP: Record<'semua' | Status, string> = {
  semua: 'bg-slate-900 text-white',
  baru: 'border border-amber-200/80 bg-amber-50 text-amber-800',
  dikerjakan: 'border border-blue-200/80 bg-blue-50 text-blue-800',
  selesai: 'border border-emerald-200/80 bg-emerald-50 text-emerald-800',
}

export default function DaftarTiket() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [memuat, setMemuat] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'semua' | Status>('semua')
  const [filterKategori, setFilterKategori] = useState<'semua' | Kategori>('semua')
  const [cari, setCari] = useState('')
  const [cariTerbuka, setCariTerbuka] = useState(false)
  const navigate = useNavigate()

  const muat = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Gagal memuat daftar tiket. Periksa koneksi internet.')
      setMemuat(false)
      return
    }

    setTickets((data as Ticket[]) ?? [])
    setMemuat(false)
  }, [])

  useEffect(() => {
    void muat()
  }, [muat])

  const jumlah = useMemo(
    () => ({
      semua: tickets.length,
      baru: tickets.filter((t) => t.status === 'baru').length,
      dikerjakan: tickets.filter((t) => t.status === 'dikerjakan').length,
      selesai: tickets.filter((t) => t.status === 'selesai').length,
    }),
    [tickets],
  )

  const kataKunci = cari.trim().toLowerCase()

  const tampil = tickets.filter((t) => {
    const cocokStatus = filterStatus === 'semua' || t.status === filterStatus
    const cocokKategori = filterKategori === 'semua' || t.kategori === filterKategori
    const cocokCari =
      kataKunci === '' ||
      [t.nomor_tiket, t.judul, t.nama_pelapor, t.unit_kerja, t.penjelasan].some((nilai) =>
        nilai.toLowerCase().includes(kataKunci),
      )
    return cocokStatus && cocokKategori && cocokCari
  })

  const daftarStatus: ('semua' | Status)[] = ['semua', ...STATUS]
  const daftarKategori: ('semua' | Kategori)[] = ['semua', 'komputer', 'printer', 'jaringan', 'software']

  return (
    <AdminLayout aktif="tiket" onTiketDibuat={muat}>
      {/* Filter bar */}
      <div className="sticky top-0 z-10 space-y-2.5 border-b border-slate-200/80 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {daftarStatus.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              aria-pressed={filterStatus === status}
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all',
                filterStatus === status
                  ? GAYA_CHIP[status]
                  : 'border border-slate-200 bg-white text-slate-500',
                filterStatus === status && status === 'semua' && 'shadow-sm',
                filterStatus !== status && 'hover:bg-slate-50',
              )}
            >
              {status === 'semua' ? 'Semua' : LABEL_STATUS[status]} (
              <span className="tabular-nums">{jumlah[status]}</span>)
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="shrink-0 text-[11px] font-medium text-slate-400">Kategori:</span>
          <div className="flex flex-wrap items-center gap-1">
            {daftarKategori.map((kategori) => (
              <button
                key={kategori}
                type="button"
                onClick={() => setFilterKategori(kategori)}
                aria-pressed={filterKategori === kategori}
                className={cn(
                  'shrink-0 rounded-lg px-2.5 py-1 text-[11px] whitespace-nowrap transition-all',
                  filterKategori === kategori
                    ? 'bg-indigo-50 font-semibold text-indigo-700'
                    : 'font-medium text-slate-600 hover:bg-slate-100',
                )}
              >
                {kategori === 'semua' ? 'Semua' : LABEL_KATEGORI[kategori]}
              </button>
            ))}
          </div>
        </div>

        {cariTerbuka && (
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              autoFocus
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari nomor tiket, judul, pelapor..."
              aria-label="Cari tiket"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/25 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Pencarian ringkas */}
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[11px] text-slate-400">
          {tampil.length} dari {tickets.length} tiket
        </p>
        <button
          type="button"
          onClick={() => {
            setCariTerbuka((buka) => !buka)
            if (cariTerbuka) setCari('')
          }}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          <Search className="h-3.5 w-3.5" />
          <span>{cariTerbuka ? 'Tutup' : 'Cari'}</span>
        </button>
      </div>

      {/* Daftar tiket */}
      <div className="space-y-3 p-4 pt-2.5">
        {memuat ? (
          <p className="py-12 text-center text-xs text-slate-500">Memuat daftar tiket...</p>
        ) : tampil.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Tidak ada tiket ditemukan</p>
            <p className="mt-1 text-xs text-slate-400">
              Coba ubah filter status atau kategori di atas.
            </p>
          </div>
        ) : (
          tampil.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(`/admin/tiket/${t.id}`)}
              className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all hover:border-indigo-300 active:scale-[0.99]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-md bg-indigo-50/80 px-2 py-0.5 font-mono text-[11px] font-bold text-indigo-700">
                  {t.nomor_tiket}
                </span>
                <StatusBadge status={t.status} />
              </div>

              <h2 className="mb-2.5 line-clamp-2 text-sm leading-snug font-bold text-slate-900">
                {t.judul}
              </h2>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                <span className="truncate">
                  <span className="font-semibold text-slate-700">{t.nama_pelapor}</span> •{' '}
                  {t.unit_kerja}
                </span>
                <KategoriLabel kategori={t.kategori} className="shrink-0 capitalize text-slate-600" />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <PrioritasBadge prioritas={t.prioritas} />
                <span className="text-[10px] text-slate-400">
                  {formatTanggalSingkat(t.created_at)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
