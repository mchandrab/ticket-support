/** Ikon garis geometris Jembatan Ampera (dari desain Frost KoperasiCare). */
export function AmperaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="2" y1="17" x2="22" y2="17" />
      <path d="M7.5 17V6.5L9 5v12" />
      <path d="M16.5 17V6.5L15 5v12" />
      <line x1="9" y1="8.5" x2="15" y2="8.5" />
      <path d="M2.5 14.5C4.5 12.5 6 11.5 7.5 11.5" />
      <path d="M21.5 14.5C19.5 12.5 18 11.5 16.5 11.5" />
    </svg>
  )
}
