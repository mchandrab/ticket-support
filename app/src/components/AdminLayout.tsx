import { BarChart3, Inbox, LogOut, Plus, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/MobileShell'
import { TicketForm } from '@/components/TicketForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import type { InputTiket } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Props = {
  children: React.ReactNode
  aktif: 'tiket' | 'laporan'
  onTiketDibuat?: () => void
}

export function AdminLayout({ children, aktif, onTiketDibuat }: Props) {
  const navigate = useNavigate()
  const [jumlahBaru, setJumlahBaru] = useState(0)
  const [dialogBuka, setDialogBuka] = useState(false)

  const muatJumlahBaru = useCallback(async () => {
    const { count } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'baru')
    setJumlahBaru(count ?? 0)
  }, [])

  useEffect(() => {
    void muatJumlahBaru()
  }, [muatJumlahBaru])

  async function keluar() {
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  async function buatTiket(nilai: InputTiket) {
    const { data, error } = await supabase.rpc('submit_tiket_publik', {
      p_nama_pelapor: nilai.nama_pelapor,
      p_unit_kerja: nilai.unit_kerja,
      p_kategori: nilai.kategori,
      p_judul: nilai.judul,
      p_penjelasan: nilai.penjelasan,
      p_prioritas: nilai.prioritas,
    })

    if (error || !data) {
      toast.error('Gagal membuat tiket. Periksa koneksi internet lalu coba lagi.')
      return false
    }

    toast.success(`Tiket ${String(data)} berhasil dibuat.`)
    setDialogBuka(false)
    void muatJumlahBaru()
    onTiketDibuat?.()
    return true
  }

  return (
    <MobileShell>
      <header className="shrink-0 bg-slate-900 px-5 pt-4 pb-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/20 text-sm font-bold text-indigo-300">
              CH
            </div>
            <div className="min-w-0">
              <p className="text-[11px] leading-tight text-slate-400">Koperasi Kredit Rukun</p>
              <h1 className="flex items-center gap-1.5 text-sm font-bold text-white">
                <span className="truncate">Halo, Chandra</span>
                <span className="shrink-0 rounded bg-indigo-500/25 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                  Kasi IT
                </span>
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDialogBuka(true)}
              title="Catat Tiket dari WA/Telepon"
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tiket</span>
            </button>
            <button
              type="button"
              onClick={keluar}
              title="Keluar"
              aria-label="Keluar"
              className="rounded-xl bg-slate-800 p-2 text-slate-300 transition-all hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">{children}</main>

      <nav className="z-20 flex shrink-0 items-center justify-around border-t border-slate-200/90 bg-white px-4 py-2">
        <Link
          to="/admin"
          className={cn(
            'flex flex-col items-center justify-center rounded-xl px-4 py-1 text-[10px] transition-all',
            aktif === 'tiket' ? 'font-semibold text-indigo-600' : 'font-medium text-slate-400',
          )}
        >
          <span className="relative">
            <Inbox className="h-5 w-5" />
            {jumlahBaru > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {jumlahBaru}
              </span>
            )}
          </span>
          <span className="mt-1">Daftar Tiket</span>
        </Link>
        <Link
          to="/admin/laporan"
          className={cn(
            'flex flex-col items-center justify-center rounded-xl px-4 py-1 text-[10px] transition-all',
            aktif === 'laporan' ? 'font-semibold text-indigo-600' : 'font-medium text-slate-400',
          )}
        >
          <BarChart3 className="h-5 w-5" />
          <span className="mt-1">Laporan KPI</span>
        </Link>
        <Link
          to="/"
          className="flex flex-col items-center justify-center rounded-xl px-4 py-1 text-[10px] font-medium text-slate-400 transition-all"
        >
          <ShieldCheck className="h-5 w-5" />
          <span className="mt-1">Form Publik</span>
        </Link>
      </nav>

      <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-[420px]">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
            <DialogTitle className="text-sm font-bold text-slate-900">
              Catat Tiket Manual
            </DialogTitle>
            <DialogDescription className="text-[11px] text-slate-500">
              Untuk laporan yang masuk lewat WhatsApp atau telepon.
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-4">
            <TicketForm
              onKirim={buatTiket}
              labelTombol="Simpan Tiket ke Antrean"
              onBatal={() => setDialogBuka(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </MobileShell>
  )
}
