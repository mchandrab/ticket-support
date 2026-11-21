export type FrostTema = 'light' | 'dark'

type Props = {
  children: React.ReactNode
  tema: FrostTema
}

/**
 * Kerangka Frost untuk halaman publik: kolom 420px di kanvas mist
 * dengan orba cahaya halus di balik kaca. Di layar lebar tampil
 * sebagai bingkai HP; di HP memenuhi layar.
 */
export function FrostShell({ children, tema }: Props) {
  return (
    <div className="flex min-h-dvh justify-center bg-[#E2E6EC] sm:items-center sm:py-4">
      <div
        data-frost-theme={tema}
        style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
        className="frost-root relative flex h-dvh w-full max-w-[420px] flex-col overflow-hidden transition-colors duration-300 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[36px] sm:border-[6px] sm:border-slate-900 sm:shadow-2xl"
      >
        <div className="ambient-orb-1 pointer-events-none absolute -top-20 -right-16 z-0 h-72 w-72 rounded-full blur-2xl" />
        <div className="ambient-orb-2 pointer-events-none absolute top-1/2 -left-24 z-0 h-80 w-80 rounded-full blur-2xl" />
        <div className="ambient-orb-1 pointer-events-none absolute -right-4 -bottom-24 z-0 h-72 w-72 rounded-full blur-2xl" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
