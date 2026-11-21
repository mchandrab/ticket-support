-- Tutup jalur INSERT langsung oleh anon.
-- Pembuatan tiket hanya lewat RPC submit_tiket_publik (SECURITY DEFINER),
-- yang sudah dipakai kedua jalur buat tiket di frontend (form publik +
-- dialog admin). Policy insert anon yang lama (WITH CHECK true) membiarkan
-- siapa pun membuat tiket dengan status/tanggal sembarang lewat REST,
-- sehingga KPI bisa dikotori.
-- Jalankan di project Supabase live via SQL Editor, atau `supabase db push`.

drop policy if exists "publik bisa buat tiket" on public.tickets;
revoke insert on public.tickets from anon;
