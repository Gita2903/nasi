import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNetWeight,
  validateCrateInput,
  calculateScaleStats,
  getNextCrateNumber,
  formatWeightWithTon,
  finalizeBatchRecord,
  calculateGlobalBatchStats,
  getNextBatchNumber,
  generateBatchWhatsAppSummary,
  generateBatchCSV,
  CrateEntry,
} from './scale-calculator';

test('calculateNetWeight calculates correct net weight and rounds to 2 decimals', () => {
  assert.equal(calculateNetWeight(25.5, 1.5), 24.0);
  assert.equal(calculateNetWeight(20.354, 1.2), 19.15);
  assert.equal(calculateNetWeight(0, 1.5), 0);
  assert.equal(calculateNetWeight(-5, 1.5), 0);
  assert.equal(calculateNetWeight(10, 0), 10.0);
});

test('formatWeightWithTon formats kg and ton properly', () => {
  const result1 = formatWeightWithTon(250);
  assert.match(result1.combined, /250.*kg/);
  assert.match(result1.combined, /0,25/); // in id-ID locale or 0.25

  const result2 = formatWeightWithTon(1250.5);
  assert.match(result2.combined, /ton/);
});

test('finalizeBatchRecord aggregates 10 crates into 1 batch with kg and ton stats', () => {
  const tenCrates: CrateEntry[] = Array.from({ length: 10 }, (_, i) => ({
    id: `crate-${i + 1}`,
    crateNumber: i + 1,
    grossWeight: 26.5,
    tareWeight: 1.5,
    netWeight: 25.0,
    riceType: 'frozen Nasi putih',
    timestamp: 1700000000000 + i * 60000,
  }));

  const batch = finalizeBatchRecord(tenCrates, 1, 'Batch Masak #1', 'Budi', 'Selesai tepat waktu');

  assert.equal(batch.batchNumber, 1);
  assert.equal(batch.totalCrates, 10);
  assert.equal(batch.totalGrossKg, 265.0);
  assert.equal(batch.totalTareKg, 15.0);
  assert.equal(batch.totalNetKg, 250.0);
  assert.equal(batch.totalNetTon, 0.25);
  assert.equal(batch.avgNetKg, 25.0);
  assert.equal(batch.crates.length, 10);
});

test('calculateGlobalBatchStats computes totals across multiple batches', () => {
  const batch1 = finalizeBatchRecord(
    [
      {
        id: '1',
        crateNumber: 1,
        grossWeight: 26.5,
        tareWeight: 1.5,
        netWeight: 25.0,
        riceType: 'Pulen',
        timestamp: 1000,
      },
    ],
    1,
    'Batch 1',
    'Budi'
  );

  const batch2 = finalizeBatchRecord(
    [
      {
        id: '2',
        crateNumber: 1,
        grossWeight: 51.5,
        tareWeight: 1.5,
        netWeight: 50.0,
        riceType: 'Pulen',
        timestamp: 2000,
      },
    ],
    2,
    'Batch 2',
    'Budi'
  );

  const globalStats = calculateGlobalBatchStats([batch1, batch2]);
  assert.equal(globalStats.totalBatches, 2);
  assert.equal(globalStats.totalCrates, 2);
  assert.equal(globalStats.totalNetKg, 75.0);
  assert.equal(globalStats.totalNetTon, 0.075);
});

test('generateBatchWhatsAppSummary and generateBatchCSV output correct format', () => {
  const crate: CrateEntry = {
    id: '1',
    crateNumber: 1,
    grossWeight: 26.5,
    tareWeight: 1.5,
    netWeight: 25.0,
    riceType: 'Frozen Nasi Putih',
    timestamp: 1700000000000,
    notes: 'Krat pertama',
  };

  const batch = finalizeBatchRecord([crate], 1, 'Batch Pagi', 'Budi');
  const wa = generateBatchWhatsAppSummary(batch);
  assert.match(wa, /LAPORAN TIMBANGAN NASI - BATCH #1/);
  assert.match(wa, /Nama Batch:\* Batch Pagi/);
  assert.match(wa, /\*1 krat\*/);
  assert.match(wa, /Krat #1:/);

  const csv = generateBatchCSV([batch]);
  assert.match(csv, /Batch #,Nama Batch,No Krat/);
  assert.match(csv, /1,"Batch Pagi",1,"Frozen Nasi Putih",26.5,1.5,25/);
});

test('finalizeBatchRecord picks the most frequent rice type', () => {
  const mk = (n: number, r: string): CrateEntry => ({
    id: `c${n}`, crateNumber: n, grossWeight: 11.5, tareWeight: 1.5,
    netWeight: 10, riceType: r, timestamp: n,
  });
  const b = finalizeBatchRecord([mk(1, 'Nasi Uduk'), mk(2, 'Nasi Kuning'), mk(3, 'Nasi Kuning')], 1);
  assert.equal(b.riceType, 'Nasi Kuning');
});
