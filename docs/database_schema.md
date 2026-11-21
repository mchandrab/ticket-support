# Skema Database — Aplikasi Tiketing IT Support

Versi 1.1 — 21 November 2026
Dijalankan di Supabase SQL Editor (satu kali saat setup project).

## 1. Tabel `tickets`

```sql
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  nomor_tiket text not null unique,
  created_at timestamptz not null default now(),
  nama_pelapor text not null,
  unit_kerja text not null
    check (unit_kerja in ('IT', 'Keuangan', 'SDM', 'Operasional', 'Bag. Umum', 'Logistik')),
  kategori text not null
    check (kategori in ('komputer', 'printer', 'jaringan', 'software')),
  judul text not null,
  penjelasan text not null,
  prioritas text not null default 'sedang'
    check (prioritas in ('rendah', 'sedang', 'tinggi')),
  status text not null default 'baru'
    check (status in ('baru', 'dikerjakan', 'selesai')),
  tindakan text,
  selesai_at timestamptz,
  -- selesai_at wajib terisi bila status selesai, dan sebaliknya
  check ((status = 'selesai') = (selesai_at is not null))
);

create index tickets_status_idx on public.tickets (status);
create index tickets_created_at_idx on public.tickets (created_at desc);
create index tickets_kategori_idx on public.tickets (kategori);
```

Catatan:

- `nomor_tiket` diisi otomatis oleh trigger (bagian 2). Frontend
  tidak mengisinya.
- `selesai_at` diisi aplikasi saat status diubah ke `selesai`
  (bersamaan dengan `tindakan`). Constraint di atas menjaga
  konsistensinya di sisi database.
- Status tidak bisa mundur dari `selesai`: ditegakkan di aplikasi
  (tombol ubah status disembunyikan untuk tiket selesai). Bila
  perlu penegakan di database, tambahkan trigger di iterasi
  berikutnya.

## 2. Nomor tiket otomatis (`TKT-YYYYMM-####`)

Satu sequence global + fungsi pembentuk nomor:

```sql
create sequence public.ticket_seq;

create or replace function public.buat_nomor_tiket()
returns trigger as $$
begin
  new.nomor_tiket := 'TKT-'
    || to_char(now(), 'YYYYMM')
    || '-'
    || lpad(nextval('public.ticket_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger trg_nomor_tiket
  before insert on public.tickets
  for each row execute function public.buat_nomor_tiket();
```

Contoh hasil: `TKT-202611-0007`. Urutan angka tidak reset tiap
bulan (sequence global) — cukup untuk skala pemakaian ini.

## 3. Row Level Security (RLS) & Fungsi Insert Publik (RPC)

```sql
alter table public.tickets enable row level security;

-- Pengunjung tanpa login: HANYA boleh membuat tiket (insert).
-- Tidak diberi izin SELECT agar tidak bisa membaca tiket orang lain.
create policy "publik bisa buat tiket"
  on public.tickets for insert
  to anon
  with check (true);

-- Admin login: boleh baca semua tiket.
create policy "admin bisa baca tiket"
  on public.tickets for select
  to authenticated
  using (true);

-- Admin login: boleh ubah tiket (status, tindakan).
create policy "admin bisa ubah tiket"
  on public.tickets for update
  to authenticated
  using (true)
  with check (true);

-- DELETE tidak dibuka untuk siapa pun di v1.
```

### Fungsi RPC untuk Form Publik (`submit_tiket_publik`)

Karena peran `anon` tidak memiliki izin `SELECT` pada tabel `tickets`,
pemanggilan `.insert().select()` langsung dari frontend akan ditolak RLS.
Gunakan fungsi RPC berikut agar pelapor tetap mendapatkan `nomor_tiket`
tanpa membuka akses baca ke tabel:

```sql
create or replace function public.submit_tiket_publik(
  p_nama_pelapor text,
  p_unit_kerja text,
  p_kategori text,
  p_judul text,
  p_penjelasan text,
  p_prioritas text default 'sedang'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nomor_tiket text;
begin
  insert into public.tickets (
    nama_pelapor,
    unit_kerja,
    kategori,
    judul,
    penjelasan,
    prioritas
  ) values (
    trim(p_nama_pelapor),
    p_unit_kerja,
    p_kategori,
    trim(p_judul),
    trim(p_penjelasan),
    coalesce(p_prioritas, 'sedang')
  )
  returning nomor_tiket into v_nomor_tiket;

  return v_nomor_tiket;
end;
$$;

-- Beri izin eksekusi fungsi ke pengunjung publik (anon) dan admin (authenticated)
grant execute on function public.submit_tiket_publik(text, text, text, text, text, text) to anon, authenticated;
```

Tes wajib setelah setup (di SQL Editor / dari aplikasi):

1. Tanpa login (`anon`): `select * from public.tickets` ditolak (kosong/error).
2. Tanpa login (`anon`): memanggil `supabase.rpc('submit_tiket_publik', ...)` berhasil dan mengembalikan string `TKT-YYYYMM-####`.
3. Setelah login sebagai admin (`authenticated`): `select` + `update` berhasil.

## 4. Akun admin

- Dibuat manual di dashboard Supabase → Authentication → Users →
  Add user (email + password Chandra).
- Tidak ada registrasi publik. Satu akun admin cukup untuk v1.

## 5. Laporan KPI (query)

Agregasi langsung dari `tickets` (data kecil, tanpa tabel agregat):

- Tiket per bulan: `count(*) ... where date_trunc('month', created_at) = ...`
- Selesai vs belum: `count(*) filter (where status = 'selesai')`
  vs total.
- Rata-rata lama penyelesaian: `avg(selesai_at - created_at)`
  untuk tiket `status = 'selesai'`.
- Kategori terbanyak: `group by kategori order by count(*) desc`.