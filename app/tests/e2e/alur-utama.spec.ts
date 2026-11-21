import { expect, test } from '@playwright/test'
import { envApp } from '../env'

const email = envApp.TEST_ADMIN_EMAIL
const password = envApp.TEST_ADMIN_PASSWORD

test.skip(!email || !password, 'Isi TEST_ADMIN_EMAIL dan TEST_ADMIN_PASSWORD di .env.test.local')

test('alur utama: buat tiket → muncul di admin → dikerjakan → selesai → KPI berubah', async ({
  browser,
}) => {
  const konteksAdmin = await browser.newContext()
  const admin = await konteksAdmin.newPage()

  await admin.goto('/admin/login')
  await admin.getByLabel('Email').fill(email!)
  await admin.getByLabel('Password').fill(password!)
  await admin.getByRole('button', { name: 'Masuk' }).click()
  await expect(admin.getByRole('heading', { name: /Halo, Chandra/ })).toBeVisible()

  await admin.goto('/admin/laporan')
  const totalAwal = Number(await admin.getByTestId('kpi-total').innerText())
  const selesaiAwal = Number(await admin.getByTestId('kpi-selesai').innerText())

  // --- Pelapor tanpa login membuat tiket ---
  const konteksPublik = await browser.newContext()
  const publik = await konteksPublik.newPage()
  const penanda = `TES E2E ${Date.now()}`

  await publik.goto('/')
  await expect(publik.getByRole('heading', { name: 'Lapor Masalah IT' })).toBeVisible()
  await publik.getByLabel('Nama pelapor').fill(penanda)
  await publik.getByRole('radio', { name: 'Keuangan' }).click()
  await publik.getByRole('radio', { name: 'Jaringan' }).click()
  await publik.getByLabel('Judul masalah').fill('Jaringan ruang kasir putus')
  await publik
    .getByLabel('Penjelasan masalah')
    .fill('Sejak pagi komputer kasir tidak bisa akses aplikasi koperasi.')
  await publik.getByRole('button', { name: 'Kirim Laporan' }).click()

  const nomorTiket = (await publik.getByTestId('nomor-tiket').innerText()).trim()
  expect(nomorTiket).toMatch(/^TKT-\d{6}-\d{4}$/)
  await expect(publik.getByText('Laporan diterima')).toBeVisible()

  // --- Admin melihat tiket baru ---
  await admin.goto('/admin')
  const kartuTiket = admin.getByText(nomorTiket)
  await expect(kartuTiket).toBeVisible()
  await kartuTiket.click()

  await expect(admin.getByRole('heading', { name: 'Jaringan ruang kasir putus' })).toBeVisible()
  await expect(admin.getByText(penanda)).toBeVisible()

  // --- Kerjakan lalu selesaikan ---
  await admin.getByRole('button', { name: 'Mulai Kerjakan' }).click()
  await expect(admin.getByText('Dikerjakan', { exact: true })).toBeVisible()

  await admin
    .getByLabel('Tindakan yang dilakukan')
    .fill('Restart switch ruang kasir dan ganti kabel UTP yang longgar.')
  await admin.getByRole('button', { name: 'Tandai Selesai' }).click()

  await expect(admin.getByText('Selesai', { exact: true })).toBeVisible()
  await expect(admin.getByText('Tiket sudah selesai.')).toBeVisible()
  await expect(admin.getByRole('button', { name: 'Tandai Selesai' })).toHaveCount(0)

  // --- KPI ikut berubah ---
  await admin.goto('/admin/laporan')
  await expect(admin.getByTestId('kpi-total')).toHaveText(String(totalAwal + 1))
  await expect(admin.getByTestId('kpi-selesai')).toHaveText(String(selesaiAwal + 1))

  await konteksPublik.close()
  await konteksAdmin.close()
})
