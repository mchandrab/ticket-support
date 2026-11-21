# SETUP — Skill & MCP untuk membangun aplikasi tiketing

Versi 1.0 — 21 November 2026
Dijalankan di PC Chandra (Windows). Setiap perintah dilabeli shell-nya.
Satu langkah, satu perintah — konfirmasi berhasil sebelum lanjut.

## 0. Prasyarat

- **Node.js LTS** terpasang. Cek dulu (PowerShell):

  ```powershell
  node -v
  ```

  Kalau `node` tidak dikenal, install Node.js LTS dari
  https://nodejs.org dulu, tutup-buka PowerShell, ulangi cek.
- **Git** terpasang (Git Bash tersedia).
- **Akun Supabase** (gratis) di https://supabase.com — buat
  project baru untuk aplikasi tiketing. Catat dari dashboard
  project (Settings → API): `Project URL` dan `anon public key`.
  Keduanya masuk `.env.local` nanti, BUKAN ke chat ini.
- **OpenCode** terpasang dan `opencode.jsonc` sudah berisi
  provider WFLabs (dari langkah sebelumnya).

## 1. Plugin Ponytail (efisiensi koding)

Ponytail membuat agent menulis kode seminimal mungkin (tanpa
memotong validasi/keamanan). Tambahkan ke
`C:\Users\CHANDRA\.config\opencode\opencode.jsonc`, di level atas
(sejajar `$schema` dan `provider`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["@dietrichgebert/ponytail"],
  "provider": {
    // ... provider wflabs yang sudah ada, jangan dihapus
  }
}
```

Catatan: plugin upstream ini memakai API plugin v1. Kalau
OpenCode di PC sudah versi 2.x dan plugin tidak dimuat, pakai
port v2-nya (PowerShell):

```powershell
opencode plugin add @filecrop/opencode-ponytail-v2
```

Verifikasi: buka OpenCode, ketik `/ponytail` — harus muncul
level aktif (default `full`). Perintah lain: `/ponytail-review`
(review kode), `/ponytail-audit` (audit repo).

## 2. MCP: Context7 + beUI + Playwright

Tambahkan blok `mcp` ke `opencode.jsonc` yang sama (sejajar
`$schema`, `plugin`, `provider`):

```jsonc
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    },
    "beui": {
      "type": "remote",
      "url": "https://mcp.beui.dev/mcp"
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"]
    }
  }
}
```

- **Context7**: dokumentasi terbaru React/Supabase/dll. Tanpa API
  key bisa dipakai (limit rendah); key opsional.
- **beUI**: cari + pasang komponen React (tools:
  `list_components`, `search_components`, `get_component`,
  `get_install_command`). Gratis, tanpa key.
- **Playwright**: tes end-to-end lewat browser. Perlu install
  browser sekali (PowerShell):

  ```powershell
  npx playwright install chromium
  ```

Verifikasi: restart OpenCode, lalu jalankan (PowerShell):

```powershell
opencode mcp list
```

Ketiga MCP (context7, beui, playwright) harus muncul sebagai
connected. Kalau satu gagal, periksa URL/perintahnya huruf
per huruf.

## 3. Skill VibeSec (keamanan)

Skill checklist keamanan (IDOR, XSS, CSRF, secret exposure,
SQLi, file upload, auth/JWT, API). Pasang lewat Git Bash:

```bash
git clone https://github.com/BehiSecc/VibeSec-Skill.git
mkdir -p ~/.config/opencode/skills/VibeSec-Skill
cp VibeSec-Skill/SKILL.md ~/.config/opencode/skills/VibeSec-Skill/SKILL.md
```

Verifikasi (Git Bash):

```bash
wc -l ~/.config/opencode/skills/VibeSec-Skill/SKILL.md
```

Harus sekitar 1339 baris. Lalu buka sesi OpenCode baru.

## 4. Skill Modern Web Guidance (kualitas frontend)

Panduan web modern dari tim Chrome (200+ panduan: HTML/CSS
modern, aksesibilitas, performa, keamanan, form). Pasang lewat
PowerShell (wizard interaktif — pilih OpenCode kalau
ditawarkan):

```powershell
npx modern-web-guidance@latest install
```

Kalau wizard tidak menawarkan OpenCode, pakai fallback:

```powershell
npx skills add GoogleChrome/modern-web-guidance
```

Update belakangan: `npx modern-web-guidance@latest update`.
Telemetri anonim bisa dimatikan dengan `DISABLE_TELEMETRY=1`.

## 5. Skill beUI (komponen React)

Skill ini mengajari agent mengambil komponen dari registry
beUI yang live (bukan mengarang). Pasang lewat PowerShell:

```powershell
npx skills add starc007/ui-components --skill beui
```

Catatan: ini skill versi gratis (MIT). Jangan pasang varian
`beui-pro` — berbayar dan tidak dibutuhkan proyek ini.

## 6. Shadcn Charts (di dalam proyek, saat membangun)

Bukan skill/MCP — dipasang di dalam folder proyek React saat
tahap membangun (PowerShell, dari dalam folder proyek):

```powershell
npx shadcn@latest init
npx shadcn@latest add chart
```

`init` bersifat interaktif (pilih default bila ragu).
Komponen beUI juga dipasang lewat jalur yang sama saat
dibutuhkan, misal:

```powershell
npx shadcn@latest add @beui/table
npx shadcn@latest add @beui/dialog
```

(Daftar komponen tersedia bisa ditanya ke MCP beUI atau skill
beUI — jangan tebak nama slug-nya.)

## 7. UI UX Pro Max — tidak perlu dipasang di PC

Skill desain UI/UX ini sudah terpasang di Muse (di sini) dan
dipakai saat mendesain/mereview tampilan. Panduan desainnya
sudah diringkas ke `DESIGN_SYSTEM.md`, jadi agent di PC tidak
perlu memasangnya terpisah.

## 8. Urutan pasang (ringkas)

1. Node.js + akun Supabase (bagian 0).
2. Ponytail (bagian 1).
3. MCP context7 + beui + playwright (bagian 2) + `opencode mcp list`.
4. VibeSec (bagian 3).
5. Modern Web Guidance (bagian 4).
6. Skill beUI (bagian 5).
7. Shadcn Charts menyusul saat proyek React dibuat (bagian 6).

Setelah semua terpasang, beri tahu Muse — baru mulai membangun
aplikasi.
