-- Migration awal Aplikasi Tiketing IT Support (Koperasi Kredit Rukun)
-- Sesuai DATABASE_SCHEMA.md v1.1. Dijalankan sekali pada project baru.

-- 1. Tabel tickets
create table if not exists public.tickets (
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

create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_created_at_idx on public.tickets (created_at desc);
create index if not exists tickets_kategori_idx on public.tickets (kategori);

-- 2. Nomor tiket otomatis TKT-YYYYMM-####
create sequence if not exists public.ticket_seq;

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

drop trigger if exists trg_nomor_tiket on public.tickets;
create trigger trg_nomor_tiket
  before insert on public.tickets
  for each row execute function public.buat_nomor_tiket();

-- 3. Row Level Security
alter table public.tickets enable row level security;

drop policy if exists "publik bisa buat tiket" on public.tickets;
create policy "publik bisa buat tiket"
  on public.tickets for insert
  to anon
  with check (true);

drop policy if exists "admin bisa baca tiket" on public.tickets;
create policy "admin bisa baca tiket"
  on public.tickets for select
  to authenticated
  using (true);

drop policy if exists "admin bisa ubah tiket" on public.tickets;
create policy "admin bisa ubah tiket"
  on public.tickets for update
  to authenticated
  using (true)
  with check (true);

-- DELETE tidak dibuka untuk siapa pun di v1.

-- 4. RPC form publik
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

grant execute on function public.submit_tiket_publik(text, text, text, text, text, text) to anon, authenticated;

-- Izin sequence untuk trigger saat insert lewat jalur anon langsung
grant usage on sequence public.ticket_seq to anon, authenticated;
