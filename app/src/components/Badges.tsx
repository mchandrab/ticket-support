import {
  AppWindow,
  Monitor,
  Printer,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { LABEL_PRIORITAS, LABEL_STATUS } from '@/lib/constants'
import type { Kategori, Prioritas, Status } from '@/lib/types'
import { cn } from '@/lib/utils'

const WARNA_STATUS: Record<Status, { badge: string; dot: string }> = {
  baru: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  dikerjakan: { badge: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-600' },
  selesai: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-600' },
}

const WARNA_PRIORITAS: Record<Prioritas, string> = {
  rendah: 'bg-slate-100 text-slate-700 border-slate-200',
  sedang: 'bg-amber-100 text-amber-800 border-amber-200',
  tinggi: 'bg-rose-100 text-rose-800 border-rose-200',
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const gaya = WARNA_STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        gaya.badge,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', gaya.dot)} />
      {LABEL_STATUS[status]}
    </span>
  )
}

export function PrioritasBadge({
  prioritas,
  className,
}: {
  prioritas: Prioritas
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold',
        WARNA_PRIORITAS[prioritas],
        className,
      )}
    >
      {LABEL_PRIORITAS[prioritas]}
    </span>
  )
}

export const IKON_KATEGORI: Record<Kategori, LucideIcon> = {
  komputer: Monitor,
  printer: Printer,
  jaringan: Wifi,
  software: AppWindow,
}

export function KategoriLabel({ kategori, className }: { kategori: Kategori; className?: string }) {
  const Ikon = IKON_KATEGORI[kategori]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', className)}>
      <Ikon className="h-3.5 w-3.5 text-slate-400" />
      <span className="capitalize">{kategori}</span>
    </span>
  )
}
