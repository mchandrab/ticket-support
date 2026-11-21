import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/RequireAuth'
import { Toaster } from '@/components/ui/sonner'
import BuatTiket from '@/pages/BuatTiket'
import DaftarTiket from '@/pages/DaftarTiket'
import DetailTiket from '@/pages/DetailTiket'
import Login from '@/pages/Login'

// Grafik KPI (recharts) dimuat hanya saat halaman laporan dibuka.
const LaporanKPI = lazy(() => import('@/pages/LaporanKPI'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuatTiket />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <DaftarTiket />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/tiket/:id"
          element={
            <RequireAuth>
              <DetailTiket />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <RequireAuth>
              <Suspense
                fallback={
                  <div className="flex h-dvh items-center justify-center text-xs text-slate-500">
                    Memuat laporan...
                  </div>
                }
              >
                <LaporanKPI />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-center"
        offset={96}
        richColors
        toastOptions={{ classNames: { toast: 'mx-auto w-full max-w-[360px]' } }}
      />
    </BrowserRouter>
  )
}
