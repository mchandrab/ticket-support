import { AlertCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileShell } from '@/components/MobileShell'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const [pesanSalah, setPesanSalah] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const tujuan = (location.state as { from?: string } | null)?.from ?? '/admin'

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(tujuan, { replace: true })
    })
  }, [navigate, tujuan])

  async function masuk(e: React.FormEvent) {
    e.preventDefault()
    setPesanSalah('')

    if (!email.trim() || !password) {
      setPesanSalah('Email dan password wajib diisi.')
      return
    }

    setMengirim(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setMengirim(false)

    if (error) {
      setPesanSalah('Email atau password salah.')
      return
    }

    toast.success('Berhasil masuk')
    navigate(tujuan, { replace: true })
  }

  return (
    <MobileShell latar="gelap">
      <div className="flex h-full flex-col justify-center bg-slate-50 px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Login Admin IT</h1>
          <p className="mt-1 mb-5 text-xs text-slate-500">
            Masuk menggunakan akun Supabase Auth Koperasi Kredit Rukun.
          </p>

          <form onSubmit={masuk} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@koperasikreditrukun.com"
                aria-invalid={!!pesanSalah}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!pesanSalah}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
              />
            </div>

            {pesanSalah && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{pesanSalah}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={mengirim}
              className={cn(
                'mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-[0.99]',
                mengirim && 'opacity-60',
              )}
            >
              {mengirim ? 'Memeriksa...' : 'Masuk ke Konsol IT'}
            </button>
          </form>
        </div>

        <Link
          to="/"
          className="mt-6 text-center text-[11px] font-semibold text-slate-400 transition-colors hover:text-indigo-600"
        >
          ← Kembali ke Form Lapor Masalah
        </Link>
      </div>
    </MobileShell>
  )
}
