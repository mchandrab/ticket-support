# Design System — Aplikasi Tiketing IT Support

Versi 1.1 — 21 November 2026

## 1. Prinsip

- **Sederhana dan cepat dibaca.** Ini alat kerja internal, bukan
  etalase. Satu layar, satu tugas.
- **Mobile-first & responsif penuh.** Chandra sering memantau dari
  HP, sementara operasional kantor memakai PC/laptop. Layout
  adaptif mulus antara layar kecil (HP) dan layar lebar (desktop).
- **Status langsung kelihatan.** Warna badge status + prioritas
  konsisten di semua halaman.
- Semua teks antarmuka **Bahasa Indonesia**.

## 2. Fondasi & Identitas Visual

- **Tailwind CSS v4** untuk styling.
- **Palet Warna Utama:**
  - Latar halaman: abu-abu terang (`slate-50`), kartu permukaan: putih (`white`) dengan border tipis (`slate-200`).
  - Warna aksi utama (primary brand): biru indigo (`indigo-600`, hover `indigo-700`).
  - Teks utama: gelap (`slate-900`), teks sekunder/keterangan: (`slate-500` / `slate-600`).
- Komponen dari **beUI** (registry shadcn `@beui/...`), dipasang
  per komponen sesuai kebutuhan — jangan pasang semua sekaligus.
  Komponen yang direncanakan: `table`, `dialog`, `sheet` (drawer/bottom-sheet),
  `badge`, `input`, `select`, `textarea`, `button`, `toast`.
- Grafik dari **Shadcn Charts** (berbasis Recharts).
- Font: bawaan sistem (`system-ui`) dengan angka tabular (`tabular-nums`) untuk nomor tiket dan metrik KPI — tanpa unduh font tambahan.
- Ikon: SVG inline (`lucide-react`, yang dipakai beUI/shadcn).
  Jangan pakai emoji sebagai ikon.

## 3. Warna status & prioritas

| Status | Warna badge | Arti |
|---|---|---|
| baru | kuning (amber) | Belum disentuh |
| dikerjakan | biru | Sedang ditangani |
| selesai | hijau | Sudah beres |

| Prioritas | Warna badge |
|---|---|
| rendah | abu-abu |
| sedang | kuning |
| tinggi | merah |

## 4. Layout & Pola Interaksi per Halaman

### Form publik (`/`)
- **Kontainer:** Satu kolom terpusat (`max-w-[640px]` di desktop, penuh dengan padding nyaman di HP), diawali header banner biru-indigo bertajuk **"Lapor Masalah IT"**.
- **Susunan Field:**
  1. **Nama Pelapor** (input teks) & **Unit Kerja** (dropdown 6 unit: IT, Keuangan, SDM, Operasional, Bag. Umum, Logistik) — berdampingan 2 kolom di desktop, bertumpuk di HP.
  2. **Kategori Masalah** — 4 kartu pilihan interaktif dengan ikon (Komputer, Printer, Jaringan, Software) dalam grid 4 kolom di desktop / 2×2 di HP.
  3. **Judul Masalah** (input teks ringkas).
  4. **Penjelasan Detail** (textarea).
  5. **Tingkat Prioritas** — *segmented pill* 3 pilihan (Rendah / Sedang / Tinggi, default: **Sedang**).
- **Tombol Utama:** "Kirim Laporan".
- **Halaman Sukses:** Setelah kirim berhasil, form digantikan kartu konfirmasi berisi ikon sukses hijau, nomor tiket besar berformat `TKT-YYYYMM-####` lengkap dengan tombol **Salin** sekali klik, ringkasan laporan, dan tombol **"Buat Laporan Lagi"**.

### Daftar tiket (`/admin`)
- **Navigasi Atas (Header):**
  - Desktop: Brand + tab navigasi (**Daftar Tiket** dengan badge jumlah tiket baru, **Laporan KPI**), tombol utama **"+ Buat Tiket"** (membuka *modal dialog* input laporan WA/telepon), info profil Chandra, dan tombol **Keluar**.
  - HP: Header ringkas + tombol **"+ Tiket"** + tombol logout, serta *bottom navigation bar* untuk berpindah antara Daftar Tiket dan Laporan KPI.
- **Filter & Pencarian:**
  - Filter cepat berupa *pill/tab* status (**Semua**, **Baru**, **Dikerjakan**, **Selesai**) beserta angka penghitung (*counter*).
  - Dropdown filter **Kategori** + input **Pencarian Cepat** (nomor tiket, judul, pelapor, atau unit).
- **Tampilan Data:**
  - **Desktop:** Tabel lengkap 7 kolom (Nomor Tiket, Judul Masalah, Pelapor & Unit, Kategori, Prioritas, Status, Tanggal Lapor). Klik baris → buka detail.
  - **HP:** Daftar kartu mobile (satu tiket satu kartu) yang menampilkan nomor tiket, status, judul, pelapor + unit, kategori, prioritas, dan waktu lapor.

### Detail & kerjakan tiket (`/admin/tiket/:id` atau panel overlay)
- **Penyajian Responsif:** Menggunakan **Slide-over Drawer** dari sisi kanan pada layar desktop dan **Bottom Sheet** dari bawah pada layar HP (atau halaman terpisah bila diakses langsung via URL).
- **Isi:** Nomor tiket, badge status & prioritas, kategori, judul, pelapor + unit kerja, penjelasan lengkap, serta **Riwayat Status** (waktu dibuat, status dikerjakan, waktu selesai).
- **Aksi Kontekstual:**
  - Status `baru`: Tampilkan tombol **"Mulai Kerjakan"** (mengubah status ke `dikerjakan`).
  - Status `dikerjakan`: Tampilkan textarea wajib **"Tindakan yang Dilakukan"** + tombol **"Tandai Selesai"**.
  - Status `selesai`: Tampilkan kotak hijau berisi tindakan penyelesaian + tanggal/jam selesai; tombol ubah status disembunyikan/dikunci (tidak bisa mundur).

### Laporan KPI (`/admin/laporan`)
- **Filter Periode:** Dropdown bulan di bagian atas (default: bulan berjalan).
- **4 Kartu Metrik Utama** (grid 4 kolom di desktop, grid 2×2 di HP):
  1. Total tiket bulan ini.
  2. Tiket selesai (beserta persentase penyelesaian).
  3. Tiket belum selesai (baru + dikerjakan).
  4. Rata-rata lama penyelesaian (dari lapor hingga selesai).
- **Visualisasi Grafik** (grid 2 kolom proporsional di desktop, bertumpuk di HP):
  - **Grafik Batang:** Tren jumlah tiket per bulan (6 bulan terakhir).
  - **Grafik Donat:** Distribusi tiket per kategori masalah beserta legenda jumlah dan persentase.

## 5. Umpan balik (feedback)

- Aksi sukses (kirim tiket, salin nomor, ubah status): toast hijau singkat.
- Aksi gagal (jaringan / validasi): toast merah dengan pesan
  yang jelas ("Nama pelapor wajib diisi"), bukan kode error.
- Saat data dimuat: tampilkan loading (skeleton/spinner),
  bukan layar kosong.
- Error validasi tampil langsung di bawah field terkait, bukan hanya di atas form.

## 6. Aksesibilitas (minimum)

- Semua input punya label terlihat (bukan hanya placeholder).
- Kontras teks cukup (badge memakai teks gelap di atas latar pastel lembut, misal `text-amber-800` di atas `bg-amber-100`).
- Semua aksi dan kartu pilihan dapat diakses menggunakan keyboard (`Tab` + `Enter`/`Space`).