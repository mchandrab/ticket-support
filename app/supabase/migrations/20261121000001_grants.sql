-- Hak akses tabel untuk role Supabase.
-- Tanpa ini, RLS tidak pernah tercapai karena Postgres menolak lebih dulu
-- (error 42501: permission denied for table tickets).

-- Admin (login): baca + ubah tiket. DELETE tidak dibuka di v1.
grant select, insert, update on public.tickets to authenticated;

-- Pengunjung tanpa login: hanya boleh menambah tiket.
-- SELECT sengaja TIDAK diberikan agar tidak bisa membaca tiket orang lain.
grant insert on public.tickets to anon;

-- Sequence untuk trigger nomor tiket.
grant usage, select on sequence public.ticket_seq to anon, authenticated;

-- TRUNCATE bisa menembus RLS, jadi dicabut dari role aplikasi.
revoke truncate, references, trigger on public.tickets from anon, authenticated;
