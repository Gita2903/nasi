# Implementation Plan: Hapus Dummy & Connect ke MySQL

## Kondisi Sekarang
- Next.js 15 (App Router), **semua state di client** (`app/page.tsx`) + `localStorage`. Belum ada backend/API/DB.
- Dummy yang ada di [page.tsx](file:///c:/laragon/www/timbangan-nasi/app/page.tsx):
  - `SAMPLE_10_CRATES`, `INITIAL_BATCHES`, `INITIAL_ACTIVE_CRATES` (L31-58)
  - `handleSeedSampleBatches` (L193-220) + tombol "Muat Contoh Riwayat" di [BatchHistoryList.tsx](file:///c:/laragon/www/timbangan-nasi/components/BatchHistoryList.tsx#L143) (prop `onSeedSampleBatches`)
- Legacy tak terpakai (tidak di-import): `HistoryList.tsx` (punya tombol seed juga), `EditCrateModal.tsx`.
- Env `.env.example` masih berisi `GEMINI_API_KEY`/`APP_URL` (template AI Studio, tidak dipakai kode).
- Logika hitung (`finalizeBatchRecord`, stats) ada di [scale-calculator.ts](file:///c:/laragon/www/timbangan-nasi/lib/scale-calculator.ts) — **dipertahankan**, dipakai ulang di server.

## Keputusan Desain (paling ringan)
- **Driver: `mysql2`** (promise pool), tanpa ORM, tanpa dependency lain. Laragon sudah menyediakan MySQL.
- **API: Route Handlers Next.js** (`app/api/...`). Client `fetch` ke sana; kredensial DB tidak pernah ke browser.
- **Tipe data tetap** (`BatchRecord`, `CrateEntry`, `ScaleSettings`) → komponen UI tidak perlu diubah selain `page.tsx` dan `BatchHistoryList`.
- Timestamp disimpan `BIGINT` (epoch ms) agar cocok dengan tipe `number` yang ada, tanpa konversi.
- Total batch **dihitung ulang di server** dari krat (tidak percaya angka dari client).

## Skema Database (`db/schema.sql`)
```sql
CREATE DATABASE IF NOT EXISTS timbangan_nasi CHARACTER SET utf8mb4;
USE timbangan_nasi;

CREATE TABLE batches (
  id VARCHAR(40) PRIMARY KEY,
  batch_number INT NOT NULL UNIQUE,
  batch_name VARCHAR(120) NOT NULL,
  operator_name VARCHAR(80) NOT NULL,
  rice_type VARCHAR(80) NOT NULL,
  total_crates INT NOT NULL,
  total_gross_kg DECIMAL(10,2) NOT NULL,
  total_tare_kg DECIMAL(10,2) NOT NULL,
  total_net_kg DECIMAL(10,2) NOT NULL,
  total_net_ton DECIMAL(10,3) NOT NULL,
  avg_net_kg DECIMAL(10,2) NOT NULL,
  created_at BIGINT NOT NULL,
  completed_at BIGINT NOT NULL,
  notes TEXT NULL
);

-- krat: batch_id NULL = krat aktif (belum disimpan ke riwayat)
CREATE TABLE crates (
  id VARCHAR(40) PRIMARY KEY,
  batch_id VARCHAR(40) NULL,
  crate_number INT NOT NULL,
  gross_weight DECIMAL(8,2) NOT NULL,
  tare_weight DECIMAL(8,2) NOT NULL,
  net_weight DECIMAL(8,2) NOT NULL,
  rice_type VARCHAR(80) NOT NULL,
  notes TEXT NULL,
  timestamp BIGINT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

-- satu baris pengaturan (belum ada auth/multi-user)
CREATE TABLE settings (
  id TINYINT PRIMARY KEY DEFAULT 1,
  default_tare DECIMAL(5,2) NOT NULL,
  operator_name VARCHAR(80) NOT NULL,
  auto_increment_crate BOOLEAN NOT NULL,
  default_batch_prefix VARCHAR(80) NOT NULL
);
INSERT INTO settings VALUES (1, 1.50, 'Operator Dapur', TRUE, 'Batch Produksi');
```
Satu-satunya seed adalah baris default settings (bukan data dummy; setara `DEFAULT_SETTINGS`).

## Langkah

### 1. Dependency & env
- `npm i mysql2`
- `.env.local` + update `.env.example`: ganti isi GEMINI/APP_URL dengan
  `DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD= DB_NAME=timbangan_nasi`
- Pastikan `.env.local` ada di `.gitignore`.

### 2. `lib/db.ts` (baru)
Pool `mysql2/promise` tunggal (cache di `globalThis` supaya tidak bocor koneksi saat HMR dev).

### 3. API routes (baru)
| Route | Fungsi |
|---|---|
| `GET /api/state` | Mengembalikan `{ batches (+crates), activeCrates, settings }` sekali load |
| `POST /api/crates` | Tambah krat aktif (validasi pakai `validateCrateInput`; net dihitung server) |
| `DELETE /api/crates/[id]` | Hapus 1 krat aktif |
| `DELETE /api/crates` | Kosongkan krat aktif |
| `POST /api/batches` | Finalisasi: dalam **1 transaksi**, ambil krat aktif → `finalizeBatchRecord` → insert batch → set `batch_id` pada krat. `{ notes?, batchName, operatorName }` |
| `DELETE /api/batches/[id]` | Hapus batch (krat ikut terhapus via CASCADE) |
| `DELETE /api/batches` | Hapus semua batch + krat aktif (aksi "Reset") |
| `PUT /api/settings` | Simpan pengaturan |

Nomor batch dihitung di server di dalam transaksi (`MAX(batch_number)+1`), bukan dari client, agar aman bila 2 perangkat memakai aplikasi bersamaan (`UNIQUE` sebagai pengaman).

### 4. Hapus dummy
- [page.tsx](file:///c:/laragon/www/timbangan-nasi/app/page.tsx): hapus `SAMPLE_10_CRATES`, `INITIAL_*`, `handleSeedSampleBatches`, semua `localStorage` & `STORAGE_KEY_*`; state awal `[]`/`DEFAULT_SETTINGS`.
- [BatchHistoryList.tsx](file:///c:/laragon/www/timbangan-nasi/components/BatchHistoryList.tsx): hapus prop `onSeedSampleBatches` + tombol "Muat Contoh Riwayat".
- Hapus file mati `components/HistoryList.tsx` dan `components/EditCrateModal.tsx` (setelah konfirmasi tidak dipakai — grep sudah menunjukkan tidak di-import).
- Hapus `GEMINI_API_KEY` dari env dan `@google/genai` dari `package.json` bila memang tidak dipakai (sudah dicek: tidak ada import di kode).

### 5. Ubah `page.tsx` agar pakai API
- `useEffect` mount → `fetch('/api/state')` → isi state; `isHydrated` tetap dipakai sebagai flag loading.
- Setiap handler (`handleAddCrate`, `handleFinalizeBatch`, delete, reset, simpan settings) memanggil API lalu update state dari respons (bukan optimistik) — bila gagal, tampilkan error sederhana (`alert`/pesan) dan state tidak berubah.
- `ScaleInputForm`/`ActiveBatchPanel`/modal lain tidak berubah.

### 6. Verifikasi
- Jalankan `db/schema.sql` di MySQL Laragon (HeidiSQL / `mysql < db/schema.sql`).
- `npm run lint` dan `npx tsc --noEmit`; tes yang ada (`scale-calculator.test.ts`) tetap hijau.
- Manual: tambah 3 krat → refresh (krat tetap ada) → simpan batch → cek tabel `batches`/`crates` → hapus batch → reset.
- 1 test kecil untuk logika baru di server (finalisasi batch/nomor batch) bila ada test runner; saat ini repo belum punya runner di `package.json`.

## Tidak Dikerjakan (di luar scope)
- Login/multi-user (settings = 1 baris global).
- Migrasi data `localStorage` lama ke MySQL (dianggap data dummy/dibuang).
- Fitur edit krat (komponen lama tidak terpakai).
- ORM/migration tool (`schema.sql` manual sudah cukup).

## Risiko
> [!WARNING]
> Tanpa autentikasi, siapa pun yang bisa membuka URL app bisa menghapus/ubah data via API. Aman bila hanya jaringan lokal; tambahkan auth sebelum dipublikasikan.
> Data lama di `localStorage` browser akan diabaikan (tidak dimigrasi).
