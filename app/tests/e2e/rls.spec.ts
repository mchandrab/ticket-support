import { expect, test } from '@playwright/test'
import { envApp } from '../env'

const url = envApp.VITE_SUPABASE_URL
const anonKey = envApp.VITE_SUPABASE_ANON_KEY
const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  'Content-Type': 'application/json',
}

test('anon tidak bisa membaca tabel tickets', async ({ request }) => {
  const res = await request.get(`${url}/rest/v1/tickets?select=*`, { headers })
  expect(res.ok()).toBe(false)
  const isi = await res.text()
  expect(isi).not.toContain('nomor_tiket')
})

test('anon tidak bisa mengubah status tiket', async ({ request }) => {
  const res = await request.patch(`${url}/rest/v1/tickets?nomor_tiket=eq.TKT-000000-0000`, {
    headers,
    data: { status: 'selesai' },
  })
  expect(res.ok()).toBe(false)
})

test('anon bisa membuat tiket lewat RPC dan menerima nomor tiket', async ({ request }) => {
  const res = await request.post(`${url}/rest/v1/rpc/submit_tiket_publik`, {
    headers,
    data: {
      p_nama_pelapor: 'TES E2E RLS',
      p_unit_kerja: 'IT',
      p_kategori: 'komputer',
      p_judul: 'Tes RLS otomatis',
      p_penjelasan: 'Tiket ini dibuat oleh tes otomatis, bukan laporan sungguhan.',
      p_prioritas: 'rendah',
    },
  })

  expect(res.ok()).toBe(true)
  const nomor = await res.text()
  expect(nomor).toMatch(/^"TKT-\d{6}-\d{4}"$/)
})
