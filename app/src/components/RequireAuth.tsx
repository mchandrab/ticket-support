import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type Props = { children: React.ReactNode }

export function RequireAuth({ children }: Props) {
  const [status, setStatus] = useState<'memuat' | 'masuk' | 'keluar'>('memuat')
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'masuk' : 'keluar')
    })
    const { data: langganan } = supabase.auth.onAuthStateChange((_peristiwa, sesi) => {
      setStatus(sesi ? 'masuk' : 'keluar')
    })
    return () => langganan.subscription.unsubscribe()
  }, [])

  if (status === 'memuat') {
    return (
      <div className="flex h-dvh items-center justify-center text-xs text-slate-500">Memuat...</div>
    )
  }

  if (status === 'keluar') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
