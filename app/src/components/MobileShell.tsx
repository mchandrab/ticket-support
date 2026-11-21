type Props = {
  children: React.ReactNode
  /** Latar belakang di luar kolom aplikasi (hanya terlihat di layar lebar). */
  latar?: 'terang' | 'gelap'
}

/**
 * Kerangka tampilan: aplikasi selalu memakai layout mobile (kolom maks 480px).
 * Di layar lebar kolom ditengahkan dengan bayangan supaya terasa seperti aplikasi HP.
 */
export function MobileShell({ children, latar = 'terang' }: Props) {
  return (
    <div
      className={
        latar === 'gelap'
          ? 'flex h-dvh justify-center bg-slate-900 sm:items-center sm:py-4'
          : 'flex h-dvh justify-center bg-slate-200/70 sm:items-center sm:py-4'
      }
    >
      <div className="flex h-full w-full max-w-[480px] flex-col overflow-hidden bg-slate-50 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px] sm:ring-1 sm:ring-slate-300/50">
        {children}
      </div>
    </div>
  )
}
