import { CheckCircle2, Clock, Timer, Ticket as TicketIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { AdminLayout } from '@/components/AdminLayout'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { KATEGORI, LABEL_KATEGORI } from '@/lib/constants'
import { formatLamaRingkas, kunciBulan, labelBulan, labelBulanPendek } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import type { Ticket } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const configBulan: ChartConfig = {
  jumlah: { label: 'Jumlah tiket', color: 'var(--chart-1)' },
}

const configKategori: ChartConfig = {
  komputer: { label: LABEL_KATEGORI.komputer, color: 'var(--chart-1)' },
  printer: { label: LABEL_KATEGORI.printer, color: 'var(--chart-2)' },
  jaringan: { label: LABEL_KATEGORI.jaringan, color: 'var(--chart-3)' },
  software: { label: LABEL_KATEGORI.software, color: 'var(--chart-4)' },
}

function KartuMetrik({
  judul,
  keterangan,
  ikon,
  nilai,
  testId,
  aksen,
  warnaNilai,
  tambahan,
}: {
  judul: string
  keterangan: string
  ikon: React.ReactNode
  nilai: string
  testId: string
  aksen: string
  warnaNilai?: string
  tambahan?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{judul}</span>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', aksen)}>
          {ikon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-extrabold tabular-nums',
            nilai.length > 8 ? 'text-lg' : 'text-2xl',
            warnaNilai ?? 'text-slate-900',
          )}
          data-testid={testId}
        >
          {nilai}
        </span>
        {tambahan && (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-600">
            {tambahan}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[10px] text-slate-400">{keterangan}</p>
    </div>
  )
}

export default function LaporanKPI() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [memuat, setMemuat] = useState(true)
  const [bulan, setBulan] = useState(kunciBulan(new Date()))

  useEffect(() => {
    supabase
      .from('tickets')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          toast.error('Gagal memuat data laporan. Periksa koneksi internet.')
        } else {
          setTickets((data as Ticket[]) ?? [])
        }
        setMemuat(false)
      })
  }, [])

  const pilihanBulan = useMemo(() => {
    const set = new Set(tickets.map((t) => kunciBulan(t.created_at)))
    set.add(kunciBulan(new Date()))
    return [...set].sort().reverse()
  }, [tickets])

  const dataBulanIni = useMemo(
    () => tickets.filter((t) => kunciBulan(t.created_at) === bulan),
    [tickets, bulan],
  )

  const total = dataBulanIni.length
  const selesai = dataBulanIni.filter((t) => t.status === 'selesai')
  const belum = total - selesai.length
  const persenSelesai = total === 0 ? 0 : Math.round((selesai.length / total) * 100)
  const rataLama =
    selesai.length === 0
      ? 0
      : selesai.reduce(
          (jumlah, t) =>
            jumlah +
            (new Date(t.selesai_at!).getTime() - new Date(t.created_at).getTime()) / 3_600_000,
          0,
        ) / selesai.length

  const dataKategori = KATEGORI.map((k) => ({
    kategori: k,
    jumlah: dataBulanIni.filter((t) => t.kategori === k).length,
  })).filter((d) => d.jumlah > 0)

  const dataEnamBulan = useMemo(() => {
    const sekarang = new Date()
    const daftar: { kunci: string; bulan: string; jumlah: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(sekarang.getFullYear(), sekarang.getMonth() - i, 1)
      const kunci = kunciBulan(d)
      daftar.push({
        kunci,
        bulan: labelBulanPendek(kunci),
        jumlah: tickets.filter((t) => kunciBulan(t.created_at) === kunci).length,
      })
    }
    return daftar
  }, [tickets])

  const kategoriTerbanyak =
    dataKategori.length === 0
      ? '-'
      : LABEL_KATEGORI[
          dataKategori.reduce((a, b) => (b.jumlah > a.jumlah ? b : a))
            .kategori as keyof typeof LABEL_KATEGORI
        ]

  return (
    <AdminLayout aktif="laporan">
      <div className="space-y-4 p-4">
        {/* Header periode */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900">Rekap KPI Bulanan</h1>
            <p className="text-[11px] text-slate-500">Terhitung otomatis dari data tiket</p>
          </div>
          <div className="relative shrink-0">
            <label htmlFor="pilih-bulan" className="sr-only">
              Pilih bulan laporan
            </label>
            <select
              id="pilih-bulan"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              {pilihanBulan.map((b) => (
                <option key={b} value={b}>
                  {labelBulan(b)}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {memuat ? (
          <p className="py-12 text-center text-xs text-slate-500">Memuat laporan...</p>
        ) : (
          <>
            {/* 4 kartu metrik */}
            <div className="grid grid-cols-2 gap-3">
              <KartuMetrik
                judul="Total Tiket"
                keterangan="Laporan masuk bulan ini"
                ikon={<TicketIcon className="h-4 w-4" />}
                nilai={String(total)}
                testId="kpi-total"
                aksen="bg-indigo-50 text-indigo-600"
              />
              <KartuMetrik
                judul="Selesai"
                keterangan="Tuntas tertangani"
                ikon={<CheckCircle2 className="h-4 w-4" />}
                nilai={String(selesai.length)}
                testId="kpi-selesai"
                aksen="bg-emerald-50 text-emerald-600"
                warnaNilai="text-emerald-600"
                tambahan={`${persenSelesai}%`}
              />
              <KartuMetrik
                judul="Belum Selesai"
                keterangan="Baru & dikerjakan"
                ikon={<Clock className="h-4 w-4" />}
                nilai={String(belum)}
                testId="kpi-belum"
                aksen="bg-amber-50 text-amber-600"
                warnaNilai="text-amber-600"
              />
              <KartuMetrik
                judul="Rata-rata Selesai"
                keterangan="Dari lapor hingga beres"
                ikon={<Timer className="h-4 w-4" />}
                nilai={selesai.length === 0 ? '-' : formatLamaRingkas(Math.round(rataLama * 10) / 10)}
                testId="kpi-rata"
                aksen="bg-blue-50 text-blue-600"
              />
            </div>

            {/* Grafik tren 6 bulan */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Tren Tiket 6 Bulan Terakhir</h2>
                  <p className="text-[10px] text-slate-400">
                    {dataEnamBulan[0].bulan} – {dataEnamBulan[dataEnamBulan.length - 1].bulan}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                  Bulanan
                </span>
              </div>
              <ChartContainer config={configBulan} className="aspect-auto h-44 w-full">
                <BarChart data={dataEnamBulan} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="bulan" tickLine={false} axisLine={false} tickMargin={6} fontSize={10} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="jumlah"
                    fill="var(--color-jumlah)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Donut kategori */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-800">Kategori Masalah Terbanyak</h2>
                  <p className="text-[10px] text-slate-400">Proporsi kendala unit kerja</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  {kategoriTerbanyak}
                </span>
              </div>

              {dataKategori.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Belum ada tiket pada bulan ini.
                </p>
              ) : (
                <div className="flex items-center gap-4">
                  <ChartContainer
                    config={configKategori}
                    className="aspect-auto h-32 w-32 shrink-0"
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="kategori" />} />
                      <Pie
                        data={dataKategori}
                        dataKey="jumlah"
                        nameKey="kategori"
                        innerRadius="58%"
                        outerRadius="92%"
                        isAnimationActive={false}
                      >
                        {dataKategori.map((d) => (
                          <Cell key={d.kategori} fill={`var(--color-${d.kategori})`} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>

                  <div className="flex-1 space-y-2 text-xs">
                    {dataKategori.map((d) => (
                      <div key={d.kategori} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ background: `var(--color-${d.kategori})` }}
                          />
                          <span className="truncate text-slate-600">
                            {LABEL_KATEGORI[d.kategori]}
                          </span>
                        </span>
                        <span className="shrink-0 text-[11px] font-semibold text-slate-400 tabular-nums">
                          {Math.round((d.jumlah / total) * 100)}%
                        </span>
                        <span className="w-5 shrink-0 text-right font-semibold text-slate-800 tabular-nums">
                          {d.jumlah}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
