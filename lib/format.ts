const num = (n: number, digits: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/** 24 -> "24,00" */
export const kg = (n: number) => num(n, 2);

/** 24000 kg -> "24,000" ton */
export const ton = (kgValue: number) => num(kgValue / 1000, 3);

export const timeId = (ts: number) =>
  new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const dateId = (ts: number) =>
  new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
