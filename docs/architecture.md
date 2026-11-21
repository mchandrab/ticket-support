# Arsitektur — Aplikasi Tiketing IT Support

Versi 1.1 — 21 November 2026

## 1. Gambaran

```
[Karyawan] --form publik--> [React + Vite] --Supabase RPC--> [Supabase]
[Chandra]  --login admin--> [React + Vite] --Supabase JS---> [Supabase]
                                                             Postgres + Auth
                                                             + RLS policies
```

Tidak ada server backend tulisan sendiri. Semua logika data ada di
Supabase: tabel PostgreSQL + Row Level Security (RLS) + fungsi RPC + Auth.
Frontend React memanggil Supabase langsung lewat `@supabase/supabase-js`.

## 2. Frontend — React + Vite

- **React 19 + Vite** (template `react-ts`), **TypeScript**.
- **Tailwind CSS v4** untuk styling.
- Komponen UI dari **beUI** (registry shadcn: `@beui/...`), dipasang
  per komponen sesuai kebutuhan (tabel, dialog, badge, form, toast).
- Grafik KPI dari **Shadcn Charts** (`chart`, berbasis Recharts).
- Routing: `react-router-dom` (atau state-based routing bila lebih
  sederhana — keputusan builder, catat di sini bila berubah).

### Halaman

| Rute | Siapa | Isi |
|---|---|---|
| `/` | Publik (tanpa login) | Form buat tiket + halaman sukses berisi nomor tiket |
| `/admin` | Chandra (login) | Daftar tiket + filter status/kategori |
| `/admin/tiket/:id` | Chandra (login) | Detail tiket, ubah status, isi tindakan, tandai selesai |
| `/admin/laporan` | Chandra (login) | Laporan KPI: 4 metrik + grafik |
| `/admin/login` | Chandra | Form login email + password |

### Struktur folder (saran)

```
src/
  lib/supabase.ts        # client Supabase (URL + anon key dari env)
  pages/
    BuatTiket.tsx        # form publik
    Login.tsx
    DaftarTiket.tsx
    DetailTiket.tsx
    LaporanKPI.tsx
  components/
    TicketTable.tsx
    StatusBadge.tsx
    ...                  # komponen beUI hasil install masuk ke components/ui/
  App.tsx
```

## 3. Backend — Supabase (Cloud)

- **Keputusan default (pilihan Muse, bisa diubah Chandra):**
  Supabase Cloud paket gratis. Satu project untuk aplikasi ini.
- **PostgreSQL**: satu tabel utama `tickets` dan satu fungsi RPC
  `submit_tiket_publik` (lihat `DATABASE_SCHEMA.md`).
- **Auth**: email + password, satu akun admin (Chandra). Akun dibuat
  manual di dashboard Supabase (Authentication → Users). Tidak ada
  registrasi publik.
- **Row Level Security (RLS)**: aktif di tabel `tickets`.
  - `anon` (pengunjung tanpa login): hanya boleh `INSERT` (mengirim form)
    dan memanggil RPC `submit_tiket_publik`. Tidak bisa baca/ubah/hapus
    isi tabel `tickets`.
  - `authenticated` (Chandra login): boleh `SELECT` + `UPDATE`
    semua tiket. `DELETE` tidak dibuka di v1.
- **Storage**: tidak dipakai di v1 (tanpa lampiran foto).

## 4. Konfigurasi & secret

File `.env.local` di root proyek (JANGAN di-commit):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

- Yang dipakai di frontend HANYA `anon key` (publishable).
- `service_role key` TIDAK PERNAH masuk kode/frontend/repo — kunci
  itu melewati RLS dan hanya dipakai dari dashboard Supabase bila
  perlu.
- `.env.local` wajib ada di `.gitignore`.

## 5. Alur data

1. Pelapor isi form → frontend memanggil `supabase.rpc('submit_tiket_publik', ...)`
   dengan peran `anon` → fungsi mengeksekusi insert dengan aman dan
   mengembalikan `nomor_tiket` (`TKT-YYYYMM-####`) tanpa membuka izin `SELECT`
   tabel → halaman sukses menampilkan nomor tiket. *(Catatan: jangan gunakan
   `.insert().select()` dari klien publik karena akan ditolak oleh RLS).*
2. Chandra login → Supabase Auth → peran `authenticated` →
   daftar tiket terbaca via `supabase.from('tickets').select(...)`.
3. Chandra ubah status / isi tindakan → `update` → RLS
   mengizinkan karena authenticated.
4. Laporan KPI: agregasi dari tabel `tickets` (query langsung
   dengan filter tanggal; data kecil, tanpa tabel agregat).

## 6. Keamanan (ringkas — detail di AGENTS.md + VibeSec)

- RLS aktif dan dites: anon tidak bisa SELECT tabel `tickets`.
- Validasi input di form (wajib isi: nama, unit, kategori, judul,
  penjelasan) + constraint di database.
- Tidak ada secret di kode, log, atau repo.
- Login admin memakai throttle bawaan Supabase Auth; jangan
  menonaktifkannya.

## 7. Pengembangan & hosting

- Pengembangan lokal: `npm run dev` (Vite).
- Hosting frontend (diputuskan belakangan, bukan v1): Vercel atau
  Netlify — keduanya gratis untuk pemakaian ini dan tinggal
  sambung ke repo + isi env var.
- Supabase Cloud sudah termasuk hosting database + auth.