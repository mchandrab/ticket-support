# AGENTS.md — Instruksi Permanen untuk AI Agent (Tiketing IT Support)

Versi 1.1 — 21 November 2026

Dokumen ini adalah aturan main yang wajib diikuti oleh AI agent
yang mengerjakan aplikasi tiketing IT Support Koperasi Kredit
Rukun. Berlaku untuk setiap sesi, setiap modul, setiap perubahan
kode. Jangan menyimpang tanpa instruksi eksplisit dari Chandra.

## 1. Bahasa & Komunikasi

- Selalu berkomunikasi dalam **Bahasa Indonesia santai**.
- Jelaskan hal teknis dengan **bahasa sederhana, tanpa jargon**.
- Laporan progress singkat dan konkret: apa yang selesai, apa
  yang belum, apa yang butuh keputusan Chandra.

## 2. Keputusan yang mengikat

- Keputusan Chandra pada 16 & 21 November 2026 bersifat
  mengikat dan menjadi dasar PRD + dokumen proyek ini. Jangan
  mengubahnya diam-diam; kalau ragu, tanya dulu.
- **Stack: React + Vite + TypeScript, Supabase (PostgreSQL +
  Auth + RLS), Tailwind CSS v4, komponen beUI, grafik Shadcn
  Charts.** Jangan mengusulkan ganti stack tanpa diminta.
- **Jangan gaspol tanpa konfirmasi untuk keputusan arsitektur**
  (ganti library, ubah skema database, ubah aturan status tiket,
  ubah aturan RLS). Klarifikasi dulu, baru kerjakan.
- Kalau perintah Chandra ambigu dan ada dua penafsiran yang
  masuk akal, tanya dulu. Jangan menebak.

## 3. Aturan Coding

- Wajib mengikuti dokumen proyek ini: `PRD.md` (kebutuhan),
  `ARCHITECTURE.md` (struktur), `DATABASE_SCHEMA.md` (skema),
  `DESIGN_SYSTEM.md` (tampilan). Kalau ada konflik antar
  dokumen, tanya Chandra sebelum memutuskan.
- **Kode minimal (Ponytail aktif):** tulis hanya yang dibutuhkan.
  Pakai komponen beUI / fitur bawaan sebelum menulis komponen
  sendiri. Jangan over-build.
- **Keamanan (VibeSec aktif):** ikuti checklist keamanan saat
  menulis kode — validasi input, jangan percaya data dari client,
  jangan bocorkan secret.
- Semua label, pesan error, pesan sukses, dan teks di antarmuka
  pakai **Bahasa Indonesia**.
- Kode dalam Bahasa Inggris (nama file, variabel, fungsi).
- Satu modul harus selesai 100% (kode + tes hijau + review
  Chandra) baru pindah ke modul berikutnya.

## 4. Aturan Keamanan (tidak bisa ditawar)

- **RLS WAJIB aktif** di tabel `tickets`. Jangan pernah
  menonaktifkannya, bahkan sementara "biar cepat jalan".
- **Anon key saja yang dipakai di frontend.** `service_role key`
  DILARANG masuk kode, `.env`, log, atau repo.
- **Jangan pernah commit file `.env*`** atau secret apa pun.
  `.env.local` wajib ada di `.gitignore`.
- Validasi input di form DAN constraint di database. Jangan
  mematikan validasi demi "biar cepat jalan".
- Login admin memakai Supabase Auth. Jangan membuat sistem
  login sendiri.
- Pengunjung tanpa login HANYA boleh membuat tiket lewat RPC
  `submit_tiket_publik` (atau `INSERT` tanpa `SELECT`). Bila ada
  celah yang membuat mereka bisa membaca tiket orang lain,
  itu bug kritis — laporkan ke Chandra, jangan ditutup-tutupi.

## 5. Aturan Test

- Alur utama WAJIB dites end-to-end dengan Playwright:
  buat tiket (publik) → muncul di daftar admin → ubah status →
  tandai selesai → angka KPI berubah.
- Tes RLS: anon tidak bisa SELECT tabel `tickets` (harus gagal/kosong),
  tetapi bisa memanggil RPC `submit_tiket_publik` dan mendapat nomor tiket;
  authenticated bisa SELECT + UPDATE.
- **Jalankan tes sampai hijau sebelum lapor selesai.**
  Jangan lapor "sudah selesai" dengan tes merah.
- Jangan menghapus atau melemahkan tes supaya hijau. Kalau tes
  gagal karena aturan bisnis berubah, konfirmasi ke Chandra dulu.

## 6. Aturan Git

- **JANGAN push ke GitHub tanpa izin eksplisit dari Chandra.**
  Commit lokal boleh, push tidak.
- Commit message dalam **Bahasa Indonesia yang jelas**.
- Satu commit untuk satu perubahan yang logis.
- Sebelum commit, pastikan: tes hijau, tidak ada file sampah,
  tidak ada kredensial yang ikut ter-commit.

## 7. Lingkungan Pengembangan

- Pengembangan berjalan di **PC Chandra: Windows + Node.js**,
  agent lokal (OpenCode) yang menjalankan perintah di sana;
  agent di sesi ini tidak bisa menjalankan perintah di PC
  Chandra secara langsung.
- Setiap langkah pengerjaan lokal dibuat **copy-safe**: perintah
  ditulis persis untuk disalin-tempel, satu langkah dalam satu
  waktu, dan sebutkan tanda keberhasilan yang harus terlihat
  sebelum lanjut.
- Chandra menyalin perintah persis apa adanya — jangan menulis
  placeholder tanpa penjelasan yang jelas mana bagian yang harus
  diganti.
- Laporkan hasil tes dan error **apa adanya**. Kalau gagal,
  sampaikan pesan errornya dan usulan langkah berikutnya; jangan
  mengklaim berhasil sebelum ada buktinya.

## 8. Aturan Destruktif & Alur Kerja

- **Konfirmasi ke Chandra dulu sebelum menghapus file, menghapus
  data, atau mengubah skema database yang sudah berisi data.**
- Pilih pendekatan non-destruktif: nonaktifkan daripada menghapus.

Ikuti urutan ini untuk setiap modul, tanpa lompat:

1. **Bangun** — tulis kode + tes mengikuti dokumen desain.
2. **Tes hijau** — jalankan tes sampai hijau.
3. **Lapor ringkas ke Chandra** — apa yang dibangun, apa yang bisa
   dicoba.
4. **Tunggu review Chandra** — jangan lanjut ke modul berikutnya
   sebelum Chandra memberi lampu hijau atau feedback.
5. **Iterasi** — perbaiki berdasarkan feedback, tes lagi sampai
   hijau, lapor lagi.