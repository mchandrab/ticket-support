# PRD — Aplikasi Tiketing IT Support (Koperasi Kredit Rukun)

Versi 1.0 — 21 November 2026
Status: Disetujui Chandra untuk dibangun (full vibecode).

## 1. Masalah

Laporan masalah IT dari karyawan masuk lewat WhatsApp langsung ke Chandra
(Kasi IT), lalu tenggelam karena kesibukan. Padahal KPI Chandra dinilai
dari laporan kerja itu. Akibatnya: ada laporan yang tidak tertangani,
tidak ada catatan apa yang sudah dikerjakan, dan rekap KPI harus
disusun manual dari ingatan/chat.

## 2. Tujuan

Satu tempat untuk mencatat semua laporan IT jadi tiket yang terlacak
sampai selesai, dengan laporan KPI yang terhitung otomatis.

Sukses = semua laporan masuk tercatat, tidak ada yang hilang, dan
rekap KPI bulanan bisa dilihat dalam satu klik.

## 3. Pengguna

| Pengguna | Peran |
|---|---|
| Karyawan (pelapor) | Membuat tiket laporan masalah IT. Tidak punya akun, isi form saja. |
| Chandra (admin IT) | Melihat semua tiket, mengerjakan, menandai selesai, melihat laporan KPI. Satu-satunya yang login. |

Tidak ada data anggota koperasi di aplikasi ini — hanya data karyawan
pelapor dan masalah IT.

## 4. Fitur versi 1

### F1. Buat tiket (dua cara)
1. **Pelapor** mengisi form publik tanpa login.
2. **Chandra** membukakan tiket dari konsol admin (untuk laporan yang
   masuk lewat WA/telepon).

### F2. Daftar tiket
- Semua tiket dalam satu daftar, terbaru di atas.
- Filter berdasarkan status (baru / dikerjakan / selesai) dan kategori.
- Setiap baris menampilkan: nomor tiket, judul, pelapor + unit kerja,
  kategori, prioritas, status, tanggal lapor.

### F3. Detail & kerjakan tiket (admin)
- Buka satu tiket, lihat seluruh isinya.
- Ubah status: baru → dikerjakan → selesai.
- Saat selesai: tulis tindakan yang dilakukan + tanggal/jam selesai
  tercatat otomatis.
- Status tidak bisa mundur dari selesai ke baru (kalau masalah muncul
  lagi, buat tiket baru).

### F4. Laporan KPI (otomatis)
- Jumlah tiket per bulan.
- Jumlah selesai vs belum selesai.
- Rata-rata lama penyelesaian (dari lapor sampai selesai).
- Kategori masalah yang paling sering muncul.
- Ditampilkan sebagai angka ringkasan + grafik.

## 5. Field tiap tiket (8 field)

1. Nomor tiket otomatis (format `TKT-YYYYMM-####`, mis. `TKT-202611-0007`)
2. Tanggal & jam lapor (otomatis saat tiket dibuat)
3. Nama pelapor + unit kerja (6 unit: IT, Keuangan, SDM, Operasional,
   Bag. Umum, Logistik)
4. Kategori masalah: komputer, printer, jaringan, software
5. Judul & penjelasan masalah
6. Prioritas: rendah / sedang / tinggi
7. Status: baru → dikerjakan → selesai
8. Tanggal & jam selesai + tindakan yang dilakukan

## 6. Bukan bagian dari versi 1

- Notifikasi WA otomatis.
- Lampiran foto pada tiket.
- Eskalasi otomatis (mis. tiket lama belum dikerjakan).
- Multi-admin / pembagian tugas antar teknisi.
- Semua di atas bisa ditambah setelah v1 dipakai.

## 7. Stack (keputusan Chandra, 21 Nov 2026)

- **React + Vite** (frontend), **Supabase** (database PostgreSQL +
  auth + API), **Tailwind CSS** + komponen **beUI**,
  grafik **Shadcn Charts**.
- Alasan: dibangun cepat secara full vibecode; Chandra memilih React
  + Supabase (sebelumnya sempat direncanakan Laravel — dibatalkan
  atas permintaan Chandra).

## 8. Kriteria penerimaan (v1 dianggap selesai bila)

1. Pelapor tanpa login bisa membuat tiket dan melihat nomor tiketnya.
2. Chandra bisa login dan melihat semua tiket.
3. Chandra bisa mengubah status tiket dan menandainya selesai
   beserta tindakan yang dilakukan.
4. Laporan KPI menampilkan 4 metrik di atas dengan angka yang benar
   (dicek terhadap data tiket).
5. Tiket yang sudah selesai tidak bisa diubah statusnya lagi.
6. Pengunjung tanpa login TIDAK bisa melihat daftar tiket orang lain
   (hanya bisa mengirim form).
7. Alur utama lolos tes end-to-end (Playwright): buat tiket →
   muncul di daftar admin → kerjakan → selesai → angka KPI berubah.

## 9. Dokumen terkait

- `ARCHITECTURE.md` — struktur aplikasi & alur data.
- `DATABASE_SCHEMA.md` — tabel, RLS, nomor tiket.
- `DESIGN_SYSTEM.md` — tampilan & komponen.
- `SETUP.md` — perintah pasang skill/MCP untuk agent.
- `AGENTS.md` — aturan main agent yang membangun aplikasi ini.
